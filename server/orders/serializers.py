# orders/serializers.py
from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    cart_item_id = serializers.IntegerField(source='id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    thumbnail = serializers.URLField(source='product.thumbnail_url', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'cart_item_id', 'product', 'product_name', 'price', 'quantity', 'thumbnail', 'subtotal']

    def get_subtotal(self, obj):
        return obj.quantity * obj.product.price