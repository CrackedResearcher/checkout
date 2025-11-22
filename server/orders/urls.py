from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemUpdateView, CheckoutView, OrderViewSet, AdminStatsView, AdminCouponCreateView

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='orders')

urlpatterns = [

    path("cart/", CartView.as_view(), name='cart-detail'),
    path("cart/item/<int:pk>/", CartItemUpdateView.as_view(), name="cart-item-update"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    
    # admin paths
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/coupon/generate/", AdminCouponCreateView.as_view(), name="admin-coupon-generate"),

    path("", include(router.urls))
]