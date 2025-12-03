# E-Commerce Platform

A modern, full-stack e-commerce application for cosmetic products featuring Stripe payment integration, intelligent coupon system, and a beautiful, responsive user interface.

<img width="1436" height="758" alt="Screenshot 2025-12-04 at 1 29 10 AM" src="https://github.com/user-attachments/assets/063318b9-e089-4da2-955b-b7529013c73c" />

## ⚡ Quick Run

```bash
git clone <repository-url>
cd checkout
docker-compose up --build
```

Open **http://localhost:3000** and start shopping! The database is pre-populated with sample products.

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

This is a production-ready e-commerce platform built with Django REST Framework and Next.js. The application features real-time product browsing, secure payment processing through Stripe, and a unique "Nth customer" promotional system that rewards customers with discount coupons.

### Key Highlights

- **Seamless Authentication**: Email-based login with automatic user registration
- **Smart Cart Management**: Real-time cart updates with quantity controls
- **Stripe Integration**: Secure payment processing with webhook confirmation
- **Promotional System**: Automated coupon generation for every Nth customer
- **Modern UI/UX**: Responsive design with light/dark theme support
- **Performance Optimized**: Virtual scrolling for large product catalogs
- **Token Management**: Automatic JWT token refresh for uninterrupted sessions

## Features

### Customer Features

- **Product Catalog**

  - Browse cosmetic products with high-quality images
  - Virtualized scrolling for optimal performance with large datasets
  - Real-time pagination and infinite scroll
- **Shopping Cart**

  - Add/remove products with quantity controls
  - Real-time subtotal calculations
  - Persistent cart across sessions
- **Checkout & Payments**

  - Secure Stripe checkout integration
  - Support for discount coupons
  - Order confirmation with detailed receipts
  - Webhook-based payment verification
- **Coupon System**

  - "Try Your Luck" feature for Nth customer promotions
  - 10% discount for lucky customers
  - Automatic coupon application
  - Race-condition-safe coupon allocation
- **Order Management**

  - View complete order history
  - Track order status (Pending, Paid, Shipped, Delivered)
  - Order details with itemized pricing
- **User Experience**

  - Light/dark theme toggle
  - Toast notifications for user actions
  - Responsive design for all devices
  - Smooth animations and transitions

### Admin Features

- Product management (CRUD operations)
- Automatic Stripe product synchronization
- Order tracking and status updates
- Coupon generation and management

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

- **SQLite3** (Development) - File-based database at `server/db.sqlite3`
- **PostgreSQL** (Production ready) - Can be configured in settings

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

### 🚀 Fastest Way: Docker (Recommended)

```bash
git clone <repository-url>
cd checkout
docker-compose up --build
```

Open http://localhost:3000 - **Done!** The app is ready with sample data.

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

**Note**: This project uses **uv** for faster and more reliable Python dependency management. Traditional pip can also work but uv is recommended.

#### 3. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Seed database with sample products
python manage.py populate_products 100

# Set up Nth customer promotion (optional)
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

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **API Docs**: http://localhost:8000/api/v1/docs/
- **Django Admin**: http://localhost:8000/admin/

### Docker Deployment

Docker setup is configured for **development mode** with hot-reloading enabled for both frontend and backend.

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

The database is **already included** with sample products, so you can start using the app immediately!

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

```env
# Stripe Configuration (REQUIRED)
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Note**: Other Django settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS, etc.) are already configured in `server/settings.py` and don't need environment variables for local development.

### Frontend (`web/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Stripe Public Key (optional, for future frontend integration)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
```

### Getting Stripe Keys

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Navigate to **Developers → API Keys**
3. Copy your **Secret key** (sk_test_...) and **Publishable key** (pk_test_...)
4. For webhooks: Use Stripe CLI for local development or create webhook endpoint in dashboard for production

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
python manage.py seed_from_json path/to/products.json
```

### Database Management

```bash
# Create new migration after model changes
python manage.py makemigrations

# View SQL for migration
python manage.py sqlmigrate app_name migration_number

# Reset database (WARNING: deletes all data)
rm server/db.sqlite3
python manage.py migrate
```

## API Documentation

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

## User Flows

### 1. User Registration & Login Flow

```
1. User visits site → Clicks "Login"
2. Enters email and password
3. Backend checks if email exists:
   - EXISTS → Validates password → Returns JWT tokens
   - NOT EXISTS → Creates new user → Returns JWT tokens
4. Frontend stores tokens in localStorage
5. User is redirected to products page
```

### 2. Product Browsing Flow

```
1. User lands on homepage
2. Products load with virtualized scrolling
3. User scrolls down → More products load automatically
4. Click on product → View details
5. Click "Add to Cart" → Item added with toast notification
```

### 3. Shopping Cart Flow

```
1. User navigates to Cart page
2. View all cart items with subtotals
3. Options:
   - Update quantity (+ / - buttons)
   - Remove items (trash icon)
   - Try luck for coupon
   - Apply manual coupon code
4. View total with applied discounts
5. Click "Checkout" → Proceed to payment
```

### 4. Coupon Generation Flow

```
1. User clicks "Try Your Luck" button
2. Backend calculates: (current_orders + 1) % N
3. If eligible (result === 0):
   - Generate unique coupon code
   - Reserve for user with 10-minute expiry
   - Auto-apply to cart
   - Show success toast
4. If not eligible:
   - Show "Better luck next time" message
```

### 5. Checkout & Payment Flow

```
1. User clicks "Checkout" on cart page
2. Backend validates cart and coupon
3. Creates Order with PENDING status
4. Creates OrderItems (snapshot of prices)
5. Creates Stripe Checkout Session
6. User redirected to Stripe payment page
7. User completes payment on Stripe
8. Stripe sends webhook to backend
9. Backend updates order status to PAID
10. Backend clears user's cart
11. User redirected to success page
12. Order appears in order history
```

### 6. Order History Flow

```
1. User navigates to Orders page
2. View list of all past orders
3. Each order shows:
   - Order ID and date
   - Status (Pending, Paid, Shipped, Delivered)
   - Total amount and items
   - Applied discounts
4. Click order → View detailed breakdown
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

## Security Considerations

### Production Checklist

- [ ] Set `DEBUG=False` in Django settings.py
- [ ] Use strong `SECRET_KEY` in settings.py (generate with `django.core.management.utils.get_random_secret_key()`)
- [ ] Use production Stripe keys in .env (starting with `sk_live_`)
- [ ] Enable HTTPS for all endpoints
- [ ] Update `ALLOWED_HOSTS` in settings.py with your domain
- [ ] Use PostgreSQL instead of SQLite (update DATABASE settings in settings.py)
- [ ] Update CORS origins in settings.py (remove localhost, add production domain)
- [ ] Enable rate limiting for API endpoints
- [ ] Set up proper logging and monitoring
- [ ] Never commit `.env` file (already in .gitignore)
- [ ] Set up Stripe webhook endpoint in production with proper URL
- [ ] Configure CSP headers
- [ ] Enable database backups

### Environment Security

```bash
# Add to .gitignore (should already be there)
echo ".env" >> .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "db.sqlite3" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".next/" >> .gitignore

# Never commit secrets
git rm --cached server/.env  # If accidentally committed
```

### JWT Token Security

- Access tokens expire after 50 minutes
- Refresh tokens expire after 1 day
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh on 401 errors

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (if available)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **Backend**: Follow PEP 8 guidelines
- **Frontend**: Use ESLint configuration
- **Commits**: Use conventional commit messages

### Testing

```bash
# Backend tests (when implemented)
python manage.py test

# Frontend tests (when implemented)
npm run test
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check existing issues before creating new ones
- Provide detailed reproduction steps for bugs

## Acknowledgments

- Product data sourced from [Makeup API](http://makeup-api.herokuapp.com/)
- Icons by [Lucide React](https://lucide.dev/)
- Payment processing by [Stripe](https://stripe.com/)

---

Built by CrackedResearcher
