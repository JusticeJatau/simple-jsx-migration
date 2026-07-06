import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, UtensilsCrossed, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart.jsx";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/#menu", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader({ onOpenCart }) {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/5 bg-background/85 backdrop-blur-xl py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Tradish
          </span>
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-medium text-foreground/80 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
          <Button
            asChild
            size="sm"
            className="hidden rounded-full bg-primary px-5 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 sm:inline-flex"
          >
            <a href="/#menu">Order Now</a>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-5 mt-3 rounded-2xl border border-white/10 bg-background/95 p-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground/90 hover:text-primary">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}