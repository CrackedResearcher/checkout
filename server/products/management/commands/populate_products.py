import random
from django.core.management.base import BaseCommand
from products.models import Product
from faker import Faker

class Command(BaseCommand):
    help = 'Populate the database with dummy products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        fake = Faker()
        
        # A list of adjectives and nouns to mix and match for product names
        adjectives = ['Rustic', 'Sleek', 'Modern', 'Vintage', 'Ergonomic', 'Durable', 'Premium', 'Wireless', 'Portable', 'Smart']
        nouns = ['Laptop', 'Chair', 'Headphones', 'Watch', 'Bottle', 'Keyboard', 'Shoes', 'Wallet', 'Camera', 'Table', 'Lamp', 'Backpack']
        
        products_batch = []

        for i in range(400):
            # 1. Generate a catchy name
            name = f"{random.choice(adjectives)} {random.choice(nouns)} {fake.word().title()}"
            
            # 2. Generate random price between $10 and $1000
            price = round(random.uniform(10.00, 1000.00), 2)
            
            # 3. Random Quantity (Some out of stock for testing)
            quantity = random.choices([0, random.randint(1, 50), random.randint(50, 200)], weights=[5, 45, 50])[0]
            
            # 4. Random Image URL (Using Lorem Picsum with a seed so image stays constant)
            # We use the index 'i' to ensure every product gets a slightly different image
            thumbnail_url = f"https://picsum.photos/seed/{i}/300/300"

            product = Product(
                name=name,
                price=price,
                quantity=quantity,
                thumbnail_url=thumbnail_url,
                is_active=True
            )
            products_batch.append(product)

        # 5. Bulk Create (One DB query instead of 400)
        Product.objects.bulk_create(products_batch)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(products_batch)} products!'))