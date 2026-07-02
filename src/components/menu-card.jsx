import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart.jsx";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";

export function MenuCard({ item }) {
  const { add } = useCart();
  const onAdd = () => {
    add({ id: item.id, name: item.name, price: item.price_ngn, image_url: item.image_url });
    toast.success(`${item.name} added to cart`);
  };
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">No image</div>
        )}
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">Sold out</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-primary">{formatNaira(item.price_ngn)}</span>
          <Button size="sm" disabled={!item.available} onClick={onAdd} className="gap-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}