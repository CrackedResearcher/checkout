import json
import os
import time
from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Seeds database with Amazon product data from a specific JSON file'

    def handle(self, *args, **options):
        # 1. Target the specific file path
        file_path = '/Users/quantumbyte/Desktop/build/checkout/server/products/management/product_list.json'

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File NOT found at: {file_path}"))
            return

        # 2. Load the JSON
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR("The file contains invalid JSON."))
                return

        self.stdout.write(f"Loaded {len(data)} items. Processing...")

        count = 0
        skipped = 0

        for item in data:
            original_title = item.get('title', 'Unknown Product')
            
            # --- Logic 1: Clean Title (Split by '-' OR max 3 words) ---
            # First, try to split by " - " or just "-"
            if "-" in original_title:
                clean_name = original_title.split('-')[0].strip()
            else:
                clean_name = original_title

            # If the result is still more than 3 words, chop it
            words = clean_name.split()
            if len(words) > 3:
                clean_name = " ".join(words[:3])
            
            # Remove trailing commas/spaces
            clean_name = clean_name.strip(', ')

            # --- Logic 2: Description (Use Title if missing) ---
            description = item.get('description')
            
            # If description is null/None or empty string
            if not description:
                description = f"Product: {original_title}"
            
            # Truncate to 500 chars (Model limit)
            description = description[:500]

            # --- Logic 3: Price ---
            price_data = item.get('price')
            # Handle the structure: "price": { "value": 39.99, "currency": "$" }
            if isinstance(price_data, dict):
                price = price_data.get('value', 19.99)
            else:
                price = 19.99  # Fallback
            
            # Ensure price isn't 0
            if float(price) == 0:
                price = 19.99

            # --- Logic 4: Thumbnail ---
            image_url = item.get('thumbnailImage')

            # --- Logic 5: Save (Triggers Stripe) ---
            
            # Check for duplicates to avoid Stripe errors or duplicate DB entries
            if Product.objects.filter(name=clean_name).exists():
                self.stdout.write(self.style.WARNING(f"Skipped (Duplicate): {clean_name}"))
                skipped += 1
                continue

            try:
                p = Product(
                    name=clean_name,
                    description=description,
                    quantity=50,
                    price=price,
                    thumbnail_url=image_url,
                    is_active=True
                )
                
                # Triggers the Stripe API call in your model's save() method
                p.save() 

                count += 1
                self.stdout.write(self.style.SUCCESS(f"[{count}] Created: {clean_name} (${price})"))

                # Rate limiting for Stripe (safe side)
                if count % 10 == 0:
                    time.sleep(1)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating {clean_name}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"\nCompleted! Created: {count}, Skipped: {skipped}"))