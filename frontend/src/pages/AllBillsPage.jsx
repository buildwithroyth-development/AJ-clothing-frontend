import { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, Sparkles, Printer, Receipt, Eye } from 'lucide-react'
import api from '../api/client'
import { formatINR } from '../utils/format'
import ReceiptModal from '../components/billing/ReceiptModal'

export default function AllBillsPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewingSale, setViewingSale] = useState(null)

  const loadSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/sales/').catch(() => api.get('/sales').catch(() => []))
      setSales(Array.isArray(res) ? res : res?.results || [])
    } catch {
      /* handled gracefully */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const q = search.trim().toLowerCase()
  const filtered = sales.filter((s) => {
    if (!q) return true
    const bill = (s.bill_number || s.bill || '').toLowerCase()
    const name = (s.customer_name || s.customerName || '').toLowerCase()
    const mobile = (s.customer_mobile || s.customerMobile || '').toLowerCase()
    const payment = (s.payment_method || s.payment || '').toLowerCase()
    return bill.includes(q) || name.includes(q) || mobile.includes(q) || payment.includes(q)
  })

  return (
    <div>
      <div className="head">
        <div>
          <span className="eyebrow">SALES HISTORY</span>
          <h1>All bills.</h1>
          <p>Revisit every saved bill, inspect details, and print receipts.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-title toolbar">
          <div>
            <span className="eyebrow">{sales.length} SAVED BILLS</span>
            <h3>
              Bill register{' '}
              <span className="muted" style={{ font: '12px DM Sans, sans-serif' }}>
                {filtered.length}
              </span>
            </h3>
          </div>
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              id="bills-search"
              className="search-input"
              placeholder="Search bill, customer, mobile or payment…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="empty">
            <i><Loader2 size={24} className="spin" /></i>
            <strong>Loading bills…</strong>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>BILL NUMBER</th>
                  <th>DATE & TIME</th>
                  <th>CUSTOMER</th>
                  <th>MOBILE</th>
                  <th>PAYMENT</th>
                  <th>TOTAL</th>
                  <th style={{ textAlign: 'right', paddingRight: 16 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const billNum = s.bill_number || s.bill || 'AJ-000000'
                  const dateStr = s.created_at || s.at
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Today'

                  return (
                    <tr key={s.id || billNum}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Receipt size={16} color="var(--accent)" />
                          <b style={{ color: 'var(--ink)' }}>{billNum}</b>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formattedDate}</td>
                      <td>{s.customer_name || s.customerName || 'Walk-in customer'}</td>
                      <td style={{ color: 'var(--muted)' }}>{s.customer_mobile || s.customerMobile || '—'}</td>
                      <td>
                        <span className="pill ok" style={{ background: '#f5efe8', color: 'var(--accent)' }}>
                          {s.payment_method || s.payment || 'Cash'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{formatINR(s.total)}</td>
                      <td>
                        <div className="product-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn tiny"
                            onClick={() => setViewingSale(s)}
                          >
                            <Eye size={13} style={{ marginRight: 4 }} /> View
                          </button>
                          <button
                            type="button"
                            className="btn tiny primary"
                            onClick={() => setViewingSale(s)}
                            title="Print receipt"
                          >
                            <Printer size={13} style={{ marginRight: 4 }} /> Print / PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="empty">
                <i><Sparkles size={24} strokeWidth={1.6} /></i>
                <strong>No matching bills</strong>
                <p style={{ margin: '4px 0 12px' }}>
                  {search
                    ? `No bills match "${search}". Try another term or clear your search.`
                    : 'Confirmed sales will appear here.'}
                </p>
                {search && (
                  <button type="button" className="btn tiny" onClick={() => setSearch('')}>
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {viewingSale && (
        <ReceiptModal
          sale={viewingSale}
          onClose={() => setViewingSale(null)}
        />
      )}
    </div>
  )
}
