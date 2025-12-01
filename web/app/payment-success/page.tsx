'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          Thank you for your purchase. We've received your order and will begin processing it shortly.
        </p>

        <div className="flex gap-4">
          <Link 
            href="/" 
            className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/orders" // Optional: If you created an orders page
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}