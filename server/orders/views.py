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
from .serializers import CartItemSerializer
from coupons.models import Coupon
from django.db import transaction
from decimal import Decimal
from store.models import GlobalOrderCounter
import stripe


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
        payload = request.data
        sig_header = request.headers.get("STRIPE_SIGNATURE")
        event = None
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

        print("\n\n\n\nRECEIVED WEBHOOK ==> ", payload, "\n\n\n\n")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError as e:
            return Response(
                {"details": "payment failed"}, status=status.HTTP_400_BAD_REQUEST
            )

        except stripe.error.SignatureVerificationError as e:
            return Response(
                {"details": "payment failed"}, status=status.HTTP_400_BAD_REQUEST
            )

        event_dict = event.to_dict()
        if event_dict["type"] == "payment_intent.succeeded":
            _ = event_dict["data"]["object"]
            return Response(
                {"details": "Order placed successfully!"},
                status=status.HTTP_201_CREATED,
            )
        elif event_dict["type"] == "payment_intent.payment_failed":
            return Response(
                {"details": "payment failed"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"details": "Order placed successfully!"}, status=status.HTTP_201_CREATED
        )


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get("coupon_code")

        # 1. Get Cart
        cart = get_object_or_404(Cart, owner=user)
        items = cart.items.select_related("product").all()
        if not items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        # 2. Start Transaction (Everything from here is atomic)
        with transaction.atomic():
            # 3. Calculate Totals
            total_cost = sum(item.product.price * item.quantity for item in items)
            discount_amount = Decimal(0)
            coupon_obj = None

            # 4. Validate Coupon (With Locking)
            if coupon_code:
                try:
                    # Lock the coupon row so it can't be used twice concurrently
                    coupon_obj = Coupon.objects.select_for_update().get(
                        code=coupon_code
                    )

                    # Use the correct model method
                    if not coupon_obj.is_valid_for_user(user):
                        return Response(
                            {"error": "Coupon is invalid, expired, or not yours"},
                            status=400,
                        )

                    # Apply Discount
                    discount_amount = (
                        Decimal(coupon_obj.discount_percentage) / Decimal(100)
                    ) * total_cost

                except Coupon.DoesNotExist:
                    return Response({"error": "Invalid coupon code"}, status=400)

            final_amount = total_cost - discount_amount

            # 5. Create Order
            order = Order.objects.create(
                user=user,
                total_amount=total_cost,
                discount_amount=discount_amount,
                final_amount=final_amount,
                coupon_used=coupon_obj, 
                status="COMPLETED",
            )

            # 6. Mark Coupon Used
            if coupon_obj:
                coupon_obj.is_used = True
                coupon_obj.save()

            # 7. Create Order Items (Bulk Create)
            order_items = [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase_time=item.product.price,
                )
                for item in items
            ]
            OrderItem.objects.bulk_create(order_items)

            # 8. Clear Cart
            cart.items.all().delete()

            # 9. Increment Global Counter (The final step)
            # We lock it, increment it, and release.
            counter_obj, _ = (
                GlobalOrderCounter.objects.select_for_update().get_or_create(id=1)
            )
            counter_obj.current_count += 1
            counter_obj.save()

            line_items = []

            for item in items:
                price_obj = stripe.Price.create(
                    currency="usd",
                    unit_amount=int(item.product.price * 100),  # convert to cents
                    product=item.product.stripe_product_id,
                )

                line_items.append({"price": price_obj.id, "quantity": item.quantity})

            checkout_session = stripe.checkout.Session.create(
                line_items=line_items,
                mode="payment",
                success_url="http://localhost:8000/api/v1/payment/status?success=true",
                cancel_url="http://localhost:8000/api/v1/payment/status?canceled=true",
            )

        return Response(
            {
                "checkout_url": checkout_session.url,
                "message": "Order placed successfully",
                "order_id": order.id,
                "total_paid": final_amount,
                "discount_applied": discount_amount,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class AdminStatsView(APIView):
    pass


class AdminCouponCreateView(APIView):
    pass
