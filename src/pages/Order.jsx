import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Phone, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatNaira } from "@/lib/format";

export default function Order() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: order, error: e1 } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (e1) throw e1;
      const { data: items, error: e2 } = await supabase.from("order_items").select("*").eq("order_id", id);
      if (e2) throw e2;
      return { order, items: items ?? [] };
    },
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Loading order…</p>
        ) : error || !data?.order ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">We couldn't find that order.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/">Back to menu</Link></Button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
                <h1 className="font-display text-2xl font-semibold text-primary">{data.order.order_number}</h1>
                <p className="mt-1 text-sm text-muted-foreground">Thanks {data.order.customer_name.split(" ")[0]}! We've received your order.</p>
              </div>
              <OrderStatusBadge status={data.order.status} />
            </div>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Delivery</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex gap-3"><User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><span>{data.order.customer_name}</span></div>
                <div className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><span>{data.order.customer_phone}</span></div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {(data.order.delivery_region_name || data.order.delivery_location_name) && (
                      <span className="block font-medium">
                        {[data.order.delivery_region_name, data.order.custom_location ?? data.order.delivery_location_name].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {data.order.delivery_address}
                    {data.order.landmark && <span className="block text-muted-foreground">Landmark: {data.order.landmark}</span>}
                  </span>
                </div>
                {data.order.notes && (<div className="rounded-lg bg-muted p-3 text-muted-foreground">Note: {data.order.notes}</div>)}
              </dl>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Items</h2>
              <ul className="mt-4 divide-y divide-border">
                {data.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-3 text-sm">
                    <span>{i.quantity} × {i.name}</span>
                    <span className="font-medium">{formatNaira(i.price_ngn * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatNaira(data.order.subtotal_ngn)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{formatNaira(data.order.delivery_fee_ngn)}</span></div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold text-primary"><span>Total</span><span>{formatNaira(data.order.total_ngn)}</span></div>
              </div>
            </section>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              This page updates automatically. Keep it open to track your order.
            </p>
          </>
        )}
      </div>
    </div>
  );
}