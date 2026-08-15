import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const reference = searchParams.get("reference");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    findOrder();
  }, [reference]);

  async function findOrder() {
    setChecking(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_reference", reference)
      .single();

    if (!error && data) {
      setOrder(data);
    }

    setChecking(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Confirming your payment...</p>
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid payment</h1>
          <p className="mt-2">No payment reference was provided.</p>

          <Link
            to="/"
            className="inline-block mt-6 px-5 py-3 rounded-lg bg-black text-white"
          >
            Back to restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Payment confirmation in progress
          </h1>

          <p className="mt-2">
            We're checking your payment. Please wait a moment.
          </p>

          <button
            onClick={findOrder}
            disabled={checking}
            className="mt-6 px-5 py-3 rounded-lg bg-black text-white"
          >
            {checking ? "Checking..." : "Check payment status"}
          </button>
        </div>
      </div>
    );
  }

  const paid = order.payment_status === "paid";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        <div className="text-5xl mb-4">
          {paid ? "✓" : "⏳"}
        </div>

        <h1 className="text-3xl font-bold">
          {paid ? "Payment Successful" : "Payment Processing"}
        </h1>

        <p className="mt-2 text-gray-600">
          {paid
            ? "Your order has been confirmed."
            : "We're still confirming your payment."}
        </p>

        <div className="mt-8 rounded-xl border p-6 text-left">

          <div className="flex justify-between mb-4">
            <span>Order</span>
            <strong>{order.order_number}</strong>
          </div>

          <div className="flex justify-between mb-4">
            <span>Amount</span>
            <strong>
              ₦{Number(order.total_ngn).toLocaleString()}
            </strong>
          </div>

          <div className="flex justify-between mb-4">
            <span>Delivery</span>
            <span>
              {order.delivery_location_name ||
                order.custom_location ||
                "Delivery"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Status</span>
            <strong>
              {order.status.toUpperCase()}
            </strong>
          </div>

        </div>

        {!paid && (
          <button
            onClick={findOrder}
            disabled={checking}
            className="mt-6 w-full px-5 py-3 rounded-lg bg-black text-white"
          >
            {checking ? "Checking..." : "Check again"}
          </button>
        )}

        {paid && (
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 rounded-lg bg-black text-white"
          >
            Back to restaurant
          </Link>
        )}

      </div>
    </div>
  );
}

export default PaymentSuccess;