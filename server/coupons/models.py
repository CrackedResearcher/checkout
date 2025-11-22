from django.db import models

# Create your models here.
class Coupon(models.Model):
    code = models.CharField(max_length=15, unique=True)
    discount_percentage = models.PositiveIntegerField(default=10)

    is_active = models.BooleanField(default=True)
    is_used = models.BooleanField(default=True)

    generated_by_order = models.OneToOneField(
        'orders.Order',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='generated_coupon'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_valid_coupon(self):
        return not self.is_used and self.is_active