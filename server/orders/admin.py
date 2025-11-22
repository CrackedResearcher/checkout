from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price_at_purchase_time')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'final_amount',
        'status',
        'coupon_code_used',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__email')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        'product',
        'quantity',
        'price_at_purchase_time',
    )
    search_fields = ('order__id', 'product__name')
    list_filter = ('product',)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'created_at')
    search_fields = ('owner__email',)
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity')
    search_fields = ('cart__owner__email', 'product__name')