from django.db import models
from django.conf import settings
from products.models import Product
from coupons.models import Coupon

# Create your models here.
class Order(models.Model):

    ORDER_CHOICES = [
        ('IN_PROGRESS', 'in progress'),
        ('SHIPPED', 'shipped'),
        ('ON_HOLD', 'on hold'),
        ('DELIVERED', 'delivered'),
        ('CANCELLED', 'cancelled')
    ]   
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_CHOICES, default='IN_PROGRESS')

    coupon_code_used = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_in_orders'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()

    #helps in knowing at what price the product was purchased 
    price_at_purchase_time = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name}({self.quantity}) ordered for {self.price_at_purchase_time}"

class Cart(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.owner.email}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        # will help ensure that the one entry for a product per cart 
        # from next time would increment quantity instead of creating new record.
        unique_together = ('cart', 'product')



