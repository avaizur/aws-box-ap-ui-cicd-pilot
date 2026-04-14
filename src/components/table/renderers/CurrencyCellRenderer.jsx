export default function CurrencyCellRenderer({ value }) {
  if (value === null || value === undefined) return <span>-</span>;
  return <span>${parseFloat(value).toFixed(2)}</span>;
}










