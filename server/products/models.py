from django.db import models
import logging
from common.models import BaseModel
import stripe
import os

stripe.api_key = os.getenv("STRIPE_API_KEY")


class Product(BaseModel):
    name = models.CharField(max_length=255, db_index=True)
    description = models.CharField(max_length=500, default="")
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail_url = models.URLField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    stripe_product_id = models.CharField(
        max_length=300, db_index=True, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
        }

    def save(self, *args, **kwargs):
        creating = self.pk is None

        if creating:
            logging.debug("Creating Stripe product...")

            product = stripe.Product.create(
                name=self.name,
                description=self.description,
                images=[self.thumbnail_url],
                shippable=True,
            )

            logging.debug(f"Stripe product created: {product.id}")

            self.stripe_product_id = product.id

        else:
            changed_fields = {
                field: getattr(self, field)
                for field, old in self._original.items()
                if getattr(self, field) != old
            }

            if changed_fields:
                logging.debug(f"Changed fields detected: {changed_fields}")

                update_payload = {}

                if "name" in changed_fields:
                    update_payload["name"] = self.name

                if "description" in changed_fields:
                    update_payload["description"] = self.description

                if "thumbnail_url" in changed_fields:
                    update_payload["images"] = [self.thumbnail_url]

                if update_payload:
                    stripe.Product.modify(
                        self.stripe_product_id,
                        **update_payload
                    )
                    logging.debug(f"Stripe updated: {update_payload}")

        super().save(*args, **kwargs)

        self._original = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
        }

    def __str__(self):
        return self.name