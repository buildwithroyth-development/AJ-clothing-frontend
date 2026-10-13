import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { formatINR } from '../../utils/format'
import { getVectorCategoryIcon } from '../common/ClothingIcons'

export default function VariantPickerModal({
  category,
  products = [],
  cart = {},
  onAddToCart,
  onClose,
  subtotal = 0,
}) {
  const [search, setSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState('All')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Get all unique sizes in this category
  const sizes = ['All', ...new Set(products.map((p) => p.size).filter(Boolean))]

  // Filter products by search and size
  const q = search.trim().toLowerCase()
  const filtered = products.filter((p) => {
    const matchSize = sizeFilter === 'All' || p.size === sizeFilter
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.colour || '').toLowerCase().includes(q) ||
      (p.size || '').toLowerCase().includes(q)
    return matchSize && matchSearch
  })

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  const handleAdd = (product) => {
    onAddToCart(product)
    const variantDesc = [product.colour, product.size ? `Size ${product.size}` : '']
      .filter(Boolean)
      .join(' · ')
    setStatusMsg(`Added ${product.name}${variantDesc ? ` (${variantDesc})` : ''} to bill.`)
    setTimeout(() => setStatusMsg(''), 2500)
  }

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-card picker-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="picker-top">
          <div className="modal-head">
            <span className="eyebrow">SELECT PRODUCTS · {category.toUpperCase()}</span>
            <button type="button" onClick={onClose} aria-label="Close product selection">
              <X size={20} />
            </button>
          </div>
          <h2 id="picker-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--light)',
                color: 'var(--accent)',
              }}
            >
              {getVectorCategoryIcon(category, { size: 20, strokeWidth: 1.8 })}
            </span>
            {category} collection
          </h2>
          <p>Select the exact colour and size. Add multiple items, then review your bill.</p>

          <div className="search-wrap" style={{ maxWidth: '100%', marginBottom: 12 }}>
            <Search size={14} className="search-icon" />
            <input
              id="picker-search"
              className="search-input"
              aria-label="Search products in this category"
              placeholder="Search model, colour or size…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
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

          <div className="filters" role="group" aria-label="Filter by size" style={{ margin: '8px 0 0' }}>
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={sizeFilter === s ? 'active' : ''}
                onClick={() => setSizeFilter(s)}
                aria-pressed={sizeFilter === s}
              >
                {s === 'All' ? 'All sizes' : `Size ${s}`}
              </button>
            ))}
          </div>

          <div className="picker-status" role="status" aria-live="polite">
            {statusMsg}
          </div>
        </div>

        <div className="picker-body">
          {filtered.length > 0 ? (
            <div className="variant-grid">
              {filtered.map((p) => {
                const inCart = cart[p.id] || 0
                const availableLeft = Math.max(0, (p.stock || 0) - inCart)
                const isOutOfStock = p.stock <= 0
                const isCartLimit = !isOutOfStock && availableLeft === 0

                return (
                  <article key={p.id} className="variant-card">
                    <h3>{p.name}</h3>
                    <div className="variant-meta">
                      {p.colour && <span>{p.colour}</span>}
                      {p.size && (
                        <span>
                          {p.size.toLowerCase().startsWith('size') ? p.size : `Size ${p.size}`}
                        </span>
                      )}
                    </div>

                    <div className="variant-price">
                      <strong>{formatINR(p.price)}</strong>
                      <span
                        className={`pill ${
                          availableLeft <= 3 ? 'low' : availableLeft <= 8 ? 'mid' : 'ok'
                        }`}
                      >
                        {availableLeft > 0
                          ? `${availableLeft} available`
                          : isOutOfStock
                          ? 'Out of stock'
                          : 'All in bill'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`btn ${availableLeft > 0 ? 'primary' : ''} full`}
                      onClick={() => handleAdd(p)}
                      disabled={availableLeft <= 0}
                    >
                      {availableLeft > 0
                        ? '＋ Add to bill'
                        : isCartLimit
                        ? 'Stock limit reached'
                        : 'Out of stock'}
                    </button>

                    <p className="muted" style={{ fontSize: 11, margin: '8px 0 0' }}>
                      {inCart > 0 ? `${inCart} in current bill` : 'Not added yet'}
                    </p>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty" style={{ padding: '36px 12px' }}>
              <strong>No products found</strong>
              <p style={{ margin: '4px 0' }}>
                {products.length === 0
                  ? 'Add products in Stock maintenance to start billing this category.'
                  : 'No variants match your search or size filter.'}
              </p>
            </div>
          )}
        </div>

        <div className="picker-footer">
          <div>
            <b>
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in bill · {formatINR(subtotal)}
            </b>
            <small>Items are added to cart. Stock is officially deducted when you confirm the sale.</small>
          </div>
          <button type="button" className="btn primary" onClick={onClose}>
            Done · Review bill →
          </button>
        </div>
      </div>
    </div>
  )
}
