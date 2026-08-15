import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CartProvider } from "@/lib/cart.jsx";
import { Toaster } from "@/components/ui/sonner";

import Index from "@/pages/Index.jsx";
import Auth from "@/pages/Auth.jsx";
import Checkout from "@/pages/Checkout.jsx";
import Order from "@/pages/Order.jsx";
import Admin from "@/pages/Admin.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import NotFound from "@/pages/NotFound.jsx";
import ProtectedRoute from "@/components/protected-route.jsx";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout" element={<Checkout />} />
            
            <Route path="/order/:id" element={<Order />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={<PaymentSuccess />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}