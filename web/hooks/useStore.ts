// hooks/useStore.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product, CartItem, CouponResponse } from '@/types';
import { toast } from 'sonner'; 
import { useAuth } from '@/providers/Providers';

// Fetch Products
export const useProducts = () => {
    return useInfiniteQuery({
      queryKey: ['products'],
      initialPageParam: 1,
      queryFn: async ({ pageParam = 1 }) => {
        // Pass the page number to Django
        const { data } = await api.get(`/products/?page=${pageParam}`);
        return data;
      },
      getNextPageParam: (lastPage, allPages) => {
        // Django returns "next": "http://.../?page=2" or null
        // If "next" exists, we increment the page number
        return lastPage.next ? allPages.length + 1 : undefined;
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