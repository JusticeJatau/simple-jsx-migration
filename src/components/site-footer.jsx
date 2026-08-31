import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="relative mt-24 border-t border-border bg-secondary/35 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <img src="/logo.png" alt="MSA Tradish" className="h-20 w-20 rounded-full object-cover shadow-sm" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Home of proper Nigerian food — slow-cooked, generously spiced, and served with soul from our kitchen to yours.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">Quick Links</h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {["Home", "Menu", "About", "Gallery", "Contact"].map((l) => (
              <li key={l}><a href={`/#${l.toLowerCase()}`} className="hover:text-primary">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">Opening Hours</h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex justify-between gap-6"><span>Mon – Thu</span><span className="text-foreground/80">11am – 10pm</span></li>
            <li className="flex justify-between gap-6"><span>Fri – Sat</span><span className="text-foreground/80">11am – 11pm</span></li>
            <li className="flex justify-between gap-6"><span>Sunday</span><span className="text-foreground/80">12pm – 9pm</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">Visit Us</h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />12 Awolowo Way, Ikeja, Lagos</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 flex-none text-primary" />+234 800 000 0000</li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 flex-none text-primary" />hello@tradish.ng</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tradish Restaurant. Crafted with love in Lagos.
      </div>
    </footer>
  );
}
