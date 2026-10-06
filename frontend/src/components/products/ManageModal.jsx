import { useState, useEffect } from 'react'
import { X, Pencil, Trash2 } from 'lucide-react'
import { formatINR } from '../../utils/format'

export default function ManageModal({ product, onEdit, onDelete, onRestock, onClose }) {
  const p = product
  const [restockQty, setRestockQty] = useState('')
  const [restocking, setRestocking] = useState(false)
  const [restockErr, setRestockErr] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
      await onRestock(p, qty)
      setRestockQty('')
    } catch (err) {
      setRestockErr(err.message || 'Failed to update stock')
    }
    setRestocking(false)
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
        {p.sku && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Product SKU:</span>
            <code className="sku-badge">{p.sku}</code>
          </div>
        )}

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
      </div>
    </div>
  )
}
