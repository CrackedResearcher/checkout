// types/index.ts

export interface User {
    user_id: number;
    email: string;
  }
  
  export interface AuthResponse {
    message: string;
    user_id: number;
    email: string;
    tokens: {
      access: string;
      refresh: string;
    };
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: string; // Decimal comes as string from Django usually
    thumbnail_url: string;
    stripe_product_id?: string;
  }
  
  export interface CartItem {
    id: number;    
    cart_item_id?: number;
    product: Product;
    quantity: number;  
    subtotal: number;  
  }
  
  export interface CouponResponse {
    message: string;
    coupon_code?: string;
  }
  
  export interface CheckoutResponse {
    checkout_url: string;
  }


  export interface OrderItem {
    id: number;
    product: {
      name: string;
      thumbnail_url: string | null;
    };
    quantity: number;
    price_at_purchase_time: string; // Decimal comes as string from Django usually
  }
  
  export interface Order {
    id: number;
    status: 'PENDING' | 'PAYMENT_FAILED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    total_amount: string;
    discount_amount: string;
    final_amount: string;
    created_at: string;
    items: OrderItem[];
  }