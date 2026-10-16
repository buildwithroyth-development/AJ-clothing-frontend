import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer, Mail, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react'
import api from '../../api/client'
import { formatINR } from '../../utils/format'
import { getSettings } from '../../utils/settings'

// The bill itself. Used for the on-screen preview and for the printed / PDF copy.
//   top-left  : bill date and time
//   top-right : store details
//   centre    : bill number, customer, items, pricing, discount, total, payment mode
export function BillSheet({ sale, storeInfo }) {
  const items = sale.items || []
  const billNum = sale.bill_number || sale.bill || 'AJ-000000'
  const rawDate = sale.created_at || sale.at
  const when = rawDate ? new Date(rawDate) : null
  const dateText = when ? when.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const timeText = when ? when.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '—'

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
  const [settings] = useState(getSettings)
  const [currentSale, setCurrentSale] = useState(sale)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailInput, setEmailInput] = useState(sale?.customer_email || sale?.customerEmail || '')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailNotice, setEmailNotice] = useState(null) // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    setCurrentSale(sale)
    setEmailInput(sale?.customer_email || sale?.customerEmail || '')
    setEmailNotice(null)
  }, [sale])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!currentSale) return null

  const storeInfo = propStoreInfo || {
    name: settings.storeName || 'AJ Clothing Store',
    tagline: settings.tagline || '',
    address: settings.address || 'Commercial Street, Bangalore',
    phone: settings.phone || '+91 98765 43210',
    email: settings.email || 'contact@ajclothing.com',
    gstin: settings.gstin || '',
    note: (settings.note || 'Thank you for shopping with us!')
      .replace(/returns?\s+within\s+\d+\s+days[^\n.]*\.?/gi, '')
      .trim() || 'Thank you for shopping with us!',
  }

  const billNum = currentSale.bill_number || currentSale.bill || 'AJ-000000'

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

  const handleSendEmail = async (overrideTarget) => {
    const target = (typeof overrideTarget === 'string' ? overrideTarget : emailInput).trim()
    if (!target || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(target)) {
      setShowEmailForm(true)
      setEmailNotice({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }

    setSendingEmail(true)
    setEmailNotice(null)

    try {
      const res = await api.post(`/sales/${currentSale.id || billNum}/send_email/`, { email: target })
      const updated = res.sale || { ...currentSale, customer_email: target, email_status: 'sent' }
      setCurrentSale(updated)
      setShowEmailForm(false)
      setEmailNotice({
        type: 'success',
        text: `Receipt PDF successfully sent to ${target}!`,
      })
    } catch (err) {
      setEmailNotice({
        type: 'error',
        text: err.message || 'Failed to send receipt email. Please verify connection and SMTP settings.',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const emailStatus = currentSale.email_status
  const customerEmail = currentSale.customer_email || currentSale.customerEmail

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

          {/* Action Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            <button
              type="button"
              className="btn full"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42 }}
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              type="button"
              className={`btn full ${emailStatus === 'sent' ? '' : 'primary'}`}
              onClick={() => {
                if (showEmailForm) {
                  handleSendEmail()
                } else if (customerEmail) {
                  handleSendEmail(customerEmail)
                } else {
                  setShowEmailForm(true)
                }
              }}
              disabled={sendingEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 42,
                borderColor: emailStatus === 'sent' ? '#3c7a52' : undefined,
                background: emailStatus === 'sent' ? '#edf7f0' : undefined,
                color: emailStatus === 'sent' ? '#2e6b43' : undefined,
              }}
              title={customerEmail ? `Send PDF bill to ${customerEmail}` : 'Send PDF bill to customer email'}
            >
              {sendingEmail ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Mail size={16} />
              )}
              {sendingEmail
                ? 'Sending bill…'
                : emailStatus === 'sent'
                ? 'Resend Bill'
                : customerEmail
                ? 'Send Bill to Email'
                : 'Send Bill'}
            </button>
          </div>

          {/* Recipient status & change email trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 10, padding: '0 2px' }}>
            <span className="muted">
              {customerEmail ? (
                <>Recipient: <strong>{customerEmail}</strong></>
              ) : (
                <>No email attached to this bill</>
              )}
            </span>
            <button
              type="button"
              className="btn tiny"
              style={{ padding: '2px 8px', fontSize: 11 }}
              onClick={() => {
                setShowEmailForm((prev) => !prev)
                setEmailNotice(null)
              }}
            >
              {showEmailForm ? 'Hide' : customerEmail ? 'Change email' : 'Add email'}
            </button>
          </div>

          {/* Email Form / Feedback */}
          {showEmailForm && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }} style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="email"
                placeholder="customer@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoFocus
                style={{ flex: 1, margin: 0, padding: '7px 10px', fontSize: 13 }}
                disabled={sendingEmail}
              />
              <button
                type="submit"
                className="btn primary tiny"
                disabled={sendingEmail}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px' }}
              >
                {sendingEmail ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
                {sendingEmail ? 'Sending…' : 'Send'}
              </button>
              <button
                type="button"
                className="btn tiny"
                onClick={() => setShowEmailForm(false)}
                disabled={sendingEmail}
                style={{ height: 34 }}
              >
                Cancel
              </button>
            </form>
          )}

          {emailNotice && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: emailNotice.type === 'success' ? '#edf7f0' : '#fdf2f2',
                color: emailNotice.type === 'success' ? '#2e6b43' : '#a32b2b',
                border: `1px solid ${emailNotice.type === 'success' ? '#c2e5ce' : '#f3c4c4'}`,
              }}
            >
              {emailNotice.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{emailNotice.text}</span>
            </div>
          )}

          {!emailNotice && emailStatus === 'sent' && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#edf7f0',
                color: '#2e6b43',
                border: '1px solid #c2e5ce',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Receipt PDF was sent to <strong>{customerEmail}</strong></span>
            </div>
          )}

          {!emailNotice && emailStatus === 'failed' && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fdf2f2',
                color: '#a32b2b',
                border: '1px solid #f3c4c4',
              }}
            >
              <AlertCircle size={15} />
              <span>Email delivery failed ({currentSale.email_error || 'SMTP Error'}). Click &quot;Send Bill&quot; to retry.</span>
            </div>
          )}

          <BillSheet sale={currentSale} storeInfo={storeInfo} />
        </div>
      </div>

      {/* The printed copy lives outside the app root so printing shows this bill only, on one page. */}
      {createPortal(
        <div className="print-root" aria-hidden="true">
          <BillSheet sale={currentSale} storeInfo={storeInfo} />
        </div>,
        document.body
      )}
    </>
  )
}

