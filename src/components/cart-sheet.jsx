import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart.jsx";
import { formatNaira } from "@/lib/format";

export function CartSheet({ open, onOpenChange }) {
  const { items, increment, decrement, remove, subtotal } = useCart();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-2xl">Your order</SheetTitle>
          <SheetDescription>Review and adjust before you checkout.</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty. Add something delicious.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} loading="lazy" width={80} height={80} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <button onClick={() => remove(item.id)} className="shrink-0 text-muted-foreground transition-colors hover:text-destructive" aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatNaira(item.price)}</p>
                    <div className="mt-auto flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => decrement(item.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => increment(item.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-auto text-sm font-semibold">{formatNaira(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <SheetFooter className="border-t border-border bg-card px-6 py-5">
          <div className="mb-3 flex w-full items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl font-semibold">{formatNaira(subtotal)}</span>
          </div>
          <Button asChild disabled={items.length === 0} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/checkout" onClick={() => onOpenChange(false)}>Checkout</Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}