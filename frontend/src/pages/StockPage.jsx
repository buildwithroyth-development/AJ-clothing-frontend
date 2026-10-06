import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, X, Loader2, Sparkles, ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import api from '../api/client'
import { formatINR, stockPill } from '../utils/format'
import ProductModal from '../components/products/ProductModal'
import ManageModal from '../components/products/ManageModal'
import DeleteConfirmModal from '../components/products/DeleteConfirmModal'

export default function StockPage() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [activeCat, setActiveCat]   = useState('All')
  const [modal, setModal]           = useState(null) // null | {type:'add'|'edit'|'manage', data?}
  const [notice, setNotice]         = useState('')

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/'),
      ])
      setProducts(Array.isArray(prods) ? prods : (prods.results || []))
      setCategories(Array.isArray(cats) ? cats : (cats.results || []))
    } catch {
      /* server offline — handled gracefully */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Derive category filter pills from actual product data
  const uniqueCats = ['All', ...new Set(products.map((p) => p.category_name).filter(Boolean))]

  const filtered = products.filter((p) => {
    const matchCat = activeCat === 'All' || p.category_name === activeCat
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.colour || '').toLowerCase().includes(q) ||
      (p.size || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category_name || '').toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const handleSave = (saved) => {
    setProducts((ps) => {
      const idx = ps.findIndex((p) => p.id === saved.id)
      return idx >= 0 ? ps.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...ps]
    })
    setModal(null)
    flash(`Product "${saved.name}" saved.`)
  }

  const confirmDelete = async (product) => {
    try {
      await api.delete(`/products/${product.id}/`)
      setProducts((ps) => ps.filter((p) => p.id !== product.id))
      setModal(null)
      const remaining = products.filter((p) => p.id !== product.id)
      if (activeCat !== 'All' && !remaining.some((p) => p.category_name === activeCat)) {
        setActiveCat('All')
      }
      flash(`Deleted "${product.name}". Saved bills are retained.`)
    } catch (err) {
      flash(err.message || 'Failed to delete product')
    }
  }

  const handleRestock = async (product, amount) => {
    const newStock = product.stock + amount
    const updated = await api.patch(`/products/${product.id}/`, { stock: newStock })
    setProducts((ps) => ps.map((p) => (p.id === product.id ? updated : p)))
    setModal({ type: 'manage', data: updated })
    flash(`Added ${amount} units to ${product.name}. Available stock is now ${newStock}.`)
  }

  return (
    <div>
      {/* Page heading */}
      <div className="head">
        <div>
          <span className="eyebrow">INVENTORY</span>
          <h1>Stock maintenance.</h1>
          <p>Manage your products by colour and size.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setModal({ type: 'add' })}>
          <Plus size={16} strokeWidth={2.4} style={{ marginRight: 6 }} /> Add new product
        </button>
      </div>

      {notice && (
        <div className="notice">
          <Sparkles size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {/* Product table panel */}
      <section className="panel">
        <div className="panel-title toolbar">
          <div>
            <span className="eyebrow">YOUR CATALOGUE</span>
            <h3>
              Products{' '}
              <span className="muted" style={{ font: '12px DM Sans, sans-serif' }}>
                {filtered.length}
              </span>
            </h3>
          </div>
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              id="stock-search"
              className="search-input"
              placeholder="Search name, colour, size or SKU…"
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

        {/* Category filter pills — auto-built from products */}
        <div className="filters">
          {uniqueCats.map((cat) => {
            const count = cat === 'All' ? products.length : products.filter((p) => p.category_name === cat).length
            return (
              <button
                key={cat}
                type="button"
                data-category={cat}
                className={cat === activeCat ? 'active' : ''}
                onClick={() => setActiveCat(cat)}
              >
                {cat} <span className="filter-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty"><i><Loader2 size={24} className="spin" /></i><strong>Loading…</strong></div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>VARIANT</th>
                    <th>PRICE</th>
                    <th>AVAILABLE</th>
                    <th style={{ textAlign: 'right', paddingRight: 16 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <div className="avatar">{(p.name?.[0] || 'P').toUpperCase()}</div>
                          <div>
                            <b style={{ display: 'block', fontSize: 13 }}>{p.name}</b>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                              <small style={{ color: 'var(--muted)', fontSize: 11 }}>{p.category_name || 'Uncategorized'}</small>
                              {p.sku && <span className="sku-badge">{p.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          {p.colour && <span style={{ color: 'var(--ink)' }}>{p.colour}</span>}
                          {p.colour && p.size && <span style={{ color: 'var(--muted)', fontSize: 10 }}>·</span>}
                          {p.size && (
                            <span className="size-badge">
                              {p.size.toLowerCase().startsWith('size') ? p.size : `Size ${p.size}`}
                            </span>
                          )}
                          {!p.colour && !p.size && <span className="muted">—</span>}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--ink)' }}>
                        {formatINR(p.price)}
                      </td>
                      <td>{stockPill(p.stock)}</td>
                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="btn tiny"
                            onClick={() => setModal({ type: 'manage', data: p })}
                          >
                            Details <ArrowUpRight size={13} style={{ marginLeft: 3 }} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title={`Edit ${p.name}`}
                            onClick={() => setModal({ type: 'edit', data: p })}
                          >
                            <Pencil size={15} strokeWidth={1.9} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title={`Delete ${p.name}`}
                            onClick={() => setModal({ type: 'delete', data: p })}
                          >
                            <Trash2 size={15} strokeWidth={1.9} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty">
                  <i><Sparkles size={24} strokeWidth={1.6} /></i>
                  <strong>No matching products</strong>
                  {search ? (
                    <p style={{ margin: '4px 0 12px' }}>No items match &quot;{search}&quot;. Try another term or clear your search.</p>
                  ) : (
                    <p style={{ margin: '4px 0 12px' }}>Add your first product using the button above.</p>
                  )}
                  {search && (
                    <button type="button" className="btn tiny" onClick={() => setSearch('')}>
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Modals */}
      {modal?.type === 'add' && (
        <ProductModal
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'edit' && (
        <ProductModal
          initial={{
            ...modal.data,
            category: modal.data.category_name || '',
          }}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'manage' && (
        <ManageModal
          product={modal.data}
          onEdit={() => setModal({ type: 'edit', data: modal.data })}
          onDelete={() => setModal({ type: 'delete', data: modal.data })}
          onRestock={handleRestock}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal
          product={modal.data}
          onConfirm={confirmDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
