// hooks/useStore.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product, CartItem, CouponResponse, Order } from '@/types';
import { toast } from 'sonner'; 
import { useAuth } from '@/providers/Providers';

// Fetch Products
export const useProducts = () => {
  return useInfiniteQuery({
    queryKey: ['products'],
    // 1. Start with offset 0
    initialPageParam: 0,
    
    queryFn: async ({ pageParam = 0 }) => {
      // 2. Pass limit and offset to Django
      // Note: Make sure 'limit' matches what your backend expects (14 in your example)
      const { data } = await api.get(`/products/`, {
        params: {
          limit: 14, 
          offset: pageParam, 
        },
      });
      return data;
    },

    getNextPageParam: (lastPage) => {
      // 3. Handle the "next" logic based on the URL Django sent back
      if (!lastPage.next) return undefined;

      // lastPage.next looks like: "http://.../?limit=14&offset=14&page=3"
      try {
        // Parse the URL to get the 'offset' parameter
        const url = new URL(lastPage.next);
        const nextOffset = url.searchParams.get("offset");
        
        // Return the offset if it exists, otherwise undefined stops the infinite scroll
        return nextOffset ? Number(nextOffset) : undefined;
      } catch (e) {
        return undefined;
      }
    },
  });
};
  

// Fetch Cart
export const useCart = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get<CartItem[]>('/cart/');
      return data;
    },
    retry: false,
    enabled: !!user,
  });
};

// Cart Actions
export const useCartActions = () => {
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async ({ product_id, quantity }: { product_id: number; quantity: number }) => {
      return api.post('/cart/', { product_id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to bag');
    },
    onError: () => toast.error('Please login to add items'),
  });

  const removeFromCart = useMutation({
    mutationFn: async (id: number) => api.delete(`/cart/item/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return api.patch(`/cart/item/${id}/`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => toast.error('Could not update quantity'),
  });
  

  return { addToCart, removeFromCart, updateQuantity };
};

// Coupon Logic
export const useCoupon = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<CouponResponse>('/coupons/generate/');
      return data;
    },
  });
};

// Checkout
export const useCheckout = () => {
  return useMutation({
    mutationFn: async (couponCode: string | null) => {
      const { data } = await api.post<{ checkout_url: string }>('/checkout/', {
        coupon_code: couponCode,
      });
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Checkout failed');
    },
  });
};


export const useOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/');
    
      if (data.results) {
        return data.results as Order[];
      }
      
      return (Array.isArray(data) ? data : []) as Order[];
    },
    enabled: !!user,
  });
};