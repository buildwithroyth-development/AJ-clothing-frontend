import { useState, useEffect } from 'react'
import { X, Pencil, Trash2, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatINR } from '../../utils/format'
import api from '../../api/client'

export default function ManageModal({ product, onEdit, onDelete, onRestock, onClose }) {
  const p = product
  const [restockQty, setRestockQty] = useState('')
  const [restocking, setRestocking] = useState(false)
  const [restockErr, setRestockErr] = useState('')
  const [history, setHistory] = useState(() => {
    // Check if initial product already has stock_history from API or localStorage
    const local = localStorage.getItem(`aj-stock-history-${p.id}`)
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    return p.stock_history || []
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Fetch latest stock history from backend if endpoint is available
  useEffect(() => {
    let cancelled = false
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/products/${p.id}/history/`).catch(() => null)
        if (!cancelled && Array.isArray(res) && res.length > 0) {
          setHistory(res)
          localStorage.setItem(`aj-stock-history-${p.id}`, JSON.stringify(res))
        }
      } catch {}
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [p.id])

  const handleRestock = async (e) => {
    e.preventDefault()
    const qty = parseInt(restockQty, 10)
    if (!qty || qty <= 0) {
      setRestockErr('Please enter a valid whole number.')
      return
    }
    setRestocking(true)
    setRestockErr('')
    try {
      const updated = await onRestock(p, qty)
      const newEntry = {
        id: Date.now(),
        change: qty,
        reason: 'Stock added (Restock)',
        created_at: new Date().toISOString(),
      }
      setHistory((prev) => {
        const next = [newEntry, ...(Array.isArray(prev) ? prev : [])]
        localStorage.setItem(`aj-stock-history-${p.id}`, JSON.stringify(next))
        return next
      })
      setRestockQty('')
    } catch (err) {
      setRestockErr(err.message || 'Failed to update stock')
    }
    setRestocking(false)
  }

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return 'Just now'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="eyebrow">PRODUCT DETAILS</span>
          <button type="button" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        <h2>{p.name}</h2>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button type="button" className="icon-btn" title="Edit" onClick={onEdit}>
            <Pencil size={15} strokeWidth={1.9} />
          </button>
          <button type="button" className="icon-btn danger" title="Delete" onClick={onDelete}>
            <Trash2 size={15} strokeWidth={1.9} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 0 14px', flexWrap: 'wrap' }}>
          {p.category_name && <span className="muted">{p.category_name}</span>}
          {p.category_name && p.colour && <span className="muted" style={{ fontSize: 10 }}>·</span>}
          {p.colour && <span style={{ color: 'var(--ink)' }}>{p.colour}</span>}
          {(p.category_name || p.colour) && p.size && <span className="muted" style={{ fontSize: 10 }}>·</span>}
          {p.size && (
            <span className="size-badge">
              {p.size.toLowerCase().startsWith('size') ? p.size : `Size ${p.size}`}
            </span>
          )}
        </div>
        <div className="columns" style={{ margin: '15px 0' }}>
          <div className="stat">
            <small>Available stock</small>
            <strong>{p.stock} units</strong>
          </div>
          <div className="stat">
            <small>Selling price</small>
            <strong>{formatINR(p.price)}</strong>
          </div>
        </div>


        {/* Add Stock Section */}
        <form onSubmit={handleRestock} style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 14 }}>
          <label htmlFor="restock-qty" style={{ fontWeight: 600, color: 'var(--ink)' }}>
            Add stock (units received)
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              id="restock-qty"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Enter quantity to add"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn primary"
              disabled={restocking}
              style={{ whiteSpace: 'nowrap' }}
            >
              {restocking ? 'Adding…' : '+ Add stock'}
            </button>
          </div>
          {restockErr && <p style={{ color: 'var(--accent)', fontSize: 11, margin: '6px 0 0' }}>{restockErr}</p>}
        </form>

        {/* Stock History Section */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontFamily: 'Playfair Display, Georgia, serif', fontSize: 17, display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />
              Stock history
            </h3>
            <span className="muted" style={{ fontSize: 11 }}>
              {history.length} {history.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {history && history.length > 0 ? (
            <div style={{ display: 'grid', gap: 7, maxHeight: 190, overflowY: 'auto', paddingRight: 2 }}>
              {history.map((m, idx) => (
                <div key={m.id || idx} className="history-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {m.change > 0 ? (
                      <ArrowDownLeft size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    ) : (
                      <ArrowUpRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    )}
                    <div>
                      <strong style={{ display: 'block', fontSize: 12 }}>{m.reason || 'Stock movement'}</strong>
                      <small>{formatHistoryDate(m.created_at || m.at)}</small>
                    </div>
                  </div>
                  <span className={`history-pill ${m.change > 0 ? 'positive' : 'negative'}`}>
                    {m.change > 0 ? `+${m.change}` : m.change} units
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '14px 10px', textAlign: 'center', background: 'var(--bg)', borderRadius: 8 }}>
              <small className="muted">No stock movements recorded yet. Changes will appear here as stock is adjusted or billed.</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
