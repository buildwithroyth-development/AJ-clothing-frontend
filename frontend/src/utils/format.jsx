export const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const stockPill = (stock) => {
  if (stock <= 5)  return <span className="pill low">{stock} units</span>
  if (stock <= 10) return <span className="pill mid">{stock} units</span>
  return <span className="pill ok">{stock} units</span>
}

// Keeps only what a phone number can contain (digits, +, spaces, hyphens, brackets), so letters
// cannot be typed or pasted into a mobile number field.
export const sanitizePhone = (value) => String(value ?? '').replace(/[^\d+()\- ]/g, '')
