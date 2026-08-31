import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, Moon, Sun } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = localStorage.getItem("tradish-theme");
    return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("tradish-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-xl py-2"
          : "border-b border-border/50 bg-background/95 py-2"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="md:justify-self-start" aria-label="Tradish home">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MSA Tradish" className="h-20 w-20 rounded-full object-cover shadow-sm" />
            <span className="font-display text-2xl font-semibold">Tradish</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 text-xs font-semibold text-foreground md:flex">
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

        <div className="ml-auto flex items-center gap-2 md:justify-self-end">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onOpenCart}
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
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
            className="hidden h-10 rounded-full bg-primary px-6 text-xs text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 sm:inline-flex"
          >
            <a href="/#menu">Order Now</a>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-5 mt-3 rounded-2xl border border-border bg-background/95 p-6 shadow-xl backdrop-blur-xl md:hidden">
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
