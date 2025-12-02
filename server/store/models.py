from django.db import models
from common.models import BaseModel

class GlobalOrderCounter(BaseModel):
    current_count = models.PositiveIntegerField(default=0)

class StoreSettings(BaseModel):
    key = models.CharField(max_length=44, unique=True)
    value = models.IntegerField(default=5)

    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.key}: {self.value}"
