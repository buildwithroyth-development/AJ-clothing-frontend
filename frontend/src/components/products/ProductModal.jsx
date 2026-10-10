import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import api from '../../api/client'

export default function ProductModal({
  initial,
  categories,
  existingProducts = [],
  onRestock,
  onSave,
  onClose,
}) {
  const blank = {
    name: '', category: '', colour: '', size: '',
    price: '', stock: '', description: '', is_active: true,
  }
  const [form, setForm]     = useState({ ...blank, ...initial })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')
  const [existingMatch, setExistingMatch] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Check for duplicate variant (same name, colour, and size)
  const findDuplicate = (currentName, currentColour, currentSize) => {
    const name = (currentName || '').trim().toLowerCase()
    const colour = (currentColour || '').trim().toLowerCase()
    const size = (currentSize || '').trim().toLowerCase()

    if (!name || !colour || !size) return null

    return existingProducts.find((p) => {
      if (initial?.id && String(p.id) === String(initial.id)) return false
      return (
        (p.name || '').trim().toLowerCase() === name &&
        (p.colour || '').trim().toLowerCase() === colour &&
        (p.size || '').trim().toLowerCase() === size
      )
    })
  }

  const set = (k) => (e) => {
    const val = e.target.value
    setForm((f) => {
      const updated = { ...f, [k]: val }
      // Live check for existing product variant
      const match = findDuplicate(updated.name, updated.colour, updated.size)
      setExistingMatch(match || null)
      if (match) {
        setErr(`This product already exists with the same colour and size (Current stock: ${match.stock} units).`)
      } else {
        setErr('')
      }
      return updated
    })
  }

  const handleAddToExistingStock = async () => {
    if (!existingMatch || !onRestock) return
    const addQty = parseInt(form.stock, 10)
    if (!addQty || addQty <= 0) {
      setErr('Please enter a valid stock quantity to add.')
      return
    }

    setSaving(true)
    setErr('')
    try {
      await onRestock(existingMatch, addQty)
      onClose()
    } catch (e) {
      setErr(e.message || 'Failed to update existing stock.')
      setSaving(false)
    }
  }

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

    // Check duplicate
    const duplicate = findDuplicate(form.name, form.colour, form.size)
    if (duplicate) {
      setExistingMatch(duplicate)
      setErr(
        `This product already exists with the same colour and size (Current stock: ${duplicate.stock} units). You can update the existing stock above or choose a different size/colour.`
      )
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
      setErr(error.message || 'Failed to save product.')
    }
    setSaving(false)
  }

  const catOptions = categories.map((c) => ({ id: c.id, name: c.name }))
  const parsedStock = parseInt(form.stock, 10) || 0

  return (
    <div className="modal" onClick={onClose}>
      <form className="modal-card" id="product-form" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="eyebrow">{initial?.id ? 'EDIT PRODUCT DETAILS' : 'NEW PRODUCT VARIANT'}</span>
          <button type="button" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>
        <h2>{initial?.id ? 'Edit product' : 'Add to your catalogue'}</h2>

        {existingMatch && (
          <div
            className="notice error"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'flex-start',
              marginBottom: 16,
              background: '#fbe8e4',
              border: '1px solid #e8b0a7',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="#9f3c31" />
              <strong style={{ color: '#9f3c31' }}>This product variant already exists!</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#4a2824' }}>
              <strong>{existingMatch.name}</strong> ({existingMatch.colour} · Size {existingMatch.size}) already exists with <strong>{existingMatch.stock} units</strong> in stock.
            </p>
            {onRestock && (
              <div style={{ marginTop: 4 }}>
                <button
                  type="button"
                  className="btn primary tiny"
                  onClick={handleAddToExistingStock}
                  disabled={saving || parsedStock <= 0}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {parsedStock > 0
                    ? `Add +${parsedStock} units to existing stock`
                    : 'Enter stock below to add to existing stock'}
                </button>
              </div>
            )}
          </div>
        )}

        {err && !existingMatch && <div className="notice error">{err}</div>}

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
          Fields marked with <span style={{ color: 'var(--accent)', fontWeight: 700 }}>*</span> are required. Different sizes of the same product and colour are supported.
        </p>

        <button type="submit" className="btn primary full" disabled={saving || !!existingMatch} style={{ marginTop: 8 }}>
          {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Save product'}
        </button>
      </form>
    </div>
  )
}
