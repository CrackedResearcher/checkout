from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        # We don't need to worry about username anymore
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    # Add this line to remove the username field completely
    username = None 

    email = models.EmailField(unique=True)

    name = models.CharField(max_length=100, blank=True)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    shipping_address = models.CharField(max_length=400, blank=True)

    USERNAME_FIELD = "email"       
    REQUIRED_FIELDS = []          

    objects = UserManager()

    def __str__(self):
        return self.email