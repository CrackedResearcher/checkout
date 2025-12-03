# FluxStore E-Commerce Platform

A modern, full stack e-commerce store featuring a variety of luxurious products. Built with Stripe payment integration, intelligent coupon system, and a beautiful, responsive user interface.

<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 29 10 AM" src="https://github.com/user-attachments/assets/063318b9-e089-4da2-955b-b7529013c73c" />

## Quick Run

```bash
git clone <repository-url>
cd checkout
docker-compose up --build
```

Open **http://localhost:3000** to explore the store! The database comes pre-populated with a variety of luxurious products ready to browse.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)

## Overview

This is a production-ready e-commerce store showcasing a curated collection of luxurious products. Built with Django REST Framework and Next.js, the platform allows you to browse products, manage a shopping cart, and complete secure purchases through Stripe. It also features a unique "Nth customer" promotional system that rewards lucky shoppers with discount coupons.

### What You'll Find

- **Variety of Luxurious Products**: Browse a curated collection of premium items
- **Seamless Authentication**: Email-based login with automatic registration
- **Shopping Cart**: Real-time cart updates with quantity controls
- **Secure Payments**: Stripe integration with webhook confirmation
- **Promotional System**: "Try Your Luck" feature - every Nth customer gets a discount coupon
- **Modern UI/UX**: Responsive design with light/dark theme support
- **High Performance**: Virtual scrolling optimized for large product catalogs
- **Smooth Experience**: Automatic JWT token refresh for uninterrupted browsing

## Features

### What You Can Do

- **Browse Products**

  - Explore a variety of luxurious products with high-quality images
  - Virtualized scrolling for smooth browsing of large catalogs
  - Real-time pagination and infinite scroll
- **Shopping Cart**

  - Add/remove products with quantity controls
  - Real-time subtotal calculations
  - Your cart persists across sessions
- **Checkout & Payments**

  - Secure Stripe checkout integration
  - Apply discount coupons for savings
  - Receive order confirmation with detailed receipts
  - Webhook-based payment verification ensures reliability
- **Try Your Luck - Coupon System**

  - Click "Try Your Luck" to see if you're the Nth customer
  - Lucky customers get an instant 10% discount coupon
  - Coupons are automatically applied to your cart
  - Race-condition-safe implementation ensures fairness
- **Order History**

  - View your complete order history
  - Track order status (Pending, Paid, Shipped, Delivered)
  - See itemized pricing for each order
- **User Experience**

  - Toggle between light and dark themes
  - Toast notifications keep you informed
  - Fully responsive - works on desktop, tablet, and mobile
  - Smooth animations and transitions

### Admin Capabilities

- Manage products (Create, Read, Update, Delete)
- Automatic Stripe product synchronization
- Track orders and update statuses
- Generate and manage coupon codes

## Tech Stack

### Backend

| Technology                    | Version | Purpose                       |
| ----------------------------- | ------- | ----------------------------- |
| Python                        | 3.12+   | Programming language          |
| uv                            | latest  | Package manager (recommended) |
| Django                        | 5.2.8   | Web framework                 |
| Django REST Framework         | 3.16.1  | REST API                      |
| djangorestframework-simplejwt | 5.5.1   | JWT authentication            |
| django-cors-headers           | 4.9.0   | CORS handling                 |
| drf-spectacular               | 0.29.0  | API documentation             |
| Stripe                        | 14.0.1  | Payment processing            |
| python-dotenv                 | 1.2.1   | Environment management        |
| Faker                         | 38.2.0  | Test data generation          |

### Frontend

| Technology             | Version | Purpose                 |
| ---------------------- | ------- | ----------------------- |
| Next.js                | 16.0.6  | React framework         |
| React                  | 19.2.0  | UI library              |
| TypeScript             | 5.x     | Type safety             |
| TanStack React Query   | 5.90.11 | Data fetching & caching |
| TanStack React Virtual | 3.13.12 | Virtual scrolling       |
| Tailwind CSS           | 4.x     | Styling                 |
| Axios                  | 1.13.2  | HTTP client             |
| next-themes            | 0.4.6   | Theme management        |
| Sonner                 | 2.0.7   | Toast notifications     |
| Lucide React           | 0.555.0 | Icons                   |

### Database

- **SQLite3** (Development) - File based database at `server/db.sqlite3`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                      (Next.js Frontend)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST API
                      │ (JWT Tokens)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Django REST Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Authentication│  │   Products   │  │    Orders    │      │
│  │     (JWT)     │  │   Catalog    │  │    & Cart    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Coupons    │  │    Users     │  │    Store     │      │
│  │   System     │  │  Management  │  │   Settings   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
                      │                   │ Webhooks
                      │                   │
           ┌──────────▼────────┐    ┌────▼──────────┐
           │   SQLite/Postgres │    │  Stripe API   │
           │     Database      │    │   (Payments)  │
           └───────────────────┘    └───────────────┘
```

### Request Flow

1. **User Authentication**: Email/password → JWT tokens (access + refresh)
2. **Product Browsing**: GET /products → Paginated product list
3. **Add to Cart**: POST /cart → Cart item created/updated
4. **Apply Coupon**: POST /coupons/generate → Check Nth customer eligibility
5. **Checkout**: POST /checkout → Create order + Stripe session
6. **Payment**: Redirect to Stripe → Complete payment
7. **Confirmation**: Stripe webhook → Update order status → Clear cart
8. **View Orders**: GET /orders → User's order history

Image Reference

<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 28 49 AM" src="https://github.com/user-attachments/assets/e14bd931-05f9-4372-b171-445c051cb0ee" />
<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 29 10 AM" src="https://github.com/user-attachments/assets/aa1f2271-35d2-47e1-a205-4894f88a2677" />
<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 29 31 AM" src="https://github.com/user-attachments/assets/8ebd9625-7747-471f-9426-91f3a713c5a3" />
<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 29 51 AM" src="https://github.com/user-attachments/assets/075d2f5a-1097-40f5-8ce1-ec2f331a266b" />
<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 30 51 AM" src="https://github.com/user-attachments/assets/0893ac7f-f6b2-449a-b103-79c9406bb1fe" />
<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 30 45 AM" src="https://github.com/user-attachments/assets/815952dc-4c3f-4659-a3ed-395e3354dc4a" />

## Prerequisites

### For Local Development

- **Python**: 3.12 or higher
- **uv**: Modern Python package installer ([Install uv](https://github.com/astral-sh/uv))
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Stripe Account**: [Sign up for free](https://dashboard.stripe.com/register)
- **Git**: For version control

### For Docker Deployment

- **Docker**: 24.x or higher
- **Docker Compose**: 2.x or higher

## Quick Start

### Fastest Way: Docker (Recommended)

```bash
git clone <repository-url>
cd checkout
docker-compose up --build
```

Open http://localhost:3000 - **Done!** The store is ready with a variety of luxurious products to browse.

---

### Local Development

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd checkout
```

#### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install uv if you haven't already (https://github.com/astral-sh/uv)
# macOS/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows:
# powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Create virtual environment using uv
uv venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies using uv
uv pip sync

# Copy environment template
cp .env.example .env

# Edit .env and add your Stripe keys
# Get test keys from: https://dashboard.stripe.com/test/apikeys
nano .env  # or use your preferred editor
```

**Note**: This project uses **uv** for faster and more reliable Python dependency management. You can also use traditional pip, but uv is recommended for the best experience.

#### 3. Database Setup

```bash
# Run migrations to create database tables
python manage.py migrate

# Seed database with products (100 luxurious items from the Makeup API)
python manage.py populate_products 100

# (Optional) Create superuser for admin access
python manage.py createsuperuser

# (Optional) Set up Nth customer promotion
python manage.py shell
>>> from store.models import StoreSettings
>>> StoreSettings.objects.create(key="nth_order", value=5)  # Every 5th customer gets coupon
>>> exit()
```

#### 4. Start Backend Server

```bash
# Development server (with auto-reload)
python manage.py runserver

# Server will start at http://localhost:8000
# API documentation available at http://localhost:8000/api/v1/docs/
```

#### 5. Frontend Setup

Open a new terminal:

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev

# Frontend will start at http://localhost:3000
```

#### 6. Configure Stripe Webhooks (for local testing)

```bash
# Install Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/v1/stripe/webhook

# Copy the webhook signing secret (whsec_...) to server/.env
```

#### 7. Access the Application

Open these URLs in your browser:

- **Store Frontend**: http://localhost:3000 (Browse and shop)
- **Backend API**: http://localhost:8000/api/v1 (API endpoints)
- **API Documentation**: http://localhost:8000/api/v1/docs/ (Interactive Swagger UI)
- **Django Admin**: http://localhost:8000/admin/ (Admin panel - requires superuser)

### Docker Deployment

Docker setup is configured for **development mode** with hot reloading enabled for both frontend and backend.

**Quick Start (Recommended):**

```bash
# 1. Clone the repository
git clone <repository-url>
cd checkout

# 2. Build and run - that's it!
docker-compose up --build
```

**Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **API Docs**: http://localhost:8000/api/v1/docs/

The database is **already included** with a variety of luxurious products, so you can start exploring the store immediately!

---

#### Advanced Configuration (Optional)

If you want to use your own Stripe keys for testing payments:

```bash
# Copy environment files
cp server/.env.example server/.env
cp web/.env.local.example web/.env.local

# Edit server/.env and add your Stripe keys
nano server/.env
```

Then restart:

```bash
docker-compose down
docker-compose up --build
```

---

#### Docker Commands Reference

```bash
# Run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove database (WARNING: deletes all data)
docker-compose down -v
```

**Note**: The Docker setup includes:

- **Frontend**: Runs `npm run dev` with hot-reload (code changes reflect immediately)
- **Backend**: Runs Django development server with auto-reload
- **Volumes**: Your local code is mounted, so changes are reflected without rebuilding
- **Database**: Pre-populated SQLite database with sample products included

For **production deployment**, use `Dockerfile.prod` for the frontend and update docker-compose.yml accordingly.

---

#### Fresh Database Setup (Optional)

If you want to start with a fresh database instead of the included one:

```bash
# Remove existing database
rm server/db.sqlite3

# Start Docker
docker-compose up --build

# In a new terminal, run migrations and seed data
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py populate_products 100

# Create superuser for admin access (optional)
docker-compose exec backend python manage.py createsuperuser
```

## Environment Variables

### Backend (`server/.env`)

Only Stripe keys are needed to run the application:

```env
# Stripe Configuration (REQUIRED for payment testing)
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Note**: All other settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS, etc.) are already configured in `server/settings.py` - you don't need to set them for local development or testing.

### Frontend (`web/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Getting Stripe Keys (Optional)

The app works without Stripe keys, but if you want to test the full payment flow:

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Navigate to **Developers → API Keys**
3. Copy your **Secret key** (sk_test_...)
4. For webhooks: Run `stripe listen --forward-to localhost:8000/api/v1/stripe/webhook` using Stripe CLI

## Database Setup

### Models Overview

The application uses the following main models:

- **CustomUser**: Email-based authentication, tracks spending and order count
- **Product**: Product catalog with Stripe synchronization
- **Cart/CartItem**: Shopping cart with quantity management
- **Order/OrderItem**: Order tracking with status workflow
- **Coupon**: Discount codes with Nth customer logic

### Running Migrations

```bash
# Local
python manage.py migrate

# Docker
docker-compose exec backend python manage.py migrate
```

### Seeding Data

```bash
# Seed products from makeup API (recommended)
python manage.py populate_products 250

# Seed with general faker data
python manage.py populate_general 100

# Seed from JSON file (if you have one)
python manage.py seed_from_json path/to/product_list.json (this is included in products/management folder - has list of scraped products from amazon)
```

### API Documentation

### Authentication Endpoints

| Method | Endpoint                        | Description                 | Auth Required |
| ------ | ------------------------------- | --------------------------- | ------------- |
| POST   | `/api/v1/auth/login/`         | Login or auto-register user | No            |
| POST   | `/api/v1/auth/token/refresh/` | Refresh access token        | No            |

### Product Endpoints

| Method | Endpoint                   | Description                   | Auth Required |
| ------ | -------------------------- | ----------------------------- | ------------- |
| GET    | `/api/v1/products/`      | List all products (paginated) | No            |
| GET    | `/api/v1/products/{id}/` | Get product details           | No            |
| POST   | `/api/v1/products/`      | Create product (admin)        | Yes           |
| PATCH  | `/api/v1/products/{id}/` | Update product (admin)        | Yes           |
| DELETE | `/api/v1/products/{id}/` | Delete product (admin)        | Yes           |

### Cart Endpoints

| Method | Endpoint                    | Description           | Auth Required |
| ------ | --------------------------- | --------------------- | ------------- |
| GET    | `/api/v1/cart/`           | View user's cart      | Yes           |
| POST   | `/api/v1/cart/`           | Add item to cart      | Yes           |
| PATCH  | `/api/v1/cart/item/{id}/` | Update item quantity  | Yes           |
| DELETE | `/api/v1/cart/item/{id}/` | Remove item from cart | Yes           |

### Order Endpoints

| Method | Endpoint                 | Description                   | Auth Required |
| ------ | ------------------------ | ----------------------------- | ------------- |
| POST   | `/api/v1/checkout/`    | Create order & Stripe session | Yes           |
| GET    | `/api/v1/orders/`      | Get user's order history      | Yes           |
| GET    | `/api/v1/orders/{id}/` | Get order details             | Yes           |

### Coupon Endpoints

| Method | Endpoint                      | Description                         | Auth Required |
| ------ | ----------------------------- | ----------------------------------- | ------------- |
| POST   | `/api/v1/coupons/generate/` | Try to generate Nth customer coupon | Yes           |

### Webhook Endpoints

| Method | Endpoint                   | Description                 | Auth Required           |
| ------ | -------------------------- | --------------------------- | ----------------------- |
| POST   | `/api/v1/stripe/webhook` | Stripe payment confirmation | No (Signature verified) |

### Interactive API Documentation

Access the interactive Swagger UI documentation:

- **Swagger UI**: http://localhost:8000/api/v1/docs/
- **OpenAPI Schema**: http://localhost:8000/api/v1/schema/

## How It Works - User Flows

### 1. Registration & Login

```
1. You visit the store → Click "Login"
2. Enter your email and password
3. Backend checks if email exists:
   - EXISTS → Validates password → Returns JWT tokens
   - NOT EXISTS → Creates account automatically → Returns JWT tokens
4. Tokens saved in localStorage
5. You're redirected to the products page
```

### 2. Browsing Products

```
1. You land on the homepage
2. Products load with virtualized scrolling
3. Scroll down → More products load automatically
4. Click any product → View details
5. Click "Add to Cart" → Item added with toast notification
```

### 3. Shopping Cart

```
1. Navigate to Cart page
2. See all your cart items with subtotals
3. You can:
   - Update quantity (+ / - buttons)
   - Remove items (trash icon)
   - Click "Try Your Luck" for a coupon
   - Manually enter a coupon code
4. See total with applied discounts
5. Click "Checkout" → Proceed to payment
```

### 4. Try Your Luck - Coupon System

```
1. Click "Try Your Luck" button in cart
2. Backend checks: Are you the Nth customer?
3. If YES (you're lucky!):
   - Unique coupon code generated
   - Reserved for you (10-minute expiry)
   - Auto-applied to your cart
   - Success notification shown
4. If NO:
   - "Better luck next time" message
```

### 5. Checkout & Payment

```
1. Click "Checkout" on cart page
2. Backend validates your cart and coupon
3. Order created with PENDING status
4. Order items saved (price snapshot)
5. Stripe Checkout Session created
6. You're redirected to Stripe payment page
7. Complete payment on Stripe
8. Stripe sends webhook to backend
9. Backend updates order to PAID
10. Your cart is cleared
11. You're redirected to success page
12. Order appears in your history
```

### 6. Order History

```
1. Navigate to Orders page
2. See list of all your past orders
3. Each order shows:
   - Order ID and date
   - Status (Pending, Paid, Shipped, Delivered)
   - Total amount and item count
   - Discounts applied
4. Click any order → View detailed breakdown
```

## Project Structure

```
checkout/
├── server/                          # Django Backend
│   ├── server/                      # Project settings
│   │   ├── settings.py              # Django configuration
│   │   ├── urls.py                  # Main URL router
│   │   ├── asgi.py                  # ASGI config
│   │   └── wsgi.py                  # WSGI config
│   │
│   ├── authentication/              # Auth app
│   │   ├── models.py
│   │   ├── views.py                 # Login/Register endpoint
│   │   └── urls.py
│   │
│   ├── users/                       # User management
│   │   ├── models.py                # CustomUser model
│   │   ├── views.py
│   │   └── serializers.py
│   │
│   ├── products/                    # Product catalog
│   │   ├── models.py                # Product model
│   │   ├── views.py                 # ProductViewSet
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── management/
│   │       └── commands/
│   │           ├── populate_products.py    # Seed from API
│   │           ├── populate_general.py     # Faker data
│   │           └── seed_from_json.py       # Import JSON
│   │
│   ├── orders/                      # Orders & Cart
│   │   ├── models.py                # Order, OrderItem, Cart, CartItem
│   │   ├── views.py                 # Cart/Checkout/Order views
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── coupons/                     # Coupon system
│   │   ├── models.py                # Coupon model
│   │   ├── views.py                 # Generate coupon logic
│   │   └── urls.py
│   │
│   ├── store/                       # Store settings
│   │   ├── models.py                # GlobalOrderCounter, StoreSettings
│   │   └── migrations/
│   │
│   ├── common/                      # Shared utilities
│   │   ├── models.py                # BaseModel (UUID, timestamps)
│   │   └── views.py
│   │
│   ├── manage.py                    # Django management script
│   ├── db.sqlite3                   # SQLite database
│   ├── pyproject.toml               # Python dependencies (uv)
│   ├── .env                         # Environment variables (local)
│   ├── .env.example                 # Environment template
│   ├── Dockerfile                   # Docker image definition
│   └── .dockerignore                # Docker ignore file
│
├── web/                             # Next.js Frontend
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage (product listing)
│   │   ├── login/
│   │   │   └── page.tsx             # Login/Register page
│   │   ├── cart/
│   │   │   └── page.tsx             # Shopping cart
│   │   ├── orders/
│   │   │   └── page.tsx             # Order history
│   │   └── payment-success/
│   │       └── page.tsx             # Payment confirmation
│   │
│   ├── components/                  # React components
│   │   ├── Navbar.tsx               # Navigation bar
│   │   └── ProductCard.tsx          # Product display card
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useStore.ts              # TanStack Query hooks
│   │
│   ├── lib/                         # Utilities
│   │   └── api.ts                   # Axios client with interceptors
│   │
│   ├── providers/                   # Context providers
│   │   └── Providers.tsx            # QueryClient, Theme providers
│   │
│   ├── types/                       # TypeScript definitions
│   │   └── index.ts                 # Shared types
│   │
│   ├── public/                      # Static assets
│   ├── package.json                 # Node dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.ts               # Next.js config
│   ├── tailwind.config.ts           # Tailwind config
│   ├── .env.local                   # Frontend env vars (local)
│   ├── .env.local.example           # Frontend env template
│   ├── Dockerfile                   # Docker image definition
│   └── .dockerignore                # Docker ignore file
│
├── docker-compose.yml               # Docker orchestration
└── README.md                        # This file
```

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError" when running Django

```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Reinstall dependencies using uv
uv pip sync

# If uv is not installed, install it first:
curl -LsSf https://astral.sh/uv/install.sh | sh  # macOS/Linux
```

#### "CORS error" when calling API from frontend

- Check `CORS_ALLOWED_ORIGINS` in `server/settings.py`
- Ensure frontend URL is included (e.g., `http://localhost:3000`)
- Restart Django server after changes

#### "Stripe API error" during checkout

- Verify `STRIPE_API_KEY` in `.env` is correct
- Ensure you're using test keys (starting with `sk_test_`)
- Check Stripe dashboard for API errors

#### Webhook not receiving events

```bash
# For local development, use Stripe CLI
stripe listen --forward-to localhost:8000/api/v1/stripe/webhook

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Issues

#### "Cannot connect to API" errors

- Verify backend is running at `http://localhost:8000`
- Check `API_URL` in `web/lib/api.ts` matches backend URL
- Check browser console for CORS errors

#### "Token expired" errors

- Token refresh logic is automatic via Axios interceptor
- If issue persists, clear localStorage and login again:

```javascript
localStorage.clear()
```

#### Build errors with Next.js

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Docker Issues

#### "Port already in use" error

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Kill process or change port in docker-compose.yml
```

#### "Cannot connect to database" in Docker

```bash
# Ensure all services are running
docker-compose ps

# Check logs for database service
docker-compose logs backend

# Restart services
docker-compose restart
```

#### Changes not reflecting in Docker

The Docker setup uses volumes for hot-reloading, so code changes should reflect automatically. If they don't:

```bash
# Restart the specific service
docker-compose restart frontend  # For frontend changes
docker-compose restart backend   # For backend changes

# If still not working, rebuild images
docker-compose up --build

# Force rebuild without cache
docker-compose build --no-cache
```

#### Frontend hot-reload not working in Docker

```bash
# Ensure WATCHPACK_POLLING is set in docker-compose.yml (already configured)
# Restart frontend service
docker-compose restart frontend
```

---

Built by CrackedResearcher
