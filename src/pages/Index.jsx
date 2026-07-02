import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MenuCard } from "@/components/menu-card";
import { CartSheet } from "@/components/cart-sheet";

export default function Index() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.title = "Tradish Restaurant — Authentic Nigerian food, delivered";
  }, []);

  const { data } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const [{ data: cats }, { data: items }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("sort_order"),
      ]);
      return { categories: cats ?? [], items: items ?? [] };
    },
  });

  const categories = data?.categories ?? [];
  const items = data?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader onOpenCart={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-20 lg:pb-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-foreground">
              <Sparkles className="h-3 w-3" /> Authentic Nigerian kitchen
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold text-primary sm:text-5xl lg:text-6xl">
              A taste of home, <span className="italic text-accent">delivered</span> hot.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              From smoky party jollof to slow-simmered egusi — Tradish Restaurant brings you generations of Nigerian flavour, cooked fresh and delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="#menu">Order Now <ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/20">
                <a href="#about">Our Story</a>
              </Button>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> 30–45 min delivery</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Across Lagos</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-accent/20 blur-2xl" aria-hidden />
            <img src={heroImg} alt="A spread of Nigerian dishes on a wooden dining table" width={1600} height={1200} className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The Menu</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-primary sm:text-4xl">Cooked fresh, every order</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Explore our seasonal selection of Nigerian classics.</p>
        </div>
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} className="mb-14 last:mb-0">
              <div className="mb-5 flex items-baseline justify-between border-b border-border pb-3">
                <h3 className="font-display text-2xl font-semibold text-primary">{cat.name}</h3>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {catItems.length} dish{catItems.length === 1 ? "" : "es"}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (<MenuCard key={item.id} item={item} />))}
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (<p className="py-20 text-center text-muted-foreground">Loading menu…</p>)}
      </section>

      <section id="about" className="bg-primary/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 sm:py-20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Story</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-primary sm:text-4xl">Nigerian food, done properly.</h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>Tradish began as a family kitchen in Ikeja — a place where jollof was smoky, egusi was thick, and every plate came with a story. Today we still cook every dish to order, using the same recipes passed down three generations.</p>
            <p>Whether you're calling in from the office, feeding the family, or catering a party, we bring the taste of home to your table.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}