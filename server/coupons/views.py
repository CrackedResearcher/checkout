from venv import logger
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from coupons.models import Coupon
from store.models import StoreSettings
from django.db import transaction
import uuid
from django.utils import timezone 
from datetime import timedelta
from store.models import GlobalOrderCounter



class GenerateCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Get the Nth setting
        try:
            setting = StoreSettings.objects.get(key="nth_order")
            N = setting.value
        except StoreSettings.DoesNotExist:
            return Response({"message": "Promotion not active"}, status=400)

        with transaction.atomic():
            # 2. Lock the Global Counter
            counter_obj, _ = GlobalOrderCounter.objects.select_for_update().get_or_create(id=1)
            
            # 3. Calculate Virtual Slot (Current Orders + This Request)
            # We do not increment the counter yet, we just peek ahead
            next_slot = counter_obj.current_count + 1

            if next_slot % N == 0:
                # 4. LUCKY! Create a reservation coupon
                # This might fail if someone else grabbed it 1ms ago (IntegrityError)
                try:
                    code = f"LUCKY-{next_slot}-{uuid.uuid4().hex[:4].upper()}"
                    coupon = Coupon.objects.create(
                        code=code,
                        discount_percentage=10,
                        slot_number=next_slot,
                        reserved_by_user=request.user,
                        expires_at=timezone.now() + timedelta(minutes=10)
                    )
                    return Response({
                        "message": f"Congratulations! You are the {N}th customer.",
                        "coupon_code": coupon.code,
                        "discounted_percentage": str(coupon.discount_percentage) + "% off"
                    }, status=201)
                except Exception as e:
                    # Slot was taken in the split second
                    logger.info(f"error occured during coupon generation - {str(e)}")
                    transaction.set_rollback(True) 
                    return Response({"Better luck next time!"}, status=200)
            
            return Response({"message": "Better luck next time!"}, status=200)