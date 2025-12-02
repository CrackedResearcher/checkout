from email.policy import default
from django.db import models
from django.conf import settings
from django.utils import timezone
from common.models import BaseModel

class Coupon(BaseModel):
    code = models.CharField(max_length=15, unique=True)
    discount_percentage = models.PositiveIntegerField(default=10)

    is_used = models.BooleanField(default=False) 
    is_active = models.BooleanField(default=True)
    
    expires_at = models.DateTimeField(default=timezone.now())
    reserved_at = models.DateTimeField(auto_now_add=True)
    
    # Critical for preventing race conditions
    slot_number = models.PositiveIntegerField(unique=True) 

    reserved_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reserved_coupons'
    )

    def is_valid_for_user(self, user):
        now = timezone.now()
        if self.is_used: return False
        if not self.is_active: return False
        if now > self.expires_at: return False
        if self.reserved_by_user != user: return False
        return True