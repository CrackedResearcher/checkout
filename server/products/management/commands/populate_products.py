import requests
from django.core.management.base import BaseCommand
from products.models import Product  
import time

class Command(BaseCommand):
    help = 'Seeds database with real cosmetic products (Maybelline, etc.)'

    def add_arguments(self, parser):
        parser.add_argument('limit', type=int, nargs='?', default=250, help='Number of products to create')

    def handle(self, *args, **options):
        limit = options['limit']
        url = "http://makeup-api.herokuapp.com/api/v1/products.json"

        self.stdout.write("Fetching real brand data...")
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            all_products = response.json()
            self.stdout.write(f"API returned {len(all_products)} total items. Filtering top {limit}...")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"API Error: {e}"))
            return

        count = 0
        for item in all_products:
            if count >= limit:
                break
            
            # This API has real data, but some fields might be empty or too long
            name = item.get('name', 'Unknown Product')
            brand = item.get('brand')
            
            # Combine brand + name for a better title, e.g., "Maybelline - Lipstick"
            if brand:
                full_name = f"{brand.title()} - {name}"
            else:
                full_name = name

            # Clean up price (sometimes it's "0.0" or null in this API)
            price = item.get('price')
            if not price or float(price) == 0:
                price = "19.99" # Fallback price
            
            image = item.get('image_link')
            description = item.get('description') or ""
            # Strip HTML tags if description contains them
            description = description.replace('<p>', '').replace('</p>', '').replace('<br>', '\n')[:500]

            if Product.objects.filter(name=full_name).exists():
                continue

            try:
                p = Product(
                    name=full_name,
                    description=description,
                    quantity=100,
                    price=price,
                    thumbnail_url=image,
                    is_active=True
                )
                p.save() # Triggers Stripe
                
                count += 1
                self.stdout.write(self.style.SUCCESS(f"[{count}/{limit}] Created: {p.name}"))
                
                # Sleep to be safe with Stripe API limits
                if count % 20 == 0:
                    time.sleep(1)

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Skipped {full_name}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} real products."))