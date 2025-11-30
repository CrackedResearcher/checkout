from django.contrib import admin
from .models import GlobalOrderCounter, StoreSettings


@admin.register(GlobalOrderCounter)
class GlobalOrderCounterAdmin(admin.ModelAdmin):
    list_display = ("id", "current_count")
    search_fields = ("id",)

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ("key", "value")
    search_fields = ("key",)