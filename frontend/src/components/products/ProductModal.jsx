import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../api/client'

export default function ProductModal({ initial, categories, onSave, onClose }) {
  const blank = {
    name: '', category: '', colour: '', size: '',
    price: '', stock: '', description: '', is_active: true,
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

    // Enforce required fields: Product Name, Category, Colour, Size, Selling Price
    if (!form.name?.trim()) {
      setErr('Product name is required.')
      return
    }
    if (!form.category?.trim()) {
      setErr('Category is required.')
      return
    }
    if (!form.colour?.trim()) {
      setErr('Colour is required.')
      return
    }
    if (!form.size?.trim()) {
      setErr('Size is required.')
      return
    }
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) {
      setErr('Selling price is required and must be a valid amount.')
      return
    }

    setSaving(true)
    setErr('')

    const payload = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      colour: form.colour.trim(),
      size: form.size.trim(),
      price: parseFloat(form.price) || 0,
      stock: form.stock !== '' ? parseInt(form.stock, 10) || 0 : 0,
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
            <label htmlFor="p-name">
              Product name <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span>
            </label>
            <input
              id="p-name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Linen Shirt"
              required
            />
          </div>
          <div>
            <label htmlFor="p-category">
              Category <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span>
            </label>
            <input
              id="p-category"
              list="category-list"
              value={form.category}
              onChange={set('category')}
              placeholder="e.g. Shirts"
              required
            />
            <datalist id="category-list">
              {catOptions.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="p-colour">
              Colour <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span>
            </label>
            <input
              id="p-colour"
              value={form.colour}
              onChange={set('colour')}
              placeholder="e.g. White"
              required
            />
          </div>
          <div>
            <label htmlFor="p-size">
              Size <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span>
            </label>
            <input
              id="p-size"
              value={form.size}
              onChange={set('size')}
              placeholder="e.g. M"
              required
            />
          </div>
          <div>
            <label htmlFor="p-price">
              Selling price (₹) <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span>
            </label>
            <input
              id="p-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label htmlFor="p-stock">
              {initial?.id ? 'Available stock' : 'Initial stock'}{' '}
              <span className="muted" style={{ fontWeight: 400 }}>· optional</span>
            </label>
            <input
              id="p-stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={set('stock')}
              placeholder="0"
            />
          </div>
        </div>

        <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
          Fields marked with <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span> are required. Each colour and size is tracked separately.
        </p>

        <button type="submit" className="btn primary full" disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Save product'}
        </button>
      </form>
    </div>
  )
}
