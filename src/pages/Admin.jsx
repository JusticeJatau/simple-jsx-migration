import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "@/components/protected-route";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Loader2, LogOut, Moon, Pencil, Plus, Sun, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { DeliveryPanel } from "@/components/admin/delivery-panel";
import { formatNaira, statusLabel } from "@/lib/format";
const STATUSES = ["pending", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];
function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthUser();
  if (!user) return null;
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["role", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return (data ?? []).map((r) => r.role);
    }
  });
  const isAdmin = roleData?.includes("admin");
  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate("/auth");
  };
  if (roleLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen bg-background">
        <AdminHeader email={user.email} onSignOut={signOut} />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-primary">Awaiting access</h1>
          <p className="mt-3 text-muted-foreground">
            Your account <span className="font-medium text-foreground">{user.email}</span> is signed in but has no admin role yet.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-left text-sm">
            <p className="font-medium">To grant admin access, ask the site owner to run:</p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-primary/5 p-3 text-xs">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
            </pre>
          </div>
          <Button className="mt-6 rounded-full" onClick={signOut}>Sign out</Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <AdminHeader email={user.email} onSignOut={signOut} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-primary">Kitchen dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage the menu and track incoming orders.</p>

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6"><OrdersPanel /></TabsContent>
          <TabsContent value="menu" className="mt-6"><MenuPanel /></TabsContent>
          <TabsContent value="delivery" className="mt-6"><DeliveryPanel /></TabsContent>
        </Tabs>
      </div>
    </div>;
}
function AdminHeader({ email, onSignOut }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = localStorage.getItem("tradish-theme");
    return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("tradish-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return <header className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground"><UtensilsCrossed className="h-4 w-4" /></span>
          <span className="font-display text-lg font-semibold">Tradish · Admin</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-primary-foreground/70 sm:inline">{email}</span>
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button size="sm" variant="ghost" onClick={onSignOut} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </header>;
}
function OrdersPanel() {
  const qc = useQueryClient();
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("tradish_admin_sound") !== "off";
  });
  const audioCtxRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  const ensureCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playChime = useCallback(() => {
    if (!soundOn) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    // Two-tone bell: E5 then A5
    const notes = [
      { freq: 659.25, start: 0,    dur: 0.35 },
      { freq: 880.0,  start: 0.18, dur: 0.55 },
    ];
    const now = ctx.currentTime;
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.28, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  }, [soundOn, ensureCtx]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("tradish_admin_sound", next ? "on" : "off");
    if (next) {
      // Unlock audio in same user gesture and preview the chime.
      ensureCtx();
      setTimeout(() => playChime(), 60);
    }
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("payment_status", "paid").order("created_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 1e4,
    refetchIntervalInBackground: true
  });

  const seededRef = useRef(false);

  // Seed once with existing history, then chime for anything new that shows up
  // in a poll (fallback in case realtime isn't enabled on the orders table).
  useEffect(() => {
    if (!orders) return;
    if (!seededRef.current) {
      orders.forEach((o) => seenIdsRef.current.add(o.id));
      seededRef.current = true;
      return;
    }
    const fresh = orders.filter((o) => !seenIdsRef.current.has(o.id));
    if (fresh.length === 0) return;
    fresh.forEach((o) => seenIdsRef.current.add(o.id));
    playChime();
    fresh.forEach((o) => {
      toast.success("New delivery order", {
        description: `${o.order_number ?? "Order"} · ${formatNaira(o.total_ngn ?? 0)}${
          o.customer_name ? ` · ${o.customer_name}` : ""
        }`,
        duration: 8000
      });
    });
  }, [orders, playChime]);

  // Realtime subscription for new orders.
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new;
          if (!order || seenIdsRef.current.has(order.id)) return;
          seenIdsRef.current.add(order.id);
          playChime();
          toast.success("New delivery order", {
            description: `${order.order_number ?? "Order"} · ${formatNaira(order.total_ngn ?? 0)}${
              order.customer_name ? ` · ${order.customer_name}` : ""
            }`,
            duration: 8000,
          });
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playChime, qc]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const SoundToggle = (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="font-medium">Live · listening for new orders</span>
      </div>
      <Button
        size="sm"
        variant={soundOn ? "default" : "outline"}
        onClick={toggleSound}
        className="gap-1.5 rounded-full"
      >
        {soundOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        Sound {soundOn ? "on" : "off"}
      </Button>
    </div>
  );

  if (isLoading) return <>{SoundToggle}<p className="py-10 text-center text-muted-foreground">Loading orders…</p></>;
  if (!orders || orders.length === 0)
    return <>{SoundToggle}<p className="py-16 text-center text-muted-foreground">No orders yet.</p></>;
  return <div className="space-y-4">
      {SoundToggle}
      {orders.map((o) => <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-primary">{o.order_number}</span>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} · {formatNaira(o.total_ngn)}
              </p>
            </div>
            <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="mt-1 font-medium">{o.customer_name}</p>
              <p className="text-muted-foreground">{o.customer_phone}</p>
            </div>
            <div className="text-sm sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Delivery information</p>
              <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Region</dt>
                  <dd className="font-medium">{o.delivery_region_name ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Area</dt>
                  <dd className="font-medium">{o.custom_location ?? o.delivery_location_name ?? "\u2014"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Address</dt>
                  <dd className="select-all whitespace-pre-wrap">{o.delivery_address}</dd>
                </div>
                {o.landmark && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Landmark</dt>
                    <dd className="select-all">{o.landmark}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Delivery fee</dt>
                  <dd className="font-medium">{formatNaira(o.delivery_fee_ngn ?? 0)}</dd>
                </div>
              </dl>
              {o.notes && <p className="mt-2 text-muted-foreground">Note: {o.notes}</p>}
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-background text-sm">
            {(o.order_items ?? []).map((it) => <li key={it.id} className="flex justify-between px-3 py-2">
                <span>{it.quantity} × {it.name}</span>
                <span className="font-medium">{formatNaira(it.price_ngn * it.quantity)}</span>
              </li>)}
          </ul>
        </div>)}
    </div>;
}
function MenuPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: async () => {
      const [{ data: cats }, { data: items2 }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("sort_order")
      ]);
      return { categories: cats ?? [], items: items2 ?? [] };
    }
  });
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const toggleAvailable = async (item, next) => {
    const { error } = await supabase.from("menu_items").update({ available: next }).eq("id", item.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-menu"] });
  };
  const remove = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-menu"] });
    }
  };
  const categories = data?.categories ?? [];
  const items = data?.items ?? [];
  return <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} items across {categories.length} categories</p>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1.5 h-4 w-4" /> Add dish
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Dish</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
    const cat = categories.find((c) => c.id === item.category_id);
    return <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? <img src={item.image_url} alt="" className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-muted" />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{cat?.name ?? "\u2014"}</td>
                  <td className="px-4 py-3">{formatNaira(item.price_ngn)}</td>
                  <td className="px-4 py-3">
                    <Switch checked={item.available} onCheckedChange={(v) => toggleAvailable(item, v)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>;
  })}
          </tbody>
        </table>
      </div>

      <MenuItemDialog
    open={creating || !!editing}
    onOpenChange={(o) => {
      if (!o) {
        setCreating(false);
        setEditing(null);
      }
    }}
    categories={categories}
    item={editing}
    onSaved={() => qc.invalidateQueries({ queryKey: ["admin-menu"] })}
  />
    </div>;
}
function MenuItemDialog({
  open,
  onOpenChange,
  categories,
  item,
  onSaved
}) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_ngn: 0,
    image_url: "",
    category_id: "",
    available: true,
    sort_order: 0
  });
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(item ? {
        name: item.name,
        description: item.description,
        price_ngn: item.price_ngn,
        image_url: item.image_url ?? "",
        category_id: item.category_id,
        available: item.available,
        sort_order: item.sort_order
      } : {
        name: "",
        description: "",
        price_ngn: 0,
        image_url: "",
        category_id: categories[0]?.id ?? "",
        available: true,
        sort_order: 0
      });
    }
  }, [open, item, categories]);
  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("menu-images").upload(path, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = await supabase.storage.from("menu-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (!data?.signedUrl) throw new Error("Could not get image URL");
      setForm((f) => ({ ...f, image_url: data.signedUrl }));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const save = async () => {
    if (!form.name || !form.category_id || form.price_ngn < 0) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, image_url: form.image_url || null };
      const { error } = isEdit ? await supabase.from("menu_items").update(payload).eq("id", item.id) : await supabase.from("menu_items").insert(payload);
      if (error) throw error;
      toast.success(isEdit ? "Updated" : "Added");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{isEdit ? "Edit dish" : "New dish"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Price (₦)</Label>
              <Input type="number" min={0} value={form.price_ngn} onChange={(e) => setForm({ ...form, price_ngn: Number(e.target.value) })} />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              {form.image_url ? <img src={form.image_url} alt="" className="h-16 w-16 rounded-md object-cover" /> : <div className="h-16 w-16 rounded-md bg-muted" />}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Upload
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
            <Label>Available for ordering</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Add dish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
export default AdminPage;
