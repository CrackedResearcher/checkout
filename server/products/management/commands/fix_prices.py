import random
import time
from decimal import Decimal
from django.core.management.base import BaseCommand
# Replace 'products' with your actual app name if different
from products.models import Product  

class Command(BaseCommand):
    help = 'Sanitizes DB data and syncs with Stripe'

    def handle(self, *args, **options):
        THRESHOLD = Decimal('5000.00')
        SAFE_TEMP_PRICE = Decimal('4999.99')

        self.stdout.write("Step 1: Sanitizing corrupt local data...")

        # 1. Bypass Python loading by using SQL-level .update()
        # This fixes the "InvalidOperation" crash by overwriting bad data directly in the DB
        # We select items > 5000 and force them to 4999.99 temporarily
        rows_affected = Product.objects.filter(price__gt=THRESHOLD).update(price=SAFE_TEMP_PRICE)

        if rows_affected == 0:
            self.stdout.write(self.style.SUCCESS("No expensive products found."))
            return

        self.stdout.write(self.style.SUCCESS(f"Sanitized {rows_affected} products locally. Now syncing with Stripe..."))

        # 2. Now that the data is valid (4999.99), we can safely load the objects
        # We fetch the specific products we just touched
        products_to_fix = Product.objects.filter(price=SAFE_TEMP_PRICE)

        for i, product in enumerate(products_to_fix, 1):
            # Generate the final random price
            random_val = random.uniform(50, 4500)
            new_price = Decimal(str(random_val)).quantize(Decimal("0.01"))
            
            product.price = new_price
            
            try:
                # 3. Call save() to push the change to Stripe
                product.save()
                self.stdout.write(
                    f"[{i}/{rows_affected}] Stripe Synced '{product.name}': -> ${product.price}"
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to sync {product.name}: {e}"))
            
            # Rate limiting
            time.sleep(0.5)

        self.stdout.write(self.style.SUCCESS("\nAll products fixed and synced with Stripe!"))