import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CUSTOM_LOCATION_VALUE = "__custom__";

/** Active regions, customer-facing. */
export function useDeliveryRegions() {
  return useQuery({
    queryKey: ["delivery-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_regions")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/** Active locations for a region, customer-facing. */
export function useDeliveryLocations(regionId) {
  return useQuery({
    queryKey: ["delivery-locations", regionId],
    enabled: !!regionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_locations")
        .select("*")
        .eq("region_id", regionId)
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

/** Everything, including inactive rows — admin only (RLS enforces it). */
export function useDeliveryAdminData() {
  return useQuery({
    queryKey: ["admin-delivery"],
    queryFn: async () => {
      const [{ data: regions, error: e1 }, { data: locations, error: e2 }] = await Promise.all([
        supabase.from("delivery_regions").select("*").order("sort_order"),
        supabase.from("delivery_locations").select("*").order("sort_order"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { regions: regions ?? [], locations: locations ?? [] };
    },
  });
}

/** Display-only estimate. The database recomputes the real fee on insert. */
export function resolveDeliveryFee({ region, location, isCustom }) {
  if (!region) return 0;
  if (isCustom || !location) return region.custom_delivery_fee_ngn ?? 0;
  return location.delivery_fee_ngn ?? 0;
}
