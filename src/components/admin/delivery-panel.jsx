import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira } from "@/lib/format";
import { useDeliveryAdminData } from "@/lib/delivery";

export function DeliveryPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useDeliveryAdminData();
  const regions = data?.regions ?? [];
  const locations = data?.locations ?? [];

  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [regionDialog, setRegionDialog] = useState(null); // {mode, region}
  const [locationDialog, setLocationDialog] = useState(null);

  useEffect(() => {
    if (!selectedRegionId && regions.length) setSelectedRegionId(regions[0].id);
  }, [regions, selectedRegionId]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-delivery"] });
    qc.invalidateQueries({ queryKey: ["delivery-regions"] });
    qc.invalidateQueries({ queryKey: ["delivery-locations"] });
  };

  const region = regions.find((r) => r.id === selectedRegionId) ?? null;
  const regionLocations = useMemo(
    () => locations.filter((l) => l.region_id === selectedRegionId),
    [locations, selectedRegionId],
  );

  const toggleRegion = async (r, active) => {
    const { error } = await supabase.from("delivery_regions").update({ active, updated_at: new Date().toISOString() }).eq("id", r.id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const deleteRegion = async (r) => {
    if (!confirm(`Delete region "${r.name}" and all its locations?`)) return;
    const { error } = await supabase.from("delivery_regions").delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else { toast.success("Region deleted"); setSelectedRegionId(""); refresh(); }
  };
  const toggleLocation = async (l, active) => {
    const { error } = await supabase.from("delivery_locations").update({ active, updated_at: new Date().toISOString() }).eq("id", l.id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const deleteLocation = async (l) => {
    if (!confirm(`Delete "${l.name}"?`)) return;
    const { error } = await supabase.from("delivery_locations").delete().eq("id", l.id);
    if (error) toast.error(error.message);
    else { toast.success("Location deleted"); refresh(); }
  };

  if (isLoading) return <p className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></p>;

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Delivery regions</h2>
            <p className="text-sm text-muted-foreground">Only active regions are shown to customers at checkout.</p>
          </div>
          <Button className="rounded-full" onClick={() => setRegionDialog({ mode: "create" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Add region
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 hidden sm:table-cell">State</th>
                <th className="px-4 py-3">Custom location fee</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{r.state ?? "—"}</td>
                  <td className="px-4 py-3">{formatNaira(r.custom_delivery_fee_ngn)}</td>
                  <td className="px-4 py-3"><Switch checked={r.active} onCheckedChange={(v) => toggleRegion(r, v)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setRegionDialog({ mode: "edit", region: r })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteRegion(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {regions.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No regions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1.5">
            <Label>Delivery locations in</Label>
            <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
              <SelectTrigger className="h-11 w-[240px]"><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="rounded-full" disabled={!region} onClick={() => setLocationDialog({ mode: "create" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Add location
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Delivery fee</th>
                <th className="px-4 py-3 hidden md:table-cell">Notes</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {regionLocations.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3">{formatNaira(l.delivery_fee_ngn)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{l.notes ?? "—"}</td>
                  <td className="px-4 py-3"><Switch checked={l.active} onCheckedChange={(v) => toggleLocation(l, v)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setLocationDialog({ mode: "edit", location: l })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteLocation(l)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {regionLocations.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No locations for this region yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {region && (
          <p className="mt-3 text-xs text-muted-foreground">
            Customers who pick “Other / Custom location” in {region.name} are charged{" "}
            <span className="font-medium text-foreground">{formatNaira(region.custom_delivery_fee_ngn)}</span>. Edit the region to change it.
          </p>
        )}
      </section>

      <RegionDialog state={regionDialog} onClose={() => setRegionDialog(null)} onSaved={refresh} />
      <LocationDialog state={locationDialog} regionId={selectedRegionId} onClose={() => setLocationDialog(null)} onSaved={refresh} />
    </div>
  );
}

function RegionDialog({ state, onClose, onSaved }) {
  const open = !!state;
  const region = state?.region ?? null;
  const [form, setForm] = useState({ name: "", state: "", country: "Nigeria", custom_delivery_fee_ngn: 2000, active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(region ? {
      name: region.name,
      state: region.state ?? "",
      country: region.country ?? "Nigeria",
      custom_delivery_fee_ngn: region.custom_delivery_fee_ngn,
      active: region.active,
      sort_order: region.sort_order ?? 0,
    } : { name: "", state: "", country: "Nigeria", custom_delivery_fee_ngn: 2000, active: true, sort_order: 0 });
  }, [open, region]);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Region name is required"); return; }
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), custom_delivery_fee_ngn: Number(form.custom_delivery_fee_ngn) || 0, updated_at: new Date().toISOString() };
    const { error } = region
      ? await supabase.from("delivery_regions").update(payload).eq("id", region.id)
      : await supabase.from("delivery_regions").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(region ? "Region updated" : "Region added");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{region ? "Edit region" : "Add region"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Region name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Damaturu" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Yobe" /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Custom location delivery fee (₦)</Label>
            <Input type="number" min={0} value={form.custom_delivery_fee_ngn} onChange={(e) => setForm({ ...form, custom_delivery_fee_ngn: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LocationDialog({ state, regionId, onClose, onSaved }) {
  const open = !!state;
  const location = state?.location ?? null;
  const [form, setForm] = useState({ name: "", delivery_fee_ngn: 1000, active: true, notes: "", sort_order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(location ? {
      name: location.name,
      delivery_fee_ngn: location.delivery_fee_ngn,
      active: location.active,
      notes: location.notes ?? "",
      sort_order: location.sort_order ?? 0,
    } : { name: "", delivery_fee_ngn: 1000, active: true, notes: "", sort_order: 0 });
  }, [open, location]);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Location name is required"); return; }
    const targetRegion = location?.region_id ?? regionId;
    if (!targetRegion) { toast.error("Select a region first"); return; }
    setSaving(true);
    const payload = {
      region_id: targetRegion,
      name: form.name.trim(),
      delivery_fee_ngn: Number(form.delivery_fee_ngn) || 0,
      active: form.active,
      notes: form.notes.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };
    const { error } = location
      ? await supabase.from("delivery_locations").update(payload).eq("id", location.id)
      : await supabase.from("delivery_locations").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(location ? "Location updated" : "Location added");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{location ? "Edit location" : "Add location"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Location name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="YSU" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Delivery fee (₦)</Label><Input type="number" min={0} value={form.delivery_fee_ngn} onChange={(e) => setForm({ ...form, delivery_fee_ngn: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Notes (optional)</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Riders take the back road after 7pm" /></div>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
