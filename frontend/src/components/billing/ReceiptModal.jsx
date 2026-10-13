import { useEffect, useState } from 'react'
import { X, Printer } from 'lucide-react'
import { formatINR } from '../../utils/format'
import { getSettings } from '../../utils/settings'

export default function ReceiptModal({
  sale,
  storeInfo: propStoreInfo,
  onClose,
}) {
  const [settings, setSettings] = useState(getSettings)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!sale) return null

  const storeInfo = propStoreInfo || {
    name: settings.storeName || 'AJ Clothing Store',
    tagline: settings.tagline || '',
    address: settings.address || 'Commercial Street, Bangalore',
    phone: settings.phone || '+91 98765 43210',
    email: settings.email || 'contact@ajclothing.com',
    gstin: settings.gstin || '',
    note: settings.note || 'Thank you for shopping with us! Returns within 7 days with tag intact.',
  }

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
        style={{ maxWidth: 440, padding: 20 }}
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
          {storeInfo.tagline && (
            <p style={{ fontStyle: 'italic', color: '#666', marginTop: 2, marginBottom: 4 }}>
              {storeInfo.tagline}
            </p>
          )}
          <p>{storeInfo.address}</p>
          <p>
            {storeInfo.phone} · {storeInfo.email}
          </p>
          {storeInfo.gstin && (
            <p style={{ fontWeight: 600, color: '#333' }}>GSTIN: {storeInfo.gstin}</p>
          )}

          <hr />

          <div className="bill-meta-row">
            <span>
              BILL:{' '}
              <span className="bill-num-val" style={{ color: 'var(--accent)' }}>
                {billNum}
              </span>
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>{formattedDate}</span>
          </div>

          <p style={{ textAlign: 'left', margin: '6px 0 4px', fontSize: 11 }}>
            Customer: <strong>{sale.customer_name || sale.customerName || 'Walk-in customer'}</strong>
            {(sale.customer_mobile || sale.customerMobile) && (
              <span> · Ph: <span className="bill-num-val">{sale.customer_mobile || sale.customerMobile}</span></span>
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
                    <td style={{ textAlign: 'center' }} className="receipt-qty">
                      {it.qty || it.quantity || 1}
                    </td>
                    <td>{formatINR((it.price || 0) * (it.qty || it.quantity || 1))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <hr />

          <div style={{ fontSize: 11, display: 'grid', gap: 4 }}>
            <div className="calc-row">
              <span>Subtotal</span>
              <span className="calc-val">{formatINR(sale.subtotal)}</span>
            </div>

            {Number(sale.discount) > 0 && (
              <div className="calc-row" style={{ color: '#a64e3d' }}>
                <span>
                  Discount
                  {(sale.discount_percent || sale.discountPercent)
                    ? ` (${sale.discount_percent || sale.discountPercent}%)`
                    : ''}
                </span>
                <span className="calc-val">-{formatINR(sale.discount)}</span>
              </div>
            )}

            {Number(sale.discount) > 0 && (
              <div className="calc-row">
                <span>After discount</span>
                <span className="calc-val">{formatINR(sale.after_discount || sale.afterDiscount)}</span>
              </div>
            )}

            {sale.round_off && Number(sale.rounding_adjustment || sale.roundingAdjustment) !== 0 && (
              <div className="calc-row" style={{ color: '#666' }}>
                <span>Round-off adjustment</span>
                <span className="calc-val">
                  {Number(sale.rounding_adjustment || sale.roundingAdjustment) > 0 ? '+' : ''}
                  {formatINR(sale.rounding_adjustment || sale.roundingAdjustment)}
                </span>
              </div>
            )}
          </div>

          <hr />

          <div className="sum" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>FINAL BILL</span>
            <span style={{ color: 'var(--accent)' }}>{formatINR(sale.total)}</span>
          </div>

          <p style={{ textAlign: 'left', marginTop: 8, fontSize: 11 }}>
            <strong>Mode of payment:</strong> {sale.payment_method || sale.payment || 'Cash'}
          </p>

          <hr />

          <p style={{ fontSize: 10, color: '#777', marginTop: 10, lineHeight: 1.4 }}>
            {storeInfo.note}
          </p>
        </div>
      </div>
    </div>
  )
}
