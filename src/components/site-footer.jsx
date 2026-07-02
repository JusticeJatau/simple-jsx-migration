import { UtensilsCrossed } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <span className="font-display text-xl font-semibold">Tradish Restaurant</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Home of proper Nigerian food — slow-cooked, generously spiced, served with soul.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-accent">Visit</h4>
          <p className="mt-3 text-sm text-primary-foreground/80">12 Awolowo Way, Ikeja<br />Lagos, Nigeria</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-accent">Order</h4>
          <p className="mt-3 text-sm text-primary-foreground/80">Mon–Sun · 11am–10pm</p>
          <p className="mt-1 text-sm text-primary-foreground/80">+234 800 000 0000</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Tradish Restaurant. All rights reserved.
      </div>
    </footer>
  );
}