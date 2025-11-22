from django.contrib import admin
from .models import StoreStats, StoreSettings


@admin.register(StoreStats)
class StoreStatsAdmin(admin.ModelAdmin):
    list_display = ("id", "total_orders")
    search_fields = ("id",)

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ("key", "value")
    search_fields = ("key",)