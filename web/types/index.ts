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
    product: Product;
    quantity: number;
  }
  
  export interface CouponResponse {
    message: string;
    coupon_code?: string;
  }
  
  export interface CheckoutResponse {
    checkout_url: string;
  }