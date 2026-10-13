import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Loader2,
  Trash2,
  Printer,
  ShoppingBag,
  ArrowRight,
  Receipt,
  Plus,
  Search,
  X,
} from 'lucide-react'
import api from '../api/client'
import { formatINR } from '../utils/format'
import VariantPickerModal from '../components/billing/VariantPickerModal'
import ReceiptModal from '../components/billing/ReceiptModal'

// Dynamic category helper
const getProductCategory = (p) => {
  return (p.category_name || p.category || 'Uncategorized').trim()
}

// Contextual category icons based on category name
const getCategoryIcon = (category = '') => {
  const c = category.toLowerCase()
  if (/shirt/.test(c) && !/t[ -]?shirt/.test(c)) return '👔'
  if (/pant|trouser|bottom|jeans|denim|chinos|jogger/.test(c)) return '👖'
  if (/kurta|kurtha|saree|ethnic|traditional/.test(c)) return '🥻'
  if (/tee|t[ -]?shirt|top/.test(c)) return '👕'
  if (/dress|frock|gown|skirt/.test(c)) return '👗'
  if (/jacket|coat|hoodie|winter|sweater|blazer/.test(c)) return '🧥'
  if (/shoe|footwear|sandal|sneaker|heel/.test(c)) return '👟'
  if (/accessori|cap|hat|belt|wallet|tie|bag/.test(c)) return '🧢'
  return '🛍️'
}

const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export default function BillingPage() {
  const [products, setProducts] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({}) // { [productId]: quantity }
  const [discountPercent, setDiscountPercent] = useState('')
  const [roundOff, setRoundOff] = useState(false)
  const [manualAmount, setManualAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [catalogueSearch, setCatalogueSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState(null)
  const [receiptSale, setReceiptSale] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, sales] = await Promise.all([
        api.get('/products/').catch(() => []),
        api.get('/sales/').catch(() => api.get('/sales').catch(() => [])),
      ])
      setProducts(Array.isArray(prods) ? prods : prods?.results || [])
      setRecentSales(Array.isArray(sales) ? sales : sales?.results || [])
    } catch {
      /* handled gracefully */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fully dynamic categories derived purely from active products in the catalogue
  const dynamicCategories = [
    ...new Set(products.map(getProductCategory).filter(Boolean)),
  ].sort()

  // Filtered catalogue search across all categories
  const catQ = catalogueSearch.trim().toLowerCase()
  const searchedProducts = catQ
    ? products.filter((p) => {
        return (
          p.name.toLowerCase().includes(catQ) ||
          (p.colour || '').toLowerCase().includes(catQ) ||
          (p.size || '').toLowerCase().includes(catQ) ||
          getProductCategory(p).toLowerCase().includes(catQ)
        )
      })
    : []

  // Cart operations
  const addToCart = (product) => {
    const existing = cart[product.id] || 0
    if (existing >= product.stock) {
      setError(`Only ${product.stock} units available for ${product.name}.`)
      return
    }
    setCart((prev) => ({ ...prev, [product.id]: existing + 1 }))
    setError('')
  }

  const updateCartQty = (productId, delta) => {
    const prod = products.find((p) => String(p.id) === String(productId))
    const existing = cart[productId] || 0
    const next = existing + delta

    if (delta > 0 && prod && next > prod.stock) {
      setError(`Only ${prod.stock} units available.`)
      return
    }
    setError('')

    setCart((prev) => {
      const copy = { ...prev }
      if (next <= 0) {
        delete copy[productId]
      } else {
        copy[productId] = next
      }
      return copy
    })
  }

  const clearCart = () => {
    setCart({})
    setDiscountPercent('')
    setRoundOff(false)
    setManualAmount('')
    setCustomerName('')
    setCustomerMobile('')
    setError('')
  }

  // Cart calculation
  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => String(x.id) === String(id))
      return p ? { product: p, qty } : null
    })
    .filter(Boolean)

  const subtotal = money(
    cartEntries.reduce((sum, item) => sum + Number(item.product.price) * item.qty, 0)
  )
  const discountPercentVal = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0))
  const discountAmount = money((subtotal * discountPercentVal) / 100)
  const afterDiscount = money(Math.max(0, subtotal - discountAmount))

  let finalTotal = afterDiscount
  let roundingAdjustment = 0
  if (roundOff) {
    if (manualAmount !== '' && !isNaN(manualAmount)) {
      finalTotal = money(parseFloat(manualAmount))
      roundingAdjustment = money(finalTotal - afterDiscount)
    }
  }

  const totalCartUnits = cartEntries.reduce((sum, i) => sum + i.qty, 0)

  // Confirm Sale
  const handleConfirmSale = async (e) => {
    e.preventDefault()
    if (cartEntries.length === 0) {
      setError('Please add at least one product to the bill.')
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment mode.')
      return
    }
    if (discountPercentVal < 0 || discountPercentVal > 100) {
      setError('Discount percentage must be between 0% and 100%.')
      return
    }
    if (roundOff && (manualAmount === '' || isNaN(manualAmount) || Number(manualAmount) < 0)) {
      setError('Please enter a valid final bill amount.')
      return
    }
    if (customerMobile.trim() && !/^[+\d ()-]{7,20}$/.test(customerMobile.trim())) {
      setError('Please enter a valid phone number (7–20 digits).')
      return
    }

    // Verify current stock
    for (const item of cartEntries) {
      if (item.qty > item.product.stock) {
        setError(`Stock changed! Only ${item.product.stock} units available for ${item.product.name}.`)
        return
      }
    }

    setConfirming(true)
    setError('')

    const payload = {
      items: cartEntries.map((item) => ({
        id: item.product.id,
        product: item.product.id,
        name: item.product.name,
        colour: item.product.colour,
        size: item.product.size,
        price: Number(item.product.price),
        qty: item.qty,
        line_total: money(Number(item.product.price) * item.qty),
      })),
      subtotal,
      discount_percent: discountPercentVal,
      discountPercent: discountPercentVal,
      discount: discountAmount,
      after_discount: afterDiscount,
      afterDiscount,
      round_off: roundOff,
      roundOff,
      rounding_adjustment: roundingAdjustment,
      roundingAdjustment,
      total: finalTotal,
      payment_method: paymentMethod,
      payment: paymentMethod,
      customer_name: customerName.trim(),
      customerName: customerName.trim(),
      customer_mobile: customerMobile.trim(),
      customerMobile: customerMobile.trim(),
    }

    try {
      const savedSale = await api.post('/sales/', payload)
      // Update local product stock
      setProducts((prev) =>
        prev.map((p) => {
          const bought = cart[p.id] || 0
          return bought > 0 ? { ...p, stock: Math.max(0, p.stock - bought) } : p
        })
      )
      setRecentSales((prev) => [savedSale, ...prev.slice(0, 9)])
      clearCart()
      setReceiptSale(savedSale)
      flash(`Bill ${savedSale.bill_number || savedSale.bill} confirmed! Stock updated.`)
    } catch (err) {
      setError(err.message || 'Failed to confirm sale.')
    }
    setConfirming(false)
  }

  return (
    <div>
      {/* Page Heading */}
      <div className="head">
        <div>
          <span className="eyebrow">STORE COUNTER</span>
          <h1>Create a bill.</h1>
          <p>Select products, review the total, and confirm the sale.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {cartEntries.length > 0 && (
            <button type="button" className="btn tiny" onClick={clearCart}>
              <Trash2 size={13} style={{ marginRight: 4 }} /> Clear bill
            </button>
          )}
          <span className="eyebrow" style={{ color: 'var(--muted)', fontSize: 11 }}>
            SALES DESK
          </span>
        </div>
      </div>

      {notice && (
        <div className="notice">
          <Sparkles size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {error && <div className="notice error">{error}</div>}

      <div className="billing">
        {/* Left Column: Product Catalogue & Recent Bills */}
        <div>
          {/* 01 · Select Items by Category */}
          <section className="panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">01 · SELECT ITEMS</span>
                <h3>Product catalogue</h3>
              </div>
              <span className="muted" style={{ fontSize: 12 }}>
                {products.length} variants across {dynamicCategories.length} categories
              </span>
            </div>

            {/* Quick Catalogue Search Bar */}
            <div className="search-wrap" style={{ maxWidth: '100%', margin: '10px 0 16px' }}>
              <Search size={14} className="search-icon" />
              <input
                id="catalogue-search"
                className="search-input"
                placeholder="Search any product, colour, or size across the catalogue…"
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
              />
              {catalogueSearch && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setCatalogueSearch('')}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {loading && products.length === 0 ? (
              <div className="empty">
                <i><Loader2 size={24} className="spin" /></i>
                <strong>Loading catalogue…</strong>
              </div>
            ) : catalogueSearch ? (
              /* Instant Search Results Grid */
              searchedProducts.length > 0 ? (
                <div>
                  <p className="muted" style={{ fontSize: 12, margin: '0 0 12px' }}>
                    Showing {searchedProducts.length} matching {searchedProducts.length === 1 ? 'variant' : 'variants'}:
                  </p>
                  <div className="variant-grid">
                    {searchedProducts.map((p) => {
                      const inCart = cart[p.id] || 0
                      const availableLeft = Math.max(0, (p.stock || 0) - inCart)
                      return (
                        <article key={p.id} className="variant-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <h3>{p.name}</h3>
                            <small className="muted" style={{ fontSize: 11, background: 'var(--card)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--line)' }}>
                              {getProductCategory(p)}
                            </small>
                          </div>
                          <div className="variant-meta">
                            {p.colour && <span>{p.colour}</span>}
                            {p.size && (
                              <span>{p.size.toLowerCase().startsWith('size') ? p.size : `Size ${p.size}`}</span>
                            )}
                          </div>
                          <div className="variant-price">
                            <strong>{formatINR(p.price)}</strong>
                            <span className={`pill ${availableLeft <= 3 ? 'low' : availableLeft <= 8 ? 'mid' : 'ok'}`}>
                              {availableLeft > 0 ? `${availableLeft} available` : p.stock <= 0 ? 'Out of stock' : 'All in bill'}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`btn ${availableLeft > 0 ? 'primary' : ''} full`}
                            onClick={() => addToCart(p)}
                            disabled={availableLeft <= 0}
                          >
                            {availableLeft > 0 ? '＋ Add to bill' : p.stock <= 0 ? 'Out of stock' : 'Stock limit reached'}
                          </button>
                          {inCart > 0 && (
                            <p className="muted" style={{ fontSize: 11, margin: '8px 0 0' }}>
                              {inCart} in current bill
                            </p>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty" style={{ padding: '32px 10px' }}>
                  <i><Sparkles size={22} strokeWidth={1.6} /></i>
                  <strong>No matching products</strong>
                  <p style={{ margin: '4px 0' }}>No variant matches &quot;{catalogueSearch}&quot;.</p>
                  <button type="button" className="btn tiny" onClick={() => setCatalogueSearch('')} style={{ marginTop: 8 }}>
                    Clear search
                  </button>
                </div>
              )
            ) : dynamicCategories.length > 0 ? (
              /* Dynamic Category Tiles */
              <div className="category-grid">
                {dynamicCategories.map((group) => {
                  const groupProds = products.filter((p) => getProductCategory(p) === group)
                  const modelsCount = new Set(groupProds.map((p) => p.name)).size
                  const variantsCount = groupProds.length
                  const inStock = groupProds.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)

                  return (
                    <button
                      key={group}
                      type="button"
                      className="category-tile"
                      onClick={() => setPickerCategory(group)}
                    >
                      <span className="tile-icon" aria-hidden="true">
                        {getCategoryIcon(group)}
                      </span>
                      <b>{group}</b>
                      <small>
                        {modelsCount} {modelsCount === 1 ? 'model' : 'models'} · {variantsCount}{' '}
                        {variantsCount === 1 ? 'variant' : 'variants'}
                        <br />
                        <span style={{ color: inStock <= 5 ? 'var(--accent)' : 'var(--muted)', fontWeight: 500 }}>
                          {inStock} units in stock
                        </span>
                      </small>
                      <span className="tile-link">
                        Browse collection <ArrowRight size={12} style={{ marginLeft: 3, verticalAlign: 'middle' }} />
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="empty" style={{ padding: '32px 10px' }}>
                <strong>Catalogue is empty</strong>
                <p style={{ margin: '4px 0' }}>Add products in Stock maintenance to begin billing.</p>
              </div>
            )}
          </section>

          {/* Past Sales Panel */}
          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title">
              <div>
                <span className="eyebrow">PAST SALES</span>
                <h3>Recent bills</h3>
              </div>
              <span className="muted" style={{ fontSize: 12 }}>
                {recentSales.length} {recentSales.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>

            {recentSales.length > 0 ? (
              <div>
                {recentSales.slice(0, 6).map((s) => {
                  const billNum = s.bill_number || s.bill || 'AJ-000000'
                  const itemsCount = s.items?.length || 0
                  const timeStr = s.created_at || s.at
                    ? new Date(s.created_at || s.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Today'

                  return (
                    <div key={s.id || billNum} className="recent-row">
                      <div className="avatar" style={{ fontSize: 13, fontWeight: 700 }}>
                        <Receipt size={17} color="var(--accent)" />
                      </div>
                      <div>
                        <b>{billNum}</b>
                        <small>
                          {timeStr} · {itemsCount} {itemsCount === 1 ? 'line item' : 'line items'} ·{' '}
                          {s.payment_method || s.payment || 'Cash'}
                          {s.customer_name ? ` · ${s.customer_name}` : ''}
                        </small>
                      </div>
                      <strong style={{ fontSize: 13, marginRight: 8 }}>{formatINR(s.total)}</strong>
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() => setReceiptSale(s)}
                        title="Print / Save PDF receipt"
                      >
                        <Printer size={13} style={{ marginRight: 4 }} /> Print
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty" style={{ padding: '24px 0' }}>
                <i><Sparkles size={22} strokeWidth={1.6} /></i>
                <strong>No bills yet</strong>
                <span>Confirmed sales will show here.</span>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Checkout Counter Desk */}
        <aside className="bill-panel">
          <span className="eyebrow">02 · REVIEW BILL</span>

          {/* Customer Details */}
          <div className="form-grid" style={{ margin: '12px 0 6px' }}>
            <div>
              <label htmlFor="b-cname" style={{ margin: '6px 0 4px', fontSize: 11 }}>
                Customer name (optional)
              </label>
              <input
                id="b-cname"
                maxLength={80}
                placeholder="Walk-in customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="b-cmobile" style={{ margin: '6px 0 4px', fontSize: 11 }}>
                Mobile number (optional)
              </label>
              <input
                id="b-cmobile"
                type="tel"
                maxLength={20}
                placeholder="e.g. 9876543210"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </div>
          </div>

          <h3>
            Current bill <span>{totalCartUnits} {totalCartUnits === 1 ? 'item' : 'items'}</span>
          </h3>

          {/* Cart Line Items */}
          {cartEntries.length > 0 ? (
            <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
              {cartEntries.map(({ product: p, qty }) => {
                const lineTotal = Number(p.price) * qty
                const canAddMore = qty < p.stock

                return (
                  <div key={p.id} className="cart-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b>{p.name}</b>
                      <small>
                        {p.colour && `${p.colour} · `}
                        {p.size && (
                          <span className="size-badge" style={{ padding: '1px 5px', fontSize: 10, marginRight: 4 }}>
                            {p.size.toLowerCase().startsWith('size') ? p.size : `Size ${p.size}`}
                          </span>
                        )}
                        · {formatINR(p.price)}
                      </small>
                      <div className="stepper">
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, -1)}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(p.id, 1)}
                          disabled={!canAddMore}
                          title={canAddMore ? 'Increase quantity' : `Stock limit reached (${p.stock} units)`}
                        >
                          +
                        </button>
                        <span className="muted" style={{ fontSize: 10, marginLeft: 6 }}>
                          ({p.stock - qty} left)
                        </span>
                      </div>
                    </div>
                    <strong style={{ fontSize: 13 }}>{formatINR(lineTotal)}</strong>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty" style={{ padding: '24px 0', borderTop: '1px solid var(--line)' }}>
              <i><ShoppingBag size={24} strokeWidth={1.5} color="var(--accent)" /></i>
              <strong>Your bill is empty</strong>
              <span>Select products from the catalogue to begin.</span>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="total-row" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <span>Bill amount (Subtotal)</span>
            <strong>{formatINR(subtotal)}</strong>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px' }}>
              <label htmlFor="b-discount" style={{ margin: 0, fontSize: 11 }}>
                Discount (%)
              </label>
              {discountPercentVal > 0 && (
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  −{formatINR(discountAmount)} ({discountPercentVal}%)
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="b-discount"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                style={{ paddingRight: 32 }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  fontSize: 13,
                  pointerEvents: 'none',
                }}
              >
                %
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
              {[5, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className="btn tiny"
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    background: discountPercent === String(pct) ? 'var(--light)' : 'transparent',
                    borderColor: discountPercent === String(pct) ? 'var(--accent)' : 'var(--line)',
                    color: discountPercent === String(pct) ? 'var(--accent)' : 'var(--muted)',
                  }}
                  onClick={() => setDiscountPercent(discountPercent === String(pct) ? '' : String(pct))}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="total-row">
            <span>Final bill after discount</span>
            <strong style={{ color: 'var(--ink)' }}>{formatINR(afterDiscount)}</strong>
          </div>

          {/* Round-off Option */}
          <label style={{ margin: '10px 0 4px', fontSize: 11 }}>Need to round off?</label>
          <div className="payment-options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button
              type="button"
              className={roundOff ? 'selected' : ''}
              onClick={() => setRoundOff(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={!roundOff ? 'selected' : ''}
              onClick={() => {
                setRoundOff(false)
                setManualAmount('')
              }}
            >
              No
            </button>
          </div>

          {roundOff && (
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="b-manual" style={{ margin: '4px 0', fontSize: 11 }}>
                Enter final amount manually (₹)
              </label>
              <input
                id="b-manual"
                type="number"
                min="0"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder={String(Math.round(afterDiscount))}
              />
              <p className="bill-help">This amount becomes the final bill. No automatic rounding is applied.</p>
            </div>
          )}

          {/* Payment Method Pills */}
          <label style={{ margin: '10px 0 4px', fontSize: 11 }}>
            Mode of payment <span className="muted">· record only</span>
          </label>
          <div className="payment-options">
            {['Cash', 'UPI', 'Card', 'Other'].map((method) => (
              <button
                key={method}
                type="button"
                className={paymentMethod === method ? 'selected' : ''}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Final Total */}
          <div className="total-row big">
            <span>Final bill</span>
            <strong>{formatINR(finalTotal)}</strong>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            className="btn primary full"
            disabled={cartEntries.length === 0 || confirming}
            onClick={handleConfirmSale}
            style={{ marginTop: 10, padding: 14, fontSize: 14 }}
          >
            {confirming ? 'Confirming sale…' : 'Confirm sale →'}
          </button>

          <p className="bill-help">
            Confirm after customer’s payment is complete. Stock is reduced and a bill is registered with print/PDF support.
          </p>
        </aside>
      </div>

      {/* Variant Picker Modal */}
      {pickerCategory && (
        <VariantPickerModal
          category={pickerCategory}
          products={products.filter((p) => getProductCategory(p) === pickerCategory)}
          cart={cart}
          onAddToCart={addToCart}
          subtotal={subtotal}
          onClose={() => setPickerCategory(null)}
        />
      )}

      {/* Thermal Slip Receipt Modal */}
      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          onClose={() => setReceiptSale(null)}
        />
      )}
    </div>
  )
}
