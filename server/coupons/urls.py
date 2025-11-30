from django.urls import path 
from .views import GenerateCouponView

urlpatterns = [
    path('generate/', GenerateCouponView.as_view(), name='generate-coupon'),
]