from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

# 1. Create a Router
router = DefaultRouter()

# 2. Register your ViewSet
# r'' means empty prefix because we will set the prefix in the main urls.py
router.register(r'', ProductViewSet, basename='products')

# 3. automatic URL generation
urlpatterns = [
    path('', include(router.urls)),
]