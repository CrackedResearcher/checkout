from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "price",
        "quantity",
        "is_active",
        "created_at",
        "updated_at",
        "stripe_product_id",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "uuid")
    ordering = ("-created_at",)
    readonly_fields = ("stripe_product_id", "uuid", "created_at", "updated_at")