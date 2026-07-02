export function formatNaira(kobo: number): string {
  return "₦" + kobo.toLocaleString("en-NG");
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}