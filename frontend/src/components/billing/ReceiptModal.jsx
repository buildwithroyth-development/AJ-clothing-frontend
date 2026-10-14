import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import { formatINR } from '../../utils/format'
import { getSettings } from '../../utils/settings'

// The bill itself. Used for the on-screen preview and for the printed / PDF copy.
//   top-left  : bill date and time
//   top-right : store details
//   centre    : bill number, customer, items, pricing, discount, total, payment mode
export function BillSheet({ sale, storeInfo }) {
  const items = sale.items || []
  const billNum = sale.bill_number || sale.bill || 'AJ-000000'
  const when = new Date(sale.created_at || sale.at || Date.now())
  const dateText = when.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeText = when.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()

  const customerName = sale.customer_name || sale.customerName
  const customerMobile = sale.customer_mobile || sale.customerMobile
  const customerEmail = sale.customer_email || sale.customerEmail
  const discount = Number(sale.discount) || 0
  const discountPct = sale.discount_percent || sale.discountPercent
  const rounding = Number(sale.rounding_adjustment || sale.roundingAdjustment) || 0

  return (
    <div className="bill-sheet">
      <header className="bill-head">
        <div className="bill-head-left">
          <span className="bill-caption">Bill date &amp; time</span>
          <strong className="bill-num-val">{dateText}</strong>
          <strong className="bill-num-val">{timeText}</strong>
        </div>
        <div className="bill-head-right">
          <strong className="bill-store">{storeInfo.name}</strong>
          {storeInfo.tagline && <span className="bill-tagline">{storeInfo.tagline}</span>}
          {storeInfo.address && <span>{storeInfo.address}</span>}
          {(storeInfo.phone || storeInfo.email) && (
            <span>{[storeInfo.phone, storeInfo.email].filter(Boolean).join(' · ')}</span>
          )}
          {storeInfo.gstin && <span className="bill-gstin">GSTIN: {storeInfo.gstin}</span>}
        </div>
      </header>

      <main className="bill-body">
        <h2 className="bill-title">
          BILL <span className="bill-num-val">{billNum}</span>
        </h2>

        <section className="bill-customer">
          <div>
            <span className="bill-caption">Customer</span>
            <strong>{customerName || 'Walk-in customer'}</strong>
          </div>
          {customerMobile && (
            <div>
              <span className="bill-caption">Mobile</span>
              <strong className="bill-num-val">{customerMobile}</strong>
            </div>
          )}
          {customerEmail && (
            <div>
              <span className="bill-caption">Email</span>
              <strong>{customerEmail}</strong>
            </div>
          )}
        </section>

        <table className="bill-table">
          <colgroup>
            <col style={{ width: '7%' }} />
            <col style={{ width: '43%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '22%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th className="num">Qty</th>
              <th className="num">Rate</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const qty = it.qty || it.quantity || 1
              const price = Number(it.price) || 0
              const variant = [it.colour, it.size ? `Size ${it.size}` : ''].filter(Boolean).join(' · ')
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{it.name || it.product_name}</strong>
                    {variant && <small>{variant}</small>}
                  </td>
                  <td className="num">{qty}</td>
                  <td className="num">{formatINR(price)}</td>
                  <td className="num">{formatINR(price * qty)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <section className="bill-totals">
          <div className="bill-line">
            <span>Subtotal</span>
            <span className="bill-num-val">{formatINR(sale.subtotal)}</span>
          </div>
          {discount > 0 && (
            <>
              <div className="bill-line bill-discount">
                <span>Discount{discountPct ? ` (${discountPct}%)` : ''}</span>
                <span className="bill-num-val">-{formatINR(discount)}</span>
              </div>
              <div className="bill-line">
                <span>After discount</span>
                <span className="bill-num-val">{formatINR(sale.after_discount || sale.afterDiscount)}</span>
              </div>
            </>
          )}
          {sale.round_off && rounding !== 0 && (
            <div className="bill-line">
              <span>Round-off adjustment</span>
              <span className="bill-num-val">
                {rounding > 0 ? '+' : '-'}
                {formatINR(Math.abs(rounding))}
              </span>
            </div>
          )}
          <div className="bill-line bill-grand">
            <span>FINAL BILL</span>
            <span className="bill-num-val">{formatINR(sale.total)}</span>
          </div>
          <div className="bill-line bill-pay">
            <span>Mode of payment</span>
            <strong>{sale.payment_method || sale.payment || 'Cash'}</strong>
          </div>
        </section>
      </main>

      {storeInfo.note && <footer className="bill-foot">{storeInfo.note}</footer>}
    </div>
  )
}

export default function ReceiptModal({ sale, storeInfo: propStoreInfo, onClose }) {
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

  const billNum = sale.bill_number || sale.bill || 'AJ-000000'

  // Browsers suggest the page title as the PDF file name, so the bill number becomes
  // the file name (e.g. AJ-000001.pdf). The title is put back once printing is done.
  const handlePrint = () => {
    const previousTitle = document.title
    const restore = () => {
      document.title = previousTitle
      window.removeEventListener('afterprint', restore)
    }
    document.title = billNum
    window.addEventListener('afterprint', restore)
    window.print()
  }

  return (
    <>
      <div className="modal" onClick={onClose}>
        <div className="modal-card" style={{ width: 'min(680px, 100%)', padding: 20 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-head" style={{ marginBottom: 14 }}>
            <span className="eyebrow">SALE RECEIPT</span>
            <button type="button" onClick={onClose} aria-label="Close receipt">
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className="btn primary full"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Printer size={16} /> Print / Save PDF ({billNum}.pdf)
            </button>
          </div>

          <BillSheet sale={sale} storeInfo={storeInfo} />
        </div>
      </div>

      {/* The printed copy lives outside the app root so printing shows this bill only, on one page. */}
      {createPortal(
        <div className="print-root" aria-hidden="true">
          <BillSheet sale={sale} storeInfo={storeInfo} />
        </div>,
        document.body
      )}
    </>
  )
}
