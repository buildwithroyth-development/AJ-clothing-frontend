import { useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import { formatINR } from '../../utils/format'

export default function ReceiptModal({
  sale,
  storeInfo = {
    name: 'AJ Clothing Store',
    address: 'Commercial Street, Bangalore',
    phone: '+91 98765 43210',
    email: 'contact@ajclothing.com',
    note: 'Thank you for shopping with us! Returns within 7 days with tag intact.',
  },
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!sale) return null

  const items = sale.items || []
  const billNum = sale.bill_number || sale.bill || 'AJ-000000'
  const dateStr = sale.created_at || sale.at || new Date().toISOString()
  const formattedDate = new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 420, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" style={{ marginBottom: 14 }}>
          <span className="eyebrow">SALE RECEIPT</span>
          <button type="button" onClick={onClose} aria-label="Close receipt">
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            type="button"
            className="btn primary full"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>

        {/* Printable Thermal Receipt Slip */}
        <div className="receipt print-only-receipt">
          <h2>{storeInfo.name}</h2>
          <p>{storeInfo.address}</p>
          <p>
            {storeInfo.phone} · {storeInfo.email}
          </p>

          <hr />

          <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#111' }}>
            <span>BILL: {billNum}</span>
            <span>{formattedDate}</span>
          </p>

          <p style={{ textAlign: 'left', margin: '4px 0' }}>
            Customer: {sale.customer_name || sale.customerName || 'Walk-in customer'}
            {(sale.customer_mobile || sale.customerMobile) && (
              <span> · Ph: {sale.customer_mobile || sale.customerMobile}</span>
            )}
          </p>

          <hr />

          <table>
            <thead>
              <tr>
                <th>ITEM</th>
                <th style={{ textAlign: 'center' }}>QTY</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const variantDesc = [it.colour, it.size ? `Size ${it.size}` : '']
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <tr key={idx}>
                    <td>
                      <strong>{it.name || it.product_name}</strong>
                      {variantDesc && <div style={{ fontSize: 10, color: '#666' }}>{variantDesc}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{it.qty || it.quantity || 1}</td>
                    <td>{formatINR((it.price || 0) * (it.qty || it.quantity || 1))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <hr />

          <div style={{ fontSize: 11, display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>{formatINR(sale.subtotal)}</span>
            </div>

            {Number(sale.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a64e3d' }}>
                <span>
                  Discount
                  {(sale.discount_percent || sale.discountPercent)
                    ? ` (${sale.discount_percent || sale.discountPercent}%)`
                    : ''}
                </span>
                <span>-{formatINR(sale.discount)}</span>
              </div>
            )}

            {Number(sale.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>After discount</span>
                <span>{formatINR(sale.after_discount || sale.afterDiscount)}</span>
              </div>
            )}

            {sale.round_off && Number(sale.rounding_adjustment || sale.roundingAdjustment) !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Round-off adjustment</span>
                <span>
                  {Number(sale.rounding_adjustment || sale.roundingAdjustment) > 0 ? '+' : ''}
                  {formatINR(sale.rounding_adjustment || sale.roundingAdjustment)}
                </span>
              </div>
            )}
          </div>

          <hr />

          <div className="sum" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>FINAL BILL</span>
            <span>{formatINR(sale.total)}</span>
          </div>

          <p style={{ textAlign: 'left', marginTop: 8, fontSize: 11 }}>
            <strong>Mode of payment:</strong> {sale.payment_method || sale.payment || 'Cash'}
          </p>

          <hr />

          <p style={{ fontSize: 10, color: '#777', marginTop: 10 }}>{storeInfo.note}</p>
        </div>
      </div>
    </div>
  )
}
