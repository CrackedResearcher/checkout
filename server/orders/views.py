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
from store.models import StoreSettings, StoreStats
from django.db import transaction
from decimal import Decimal
import uuid


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema_serializer(component_name="AddToCartInputSerializer")
    class InputSerializer(serializers.Serializer):
        product_id = serializers.IntegerField()
        quantity = serializers.IntegerField(min_value=1, default=1)

    @extend_schema(
        summary="View My Cart",
        tags=["Cart"],
        responses={200: CartItemSerializer(many=True)}
    )
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(owner=request.user)
        items = cart.items.select_related('product').all()
        
        return Response(CartItemSerializer(items, many=True).data)

    @extend_schema(
        summary="Add Item to Cart",
        tags=["Cart"],
        request=InputSerializer,
        responses={201: CartItemSerializer}
    )
    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prod_id = serializer.validated_data['product_id']
        qty = serializer.validated_data['quantity']

        product = get_object_or_404(Product, id=prod_id)
        cart, _ = Cart.objects.get_or_create(owner=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += qty
        else:
            cart_item.quantity = qty
        
        cart_item.save()

        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)


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
        responses={200: CartItemSerializer}
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
        summary="Remove Item from Cart",
        tags=["Cart"],
        responses={204: None}
    )
    def delete(self, request, pk):
        cart_item = self.get_item(request.user, pk)
        cart_item.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        coupon_code = request.data.get("coupon_code")

        try:
            cart = Cart.objects.get(owner=user)
            items = cart.items.select_related('product').all()
            if not items.exists():
                return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)


        total_cost = sum(item.product.price * item.quantity for item in items)
        discount_amount = Decimal(0)
        coupon_obj = None

        # validate coupon before placing order
        if coupon_code:
            try:
                # add lock
                coupon_obj = Coupon.objects.select_for_update().get(code=coupon_code)
                
                if coupon_obj.is_valid_coupon():
                    return Response({"error": "Coupon is invalid or expired"}, status=400)

                # apply discount
                discount_amount = (coupon_obj.discount_percent / Decimal(100)) * total_cost
            except Coupon.DoesNotExist:
                return Response({"error": "Invalid coupon code"}, status=400)

        final_amount = total_cost - discount_amount

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_amount=total_cost,
                discount_amount=discount_amount,
                final_amount=final_amount,
                coupon_code_used=coupon_obj, 
                status='IN_PROGRESS'
            )

            # mark coupon as used
            if coupon_obj:
                coupon_obj.is_used = True
                coupon_obj.save()

            # create order item to save price and add a record
            order_items = []
            for item in items:
                order_items.append(OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase_time=item.product.price
                ))
            
            OrderItem.objects.bulk_create(order_items)

            # remove the cart items from cart
            cart.items.all().delete() 

            stats, _ = StoreStats.objects.select_for_update().get_or_create(id=1)
            stats.total_orders += 1
            stats.save()

            new_coupon_code = None
            nth_order = StoreSettings.objects.get(is_active=True)
            N = nth_order.value

            if stats.total_orders % N == 0:
                new_coupon_code = f"WINNER-{uuid.uuid4().hex[:6].upper()}"
                Coupon.objects.create(
                    code=new_coupon_code,
                    discount_percent=10,
                    generated_by_order=order 
                )

        response_data = {
            "message": "Order placed successfully",
            "order_id": order.id,
            "total_paid": final_amount,
        }

        if new_coupon_code:
            response_data["new_coupon_earned"] = new_coupon_code
            response_data["message"] += " - You won a discount code!"

        return Response(response_data, status=status.HTTP_201_CREATED)



class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class AdminStatsView(APIView):
    pass


class AdminCouponCreateView(APIView):
    pass
