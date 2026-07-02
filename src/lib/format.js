function formatNaira(kobo) {
  return "\u20A6" + kobo.toLocaleString("en-NG");
}
function statusLabel(status) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export {
  formatNaira,
  statusLabel
};
