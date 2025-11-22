from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Product
from .serializers import ProductSerializer


@extend_schema(tags=['Products'])
@extend_schema_view(
    list=extend_schema(
        summary="List all products",
        description="Returns a paginated list of all products available in the store.",
        responses={200: ProductSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Get product details",
        description="Retrieve detailed information about a specific product by its ID.",
        responses={200: ProductSerializer}
    ),
    create=extend_schema(
        summary="Create a new product",
        description="Admin only. Adds a new product to the store catalog.",
        responses={201: ProductSerializer}
    ),
    update=extend_schema(
        summary="Update a product",
        description="Admin only. Fully update a product's details.",
        responses={200: ProductSerializer}
    ),
    destroy=extend_schema(
        summary="Delete a product",
        description="Admin only. Remove a product from the catalog.",
        responses={204: None}
    )
)
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        """
        list/retrieve: Allow ANYONE (Public)
        create/update/destroy: Allow only ADMINS
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
            
        return [permission() for permission in permission_classes]