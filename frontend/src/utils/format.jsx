export const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const stockPill = (stock) => {
  if (stock <= 5)  return <span className="pill low">{stock} units</span>
  if (stock <= 10) return <span className="pill mid">{stock} units</span>
  return <span className="pill ok">{stock} units</span>
}
