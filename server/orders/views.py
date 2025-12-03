from math import prod
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_serializer

from .models import Cart, CartItem, Order, OrderItem
from products.models import Product
from .serializers import CartItemSerializer, OrderSerializer 
from coupons.models import Coupon
from django.db import transaction
from decimal import Decimal
from store.models import GlobalOrderCounter
import stripe
import logging

logger = logging.getLogger(__name__)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema_serializer(component_name="AddToCartInputSerializer")
    class InputSerializer(serializers.Serializer):
        product_id = serializers.IntegerField()
        quantity = serializers.IntegerField(min_value=1, default=1)

    @extend_schema(
        summary="View My Cart",
        tags=["Cart"],
        responses={200: CartItemSerializer(many=True)},
    )
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(owner=request.user)
        items = cart.items.select_related("product").all()

        return Response(CartItemSerializer(items, many=True).data)

    @extend_schema(
        summary="Add Item to Cart",
        tags=["Cart"],
        request=InputSerializer,
        responses={201: CartItemSerializer},
    )
    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prod_id = serializer.validated_data["product_id"]
        qty = serializer.validated_data["quantity"]

        product = get_object_or_404(Product, id=prod_id)
        cart, _ = Cart.objects.get_or_create(owner=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += qty
        else:
            cart_item.quantity = qty

        cart_item.save()

        return Response(
            CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED
        )


class CartItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema_serializer(component_name="UpdateCartItemInput")
    class InputSerializer(serializers.Serializer):
        quantity = serializers.IntegerField(min_value=1)

    def get_item(self, user, pk):
        return get_object_or_404(CartItem, id=pk, cart__owner=user)

    @extend_schema(
        summary="Update Item Quantity",
        description="Updates the quantity of a specific line item.",
        tags=["Cart"],
        request=InputSerializer,
        responses={200: CartItemSerializer},
    )
    def patch(self, request, pk):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_qty = serializer.validated_data["quantity"]

        cart_item = self.get_item(request.user, pk)

        cart_item.quantity = new_qty
        cart_item.save()

        return Response(CartItemSerializer(cart_item).data)

    @extend_schema(
        summary="Remove Item from Cart", tags=["Cart"], responses={204: None}
    )
    def delete(self, request, pk):
        cart_item = self.get_item(request.user, pk)
        cart_item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class StripePaymentUpdateWebhookView(APIView):
    def post(self, request):
        payload = request.body 
        sig_header = request.headers.get("STRIPE_SIGNATURE")
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle Successful Payment
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            
            order_id = session["metadata"].get("order_id")
            user_id = session["metadata"].get("user_id")

            try:
                order = Order.objects.get(id=order_id)
                
                order.status = "PAID"
                order.save()

                stats, _ = GlobalOrderCounter.objects.select_for_update().get_or_create(id=1)
                stats.current_count += 1
                stats.save()

                Cart.objects.filter(owner_id=user_id).first().items.all().delete()
                
            except Order.DoesNotExist:
                return Response(status=404)

        return Response(status=status.HTTP_200_OK)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get("coupon_code")

        cart = get_object_or_404(Cart, owner=user)
        items = cart.items.select_related("product").all()
        if not items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        # 1. Validation Logic (Coupons, etc.)
        total_cost = sum(item.product.price * item.quantity for item in items)
        discount_amount = Decimal(0)
        coupon_obj = None

        if coupon_code:
            try:
                # We LOCK the coupon here so they can't spam it in multiple tabs
                coupon_obj = Coupon.objects.select_for_update().get(code=coupon_code)
                if not coupon_obj.is_valid_for_user(user):
                    return Response({"error": "Invalid Coupon"}, status=400)
                
                discount_amount = (Decimal(coupon_obj.discount_percentage) / 100) * total_cost
            except Coupon.DoesNotExist:
                return Response({"error": "Invalid Code"}, status=400)

        final_amount = total_cost - discount_amount

        MAX_USD_LIMIT = Decimal(25000.00) 
        
        if final_amount > MAX_USD_LIMIT:
            return Response(
                {
                    "error": "Transaction limit exceeded.",
                    "detail": f"Due to regulatory limits, we cannot process orders above ${MAX_USD_LIMIT} in a single transaction."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Create Order with PENDING status
        # We do NOT clear the cart yet.
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_amount=total_cost,
                discount_amount=discount_amount,
                final_amount=final_amount,
                coupon_used=coupon_obj, 
                status="PENDING", # Wait for webhook
            )

            # Create OrderItems (Snapshot of prices)
            order_items = [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase_time=item.product.price,
                ) for item in items
            ]
            OrderItem.objects.bulk_create(order_items)

            stripe_discounts = []
            if coupon_obj:
                if coupon_obj.stripe_coupon_id:
                    stripe_discounts = [{'coupon': coupon_obj.stripe_coupon_id}]
                else:
                    try:
                        s_coupon = stripe.Coupon.create(
                        percent_off=coupon_obj.discount_percentage,
                        duration="once"
                    )
                        coupon_obj.stripe_coupon_id = s_coupon.id 
                        coupon_obj.save(update_fields=['stripe_coupon_id'])
                    except Exception as e:
                        logger.error(f"Error creating Stripe coupon: {e}")
                        return Response({"error": "Payment provider error"}, status=500)


            line_items = []
            for item in items:
                line_items.append({
                    'price_data': {
                        'currency': 'usd',
                        'product': item.product.stripe_product_id,
                        'unit_amount': int(item.product.price * 100),
                    },
                    'quantity': item.quantity,
                })
            
            if coupon_obj:
                coupon_obj.is_used = True
                coupon_obj.save()

            checkout_session = stripe.checkout.Session.create(
                line_items=line_items,
                mode="payment",
                discounts=stripe_discounts, 
                customer_email=user.email,
                success_url=f"http://localhost:3000/payment-success?order_id={order.id}",
                cancel_url=f"http://localhost:3000/payment-failed?order_id={order.id}",
                metadata={
                    "order_id": order.id,
                    "user_id": user.id
                }
            )

        return Response({"checkout_url": checkout_session.url})


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer 

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class AdminStatsView(APIView):
    pass


class AdminCouponCreateView(APIView):
    pass
