import time
import requests
from django.core.management.base import BaseCommand
from products.models import Product 
import stripe

class Command(BaseCommand):
    help = 'Populate DB with real product data from DummyJSON API'

    def handle(self, *args, **kwargs):
        self.stdout.write('Fetching data from API...')
        
        # 1. Fetch 100 products from the external API
        url = "https://api.escuelajs.co/api/v1/products"
        response = requests.get(url)
        
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR('Failed to fetch data from API'))
            return

        data = response.json()
        products_list = data['products'] # This is a list of dictionaries

        self.stdout.write(f"Found {len(products_list)} products. Starting import...")

        created_count = 0

        for item in products_list:
            # 2. Extract specific fields from the API data
            name = item.get('title')
            
            # Ensure description isn't too long for your DB field (max 500)
            description = item.get('description', '')
            if len(description) > 495:
                description = description[:495] + "..."

            price = item.get('price')
            stock = item.get('stock', 0)
            
            # DummyJSON provides a 'thumbnail' and 'images' list. We take the thumbnail.
            image_url = item.get('thumbnail')

            # 3. Create the Product object
            try:
                # Check if product already exists to avoid duplicates (optional)
                if Product.objects.filter(name=name).exists():
                    self.stdout.write(f"Skipping {name} (Already exists)")
                    continue

                product = Product(
                    name=name,
                    description=description,
                    price=price,
                    quantity=stock,
                    thumbnail_url=image_url,
                    is_active=True
                )

                # 4. Save (Triggers your Stripe logic in models.py)
                product.save()

                self.stdout.write(self.style.SUCCESS(f'Created: {name} (${price})'))
                created_count += 1
                
                # Sleep to respect Stripe API rate limits (approx 2 requests per second)
                time.sleep(0.5)

            except stripe.error.StripeError as e:
                self.stdout.write(self.style.ERROR(f'Stripe Error for {name}: {e}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'DB Error for {name}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {created_count} products!'))