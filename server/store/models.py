from django.db import models

class GlobalOrderCounter(models.Model):
    current_count = models.PositiveIntegerField(default=0)

class StoreSettings(models.Model):
    key = models.CharField(max_length=44, unique=True)
    value = models.IntegerField(default=5)

    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.key}: {self.value}"
