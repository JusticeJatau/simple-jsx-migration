import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Loader2, CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/lib/cart.jsx";
import { formatNaira } from "@/lib/format";
import {
  CUSTOM_LOCATION_VALUE,
  resolveDeliveryFee,
  useDeliveryLocations,
  useDeliveryRegions,
} from "@/lib/delivery";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
  customer_phone: z.string().trim().min(7, "Enter a valid phone number").max(20).regex(/^[+\d\s-]+$/, "Numbers only"),
  delivery_address: z.string().trim().min(6, "Please enter a delivery address").max(300),
  landmark: z.string().trim().max(160).optional().default(""),
  custom_location: z.string().trim().max(160).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [regionId, setRegionId] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    landmark: "",
    custom_location: "",
    notes: "",
  });

  const { data: regions = [], isLoading: regionsLoading } = useDeliveryRegions();
  const { data: locations = [], isLoading: locationsLoading } = useDeliveryLocations(regionId);

  useEffect(() => {
    if (!regionId && regions.length) setRegionId(regions[0].id);
  }, [regions, regionId]);

  const region = regions.find((r) => r.id === regionId) ?? null;
  const isCustom = locationValue === CUSTOM_LOCATION_VALUE;
  const location = isCustom ? null : locations.find((l) => l.id === locationValue) ?? null;
  const hasLocation = isCustom || !!location;

  const deliveryFee = useMemo(
    () => (hasLocation ? resolveDeliveryFee({ region, location, isCustom }) : 0),
    [region, location, isCustom, hasLocation],
  );
  const total = subtotal + (items.length ? deliveryFee : 0);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!region) {
      toast.error("Please select a delivery region");
      return;
    }

    if (!hasLocation) {
      toast.error("Please select your delivery area");
      return;
    }

    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please check the form"
      );
      return;
    }

    if (isCustom && !parsed.data.custom_location) {
      toast.error("Please enter your custom area or neighbourhood");
      return;
    }

    setSubmitting(true);

    try {
      /*
      * 1. Create the order.
      *
      * We initially provide the delivery information and subtotal.
      * Your database trigger remains the authority for the final
      * delivery fee and total.
      */

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: parsed.data.customer_name,
          customer_phone: parsed.data.customer_phone,
          delivery_address: parsed.data.delivery_address,
          landmark: parsed.data.landmark || null,
          notes: parsed.data.notes,

          delivery_region_id: region.id,

          delivery_location_id: isCustom
            ? null
            : location.id,

          custom_location: isCustom
            ? parsed.data.custom_location
            : null,

          subtotal_ngn: subtotal,

          // Database trigger calculates the authoritative values.
          delivery_fee_ngn: deliveryFee,
          total_ngn: total,
        })
        .select()
        .single();

      if (orderErr || !order) {
        throw orderErr ?? new Error("Failed to create order");
      }

      /*
      * 2. Create the order items.
      */

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(
          items.map((i) => ({
            order_id: order.id,
            menu_item_id: i.id,
            name: i.name,
            price_ngn: i.price,
            quantity: i.quantity,
          }))
        );

      if (itemsErr) {
        throw itemsErr;
      }

      /*
      * 3. Ask our Supabase Edge Function to initialize
      *    the Paystack transaction.
      *
      * IMPORTANT:
      * The Paystack secret key stays inside the Edge Function.
      */

      const { data: payment, error: paymentError } =
        await supabase.functions.invoke(
          "paystack-initialize",
          {
            body: {
              order_id: order.id,
            },
          }
        );

      if (paymentError) {
        throw paymentError;
      }

      if (!payment?.success) {
        throw new Error(
          payment?.message || "Could not initialize payment"
        );
      }

      /*
      * 4. Save the payment reference returned by Paystack.
      */

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_reference: payment.payment_reference,
        })
        .eq("id", order.id);

      if (updateError) {
        throw updateError;
      }

      /*
      * 5. NOW open Paystack.
      */

      if (!payment.authorization_url) {
        throw new Error(
          "Paystack did not return an authorization URL"
        );
      }

      window.location.href = payment.authorization_url;

    } catch (err) {
      console.error("Checkout error:", err);

      toast.error(
        err?.message ||
          "Could not initialize payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryLabel = isCustom
    ? `Custom delivery — ${formatNaira(deliveryFee)}`
    : location
      ? `Delivery to ${location.name} — ${formatNaira(deliveryFee)}`
      : null;

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
            <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" className="h-12" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Adaeze Okonkwo" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" className="h-12" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="+234 800 000 0000" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    className="h-12"
                    type="email"
                    value={form.customer_email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer_email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-5 border-t border-border pt-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Delivery information</p>

                <div className="space-y-1.5">
                  <Label>Delivery region</Label>
                  <Select
                    value={regionId}
                    onValueChange={(v) => { setRegionId(v); setLocationValue(""); }}
                    disabled={regionsLoading || regions.length === 0}
                  >
                    <SelectTrigger className="h-12"><SelectValue placeholder={regionsLoading ? "Loading regions…" : "Select region"} /></SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}{r.state ? ` · ${r.state}` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Select your area</Label>
                  <Select value={locationValue} onValueChange={setLocationValue} disabled={!regionId || locationsLoading}>
                    <SelectTrigger className="h-12"><SelectValue placeholder={locationsLoading ? "Loading areas…" : "Select your area"} /></SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name} · {formatNaira(l.delivery_fee_ngn)}</SelectItem>
                      ))}
                      <SelectItem value={CUSTOM_LOCATION_VALUE}>Other / Custom location</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isCustom && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      Can&apos;t find your location?{" "}
                      <button type="button" onClick={() => setLocationValue(CUSTOM_LOCATION_VALUE)} className="font-medium text-accent underline underline-offset-4">
                        Use a custom location
                      </button>
                    </p>
                  )}
                </div>

                {isCustom && (
                  <div className="space-y-1.5">
                    <Label htmlFor="custom">Custom area / location</Label>
                    <Input id="custom" className="h-12" value={form.custom_location} onChange={(e) => setForm({ ...form, custom_location: e.target.value })} placeholder="Enter your area or neighborhood" />
                  </div>
                )}

                {deliveryLabel && (
                  <div className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm font-medium text-primary">
                    <MapPin className="h-4 w-4 shrink-0 text-accent" /> {deliveryLabel}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="address">Delivery address</Label>
                  <Textarea id="address" value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} placeholder="Enter your house/building address, street, landmark, bus stop, or any useful directions for the rider." rows={4} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="landmark">Landmark / bus stop (optional)</Label>
                  <Input id="landmark" className="h-12" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="e.g. Opposite YSU main gate" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Order notes (optional)</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Extra pepper, no plantain, gate code…" rows={2} />
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CreditCard className="h-4 w-4 text-accent" /> Payment via Paystack
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  You’ll be securely redirected to Paystack to complete your payment.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
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
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery{isCustom ? " · custom" : location ? ` · ${location.name}` : ""}</span>
                  <span>{hasLocation ? formatNaira(deliveryFee) : "Select area"}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold text-primary"><span>Total</span><span>{formatNaira(total)}</span></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
