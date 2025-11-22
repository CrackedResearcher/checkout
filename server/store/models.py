from django.db import models

class StoreStats(models.Model):
    # to maintain global count of orders
    total_orders = models.PositiveIntegerField(default=0)


class StoreSettings(models.Model):
    key = models.CharField(max_length=44, unique=True)
    value = models.IntegerField(default=5)

    def __str__(self):
        return f"{self.key}: {self.value}"
