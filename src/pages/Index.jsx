import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight, Star, Truck, Utensils, ShieldCheck, Leaf, Flame, Clock,
  ChefHat, Plus, Quote,
} from "lucide-react";

import heroImg from "@/assets/hero-feast.png";
import chefImg from "@/assets/chef.jpg";
import catRice from "@/assets/cat-rice.jpg";
import catGrills from "@/assets/cat-grills.jpg";
import catSoups from "@/assets/cat-soups.jpg";
import catDrinks from "@/assets/cat-drinks.jpg";
import catChops from "@/assets/cat-chops.jpg";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart.jsx";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Motion presets                                                     */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ------------------------------------------------------------------ */
/*  Static content (categories, why-us, testimonials)                  */
/* ------------------------------------------------------------------ */
const featuredCategories = [
  { name: "Rice Specials", desc: "Smoky jollof, fried rice, coconut rice.", img: catRice, emoji: "🍚" },
  { name: "Grills", desc: "Suya, asun and flame-kissed skewers.",         img: catGrills, emoji: "🍖" },
  { name: "Soups",  desc: "Egusi, ogbono, efo riro & swallow.",           img: catSoups,  emoji: "🍲" },
  { name: "Drinks", desc: "Zobo, chapman and house cocktails.",           img: catDrinks, emoji: "🥤" },
  { name: "Small Chops", desc: "Puff-puff, samosas, spring rolls.",       img: catChops,  emoji: "🥟" },
];

const whyUs = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    desc: "Prepared with fresh, carefully selected ingredients.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Fresh meals delivered across Damaturu.",
  },
  {
    icon: ChefHat,
    title: "Authentic Flavours",
    desc: "Delicious Nigerian dishes prepared with care.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Safe and convenient checkout powered by Paystack.",
  },
];

const testimonials = [
  { name: "Adaeze O.",   text: "The jollof tastes like my grandmother made it. Absolutely unreal.",        avatar: "https://i.pravatar.cc/120?img=47" },
  { name: "Tunde K.",    text: "Suya was smoky and tender. Delivery was faster than promised.",            avatar: "https://i.pravatar.cc/120?img=12" },
  { name: "Chiamaka N.", text: "Best egusi in Lagos, hands down. The pounded yam was heaven.",             avatar: "https://i.pravatar.cc/120?img=32" },
  { name: "Femi A.",     text: "Ordered small chops for a party. Everyone was asking where I got them.",   avatar: "https://i.pravatar.cc/120?img=8"  },
  { name: "Zainab S.",   text: "The chapman is dangerously good. Coming back every weekend.",              avatar: "https://i.pravatar.cc/120?img=45" },
  { name: "Ibrahim L.",  text: "Warm packaging, generous portions, real Nigerian flavour. 10/10.",         avatar: "https://i.pravatar.cc/120?img=15" },
];

const timeline = [
  { year: "1998", text: "A small kitchen opens in Ikeja, feeding neighbours from a single pot of jollof." },
  { year: "2010", text: "The family recipe crosses Lagos — catering weddings, parties and boardrooms." },
  { year: "2020", text: "Tradish becomes a beloved dine-in restaurant in the heart of Ikeja." },
  { year: "Today", text: "We deliver soulful, slow-cooked Nigerian food across the city, every single day." },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Index() {
  const [cartOpen, setCartOpen] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    document.title = "Tradish — A Taste of Nigeria, Delivered";
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

  const menuItems = data?.items ?? [];
  const activeMenuCategories = (data?.categories ?? []).filter((category) => category.active !== false);
  const galleryImgs = menuItems.filter((i) => i.image_url).slice(0, 8);

  const onAdd = (item) => {
    add({ id: item.id, name: item.name, price: item.price_ngn, image_url: item.image_url });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div id="home" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader onOpenCart={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />

      {/* ============================== HERO ============================== */}
      <section className="relative isolate flex min-h-[760px] items-center overflow-hidden bg-secondary/35 lg:min-h-[720px]">
        <div className="absolute bottom-0 right-0 top-0 -z-10 w-full overflow-hidden sm:w-[58%] lg:w-[54%]">
          <img
            src={heroImg}
            alt="A cinematic spread of Nigerian dishes"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent dark:from-black/80 dark:via-black/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/40 sm:hidden" />
          <svg
            aria-hidden="true"
            viewBox="0 0 112 900"
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-0 hidden h-full w-28 text-secondary sm:block"
          >
            <path
              fill="currentColor"
              d="M0 0H112V84C112 116 62 121 62 164C62 208 112 210 112 255V337C112 373 62 377 62 423C62 469 112 472 112 518V602C112 638 62 644 62 689C62 736 112 738 112 783V900H0Z"
            />
          </svg>
        </div>

        {/* floating decorations */}
        <motion.div
          aria-hidden
          className="absolute right-[8%] top-[18%] hidden h-56 w-56 rounded-full bg-primary/20 blur-3xl md:block"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-[14%] left-[6%] hidden h-40 w-40 rounded-full bg-accent/25 blur-3xl md:block"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-32 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden" animate="visible"
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-accent sm:text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent sm:bg-primary" />
              Authentic Nigerian Cuisine
            </motion.span>

            <motion.h1
              variants={fadeUp} custom={1}
              className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-primary-foreground sm:text-foreground sm:text-6xl md:text-7xl lg:text-[80px]"
            >
              Every Plate <br className="hidden sm:block" />
              Tells a <span className="italic text-primary">Story.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-foreground/80 sm:text-lg"
            >
              From smoky party jollof to slow-simmered egusi — we bring you generations
              of Nigerian flavour, cooked fresh and delivered to your door.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-9 flex flex-wrap gap-4">
              <Button asChild size="lg" className="group h-12 gap-2 rounded-full bg-primary px-7 text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90">
                <a href="#menu">
                  Order Food
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-primary-foreground/55 bg-black/20 px-7 text-primary-foreground backdrop-blur hover:border-primary hover:bg-primary/90 hover:text-primary-foreground sm:border-foreground/40 sm:bg-background/65 sm:text-foreground sm:hover:bg-primary/5 sm:hover:text-primary">
                <a href="#menu">Browse Menu</a>
              </Button>
            </motion.div>

            {/* stat cards */}
            <motion.div
              variants={fadeUp} custom={4}
              className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {[
                // { icon: Star,  label: "4.9 Rating",       sub: "2,300+ reviews" },
                { icon: Truck, label: "30–45 min",         sub: "Fast delivery" },
                { icon: Utensils, label: "50+ Dishes",     sub: "Authentic menu" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 border-r border-border/80 px-1 py-2 last:border-0 sm:px-5"
                >
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-display text-lg font-semibold text-primary-foreground sm:text-foreground">{label}</div>
                    <div className="text-xs text-primary-foreground/70 sm:text-muted-foreground">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================= FEATURED CATEGORIES =========================== */}
      <section className="relative bg-secondary/35 py-20 sm:py-24">
        <SectionHeader eyebrow="Explore" title="Featured Categories" sub="A menu built around the dishes Nigerians love the most." />

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
          {featuredCategories.map((c, i) => (
            <motion.a
              key={c.name}
              href="#menu"
              variants={fadeUp} custom={i}
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-5 pt-16 dark:from-black/90 dark:via-black/45">
                  <div className="mb-1 text-lg">{c.emoji}</div>
                  <h3 className="font-display text-xl font-semibold text-primary-foreground">{c.name}</h3>
                  <p className="mt-1 max-w-xs text-xs text-primary-foreground/75">{c.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ========================= POPULAR DISHES =========================== */}
      <section id="menu" className="relative bg-background py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <SectionHeader eyebrow="On The Table" title="Customer Favorites" sub="Explore every dish, arranged by its kitchen category." />

        <div className="mx-auto mt-14 max-w-7xl space-y-16 px-6 lg:px-8">
          {!data
            ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-muted" />)}
              </div>
            : activeMenuCategories.map((category) => {
                const categoryItems = menuItems.filter((item) => item.category_id === category.id && item.available);
                if (categoryItems.length === 0) return null;
                return (
                  <section key={category.id} aria-labelledby={`category-${category.id}`}>
                    <div className="mb-6 flex items-center gap-4">
                      <h3 id={`category-${category.id}`} className="font-display text-3xl text-foreground sm:text-4xl">{category.name}</h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryItems.map((item, i) => (
                        <motion.article
                          key={item.id}
                          variants={fadeUp} custom={i}
                          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                          whileHover={{ y: -8 }}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110" />
                            ) : (
                              <div className="grid h-full place-items-center bg-muted text-muted-foreground">No image</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <div className="flex flex-1 flex-col p-6">
                            <h4 className="font-display text-xl font-semibold text-foreground">{item.name}</h4>
                            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{item.description}</p>
                            <div className="mt-5 flex items-center justify-between">
                              <span className="font-display text-xl font-semibold text-primary">{formatNaira(item.price_ngn)}</span>
                              <Button size="sm" onClick={() => onAdd(item)} className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="h-4 w-4" /> Add
                              </Button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                );
              })}
        </div>

        <div className="mt-14 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground">
            <a href="#gallery">See the full menu <ArrowRight className="ml-2 h-4 w-4" /></a>
          </Button>
        </div>
      </section>

      {/* ========================== WHY CHOOSE US =========================== */}
      <section className="relative bg-secondary/35 py-20 sm:py-24">
        <SectionHeader eyebrow="Why Tradish" title="Cooked with soul, delivered with care." />

        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {whyUs.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              variants={fadeUp} custom={i}
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-7 transition-colors hover:border-primary/40"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:bg-primary/20" />
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-6 font-display text-xl font-semibold text-foreground">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================== TESTIMONIALS =========================== */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-24">
        <SectionHeader eyebrow="Kind Words" title="Loved across Lagos." />

        <div className="relative mt-14 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee-track flex w-max gap-6 px-6">
            {[...testimonials, ...testimonials].map((t, i) => (
              <figure
                key={i}
                className="w-[340px] flex-none rounded-2xl border border-border/80 bg-card p-7 shadow-sm"
              >
                <Quote className="h-6 w-6 text-primary/70" />
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">"{t.text}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="flex gap-0.5 text-primary">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-primary" />
                      ))}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== ABOUT ============================== */}
      <section id="about" className="relative bg-secondary/35 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-border">
              <img src={chefImg} alt="Head chef stirring a pot of jollof rice" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden max-w-[220px] rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2 text-primary"><Flame className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.18em]">25+ Years</span></div>
              <p className="mt-2 text-sm text-muted-foreground">of feeding families across Lagos.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Our Story</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              A family kitchen that grew into a Lagos favourite.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Tradish began in Ikeja — a place where jollof was smoky, egusi was thick, and every plate came with a story.
              We still cook every dish to order, with recipes passed down three generations.
            </p>

            <ol className="mt-10 space-y-6 border-l border-border pl-6">
              {timeline.map((t) => (
                <li key={t.year} className="relative">
                    <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border border-primary bg-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t.year}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
                </li>
              ))}
            </ol>

            <Button asChild size="lg" className="mt-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#menu">Taste the tradition <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================== GALLERY ============================= */}
      {galleryImgs.length > 0 && (
        <section id="gallery" className="bg-background py-20 sm:py-24">
          <SectionHeader eyebrow="@tradish.lagos" title="Straight from the kitchen." />
          <div className="mx-auto mt-14 max-w-7xl px-6 lg:px-8">
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
              {galleryImgs.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border"
                >
                  <img
                    src={g.image_url}
                    alt={g.name}
                    loading="lazy"
                    className="w-full transition-transform duration-[900ms] hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================ CTA ================================ */}
      <section className="relative overflow-hidden bg-secondary/35 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-r from-primary via-[oklch(0.42_0.15_31)] to-[oklch(0.34_0.11_31)] p-10 sm:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/75">Craving something?</span>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                  Hungry already?
                </h2>
                <p className="mt-4 max-w-xl text-primary-foreground/80">
                  Your next favourite plate is 30 minutes away. Order now and taste why Lagos keeps coming back.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="h-12 rounded-full bg-background px-8 text-primary shadow-xl shadow-foreground/20 hover:bg-secondary">
                    <a href="#menu">Order Your Meal <ArrowRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-5 py-2 text-sm text-primary-foreground/85">
                    <Clock className="h-4 w-4 text-primary-foreground" /> Delivering right now
                  </div>
                </div>
              </div>

              {/* delivery illustration */}
              <div className="relative hidden lg:block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur"
                >
                  <Truck className="h-24 w-24 text-primary-foreground" strokeWidth={1.25} />
                </motion.div>
                <div className="absolute inset-x-0 -bottom-2 mx-auto h-4 w-40 rounded-full bg-black/40 blur-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
function SectionHeader({ eyebrow, title, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl px-6 text-center"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}
