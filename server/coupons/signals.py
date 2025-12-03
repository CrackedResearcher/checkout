# coupons/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Coupon
import stripe
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Coupon)
def create_stripe_coupon(sender, instance, created, **kwargs):
    """
    Triggers automatically AFTER a Coupon is saved to the DB.
    """
    if created and not instance.stripe_coupon_id:
        try:
            logger.info(f"Syncing coupon {instance.code} to Stripe...")
            
            # Create the Coupon in Stripe
            stripe_coupon = stripe.Coupon.create(
                name=instance.code,
                percent_off=instance.discount_percentage,
                duration="once", 
                max_redemptions=1, # 1 time use
                metadata={
                    "slot_number": instance.slot_number,
                    "user_id": instance.reserved_by_user.id
                }
            )

            instance.stripe_coupon_id = stripe_coupon.id
            instance.save(update_fields=['stripe_coupon_id'])
            
            logger.info(f"Stripe Coupon Created: {stripe_coupon.id}")

        except Exception as e:
            logger.error(f"Failed to create Stripe coupon: {e}")