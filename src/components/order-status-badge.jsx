import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";

const styles = {
  pending: "bg-secondary text-secondary-foreground",
  preparing: "bg-accent/20 text-accent-foreground border border-accent/40",
  ready: "bg-accent text-accent-foreground",
  out_for_delivery: "bg-primary text-primary-foreground",
  completed: "bg-emerald-600 text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

export function OrderStatusBadge({ status }) {
  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? ""}`}>
      {statusLabel(status)}
    </Badge>
  );
}