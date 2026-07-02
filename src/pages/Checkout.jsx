import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart.jsx";
import { formatNaira } from "@/lib/format";

const DELIVERY_FEE = 1500;

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
  customer_phone: z.string().trim().min(7, "Enter a valid phone number").max(20).regex(/^[+\d\s-]+$/, "Numbers only"),
  delivery_address: z.string().trim().min(6, "Please enter a delivery address").max(300),
  notes: z.string().trim().max(500).optional().default(""),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", delivery_address: "", notes: "" });
  const total = useMemo(() => subtotal + (items.length ? DELIVERY_FEE : 0), [subtotal, items.length]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the form"); return; }
    setSubmitting(true);
    try {
      const paymentReference = "PSK_PLACEHOLDER_" + Date.now();
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({ ...parsed.data, subtotal_ngn: subtotal, delivery_fee_ngn: DELIVERY_FEE, total_ngn: total, payment_reference: paymentReference })
        .select()
        .single();
      if (orderErr || !order) throw orderErr ?? new Error("Failed to place order");

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({ order_id: order.id, menu_item_id: i.id, name: i.name, price_ngn: i.price, quantity: i.quantity })),
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed!");
      navigate(`/order/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </Link>
        <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-muted-foreground">Where should we bring your order?</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/">Browse menu</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Adaeze Okonkwo" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="+234 800 000 0000" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Delivery address</Label>
                <Textarea id="address" value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} placeholder="12 Awolowo Way, Ikeja, Lagos" rows={2} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Order notes (optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Extra pepper, no plantain, gate code…" rows={2} />
              </div>

              <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CreditCard className="h-4 w-4 text-accent" /> Payment via Paystack
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Real Paystack checkout will open here. For now we save your order and issue a placeholder reference.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing order…</> : `Pay ${formatNaira(total)}`}
              </Button>
            </form>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Order summary</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{i.quantity} × {i.name}</span>
                    <span className="shrink-0 font-medium">{formatNaira(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{formatNaira(DELIVERY_FEE)}</span></div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold text-primary"><span>Total</span><span>{formatNaira(total)}</span></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}