import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../api/client'

export default function ProductModal({ initial, categories, onSave, onClose }) {
  const blank = {
    name: '', category: '', colour: '', size: '',
    price: '', stock: '', sku: '', description: '', is_active: true,
  }
  const [form, setForm]     = useState({ ...blank, ...initial })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Product name is required.'); return }
    setSaving(true)
    setErr('')
    const payload = {
      ...form,
      category: form.category?.trim() || null,
      sku: form.sku?.trim() || null,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
    }
    try {
      const result = initial?.id
        ? await api.patch(`/products/${initial.id}/`, payload)
        : await api.post('/products/', payload)
      if (result?.id) {
        onSave(result)
      } else {
        setErr('Unexpected server response.')
      }
    } catch (error) {
      setErr(error.message || 'Network error. Is the server running?')
    }
    setSaving(false)
  }

  const catOptions = categories.map((c) => ({ id: c.id, name: c.name }))

  return (
    <div className="modal" onClick={onClose}>
      <form className="modal-card" id="product-form" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="eyebrow">{initial?.id ? 'EDIT PRODUCT DETAILS' : 'NEW PRODUCT VARIANT'}</span>
          <button type="button" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        <h2>{initial?.id ? 'Edit product' : 'Add to your catalogue'}</h2>

        {err && <div className="notice error">{err}</div>}

        <div className="form-grid">
          <div>
            <label htmlFor="p-name">Product name</label>
            <input id="p-name" value={form.name} onChange={set('name')} placeholder="e.g. Linen Shirt" required />
          </div>
          <div>
            <label htmlFor="p-category">Category</label>
            <input
              id="p-category"
              list="category-list"
              value={form.category}
              onChange={set('category')}
              placeholder="e.g. Shirts"
            />
            <datalist id="category-list">
              {catOptions.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="p-colour">Colour</label>
            <input id="p-colour" value={form.colour} onChange={set('colour')} placeholder="e.g. White" />
          </div>
          <div>
            <label htmlFor="p-size">Size</label>
            <input id="p-size" value={form.size} onChange={set('size')} placeholder="e.g. M" />
          </div>
          <div>
            <label htmlFor="p-price">Selling price (₹)</label>
            <input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="p-stock">{initial?.id ? 'Available stock' : 'Initial stock'}</label>
            <input id="p-stock" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} placeholder="0" />
          </div>
          <div className="wide">
            <label htmlFor="p-sku">SKU <span className="muted" style={{ fontWeight: 400 }}>· optional</span></label>
            <input id="p-sku" value={form.sku} onChange={set('sku')} placeholder="e.g. SHT-001-WHT-M" />
          </div>
        </div>

        <p className="muted" style={{ fontSize: 11, marginTop: 10 }}>
          Each colour and size is tracked separately.
        </p>

        <button type="submit" className="btn primary full" disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Save product'}
        </button>
      </form>
    </div>
  )
}
