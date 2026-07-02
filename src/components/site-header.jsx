import { Link } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart.jsx";

export function SiteHeader({ onOpenCart }) {
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Tradish</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground sm:flex">
          <a href="/#menu" className="transition-colors hover:text-foreground">Menu</a>
          <a href="/#about" className="transition-colors hover:text-foreground">Our Story</a>
          <a href="/#contact" className="transition-colors hover:text-foreground">Contact</a>
        </nav>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCart}
          className="relative gap-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}