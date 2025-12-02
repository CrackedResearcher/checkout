import requests
from django.core.management.base import BaseCommand
from products.models import Product 
import time

class Command(BaseCommand):
    help = 'Seeds database by combining Platzi and DummyJSON APIs'

    def handle(self, *args, **options):
        # 1. Define our two sources
        sources = [
            # Platzi API (approx 200 items)
            {
                "url": "https://api.escuelajs.co/api/v1/products?offset=0&limit=200",
                "mapping": lambda x: {
                    "name": x['title'],
                    "desc": x['description'],
                    "price": x['price'],
                    "img": x['images'][0] if x['images'] else None
                }
            },
            # DummyJSON API (approx 194 items)
            {
                "url": "https://dummyjson.com/products?limit=0",
                "mapping": lambda x: {
                    "name": x['title'],
                    "desc": x['description'],
                    "price": x['price'],
                    "img": x['thumbnail']
                },
                "key": "products" # DummyJSON wraps results in a "products" key
            }
        ]

        total_created = 0

        for source in sources:
            self.stdout.write(f"Fetching from {source['url']}...")
            try:
                resp = requests.get(source['url'])
                data = resp.json()
                
                # Handle different JSON structures
                items = data.get(source.get('key')) if 'key' in source else data

                for item in items:
                    # Apply the mapping function to normalize data
                    mapped = source['mapping'](item)
                    
                    if Product.objects.filter(name=mapped['name']).exists():
                        continue

                    try:
                        p = Product(
                            name=mapped['name'],
                            description=mapped['desc'][:500],
                            quantity=50,
                            price=mapped['price'],
                            thumbnail_url=mapped['img'],
                            is_active=True
                        )
                        p.save() # Triggers Stripe
                        total_created += 1
                        print(f"Created: {p.name}")
                        
                        # Anti-rate-limit sleep
                        if total_created % 10 == 0:
                            time.sleep(0.5)

                    except Exception as e:
                        print(f"Error: {e}")

            except Exception as e:
                print(f"Failed source: {e}")

        self.stdout.write(self.style.SUCCESS(f"Total products created: {total_created}"))