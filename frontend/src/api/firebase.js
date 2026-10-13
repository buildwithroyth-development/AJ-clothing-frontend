import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  runTransaction,
} from 'firebase/database'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'

// Firebase Web Configuration
// Can be customized via Vite environment variables or defaults to project AJ-Clothing.
// (These web config values are public identifiers, not secrets. Access is
// controlled by database.rules.json and Firebase Authentication.)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBtxKPU9eunb5rLaEH-anSPzpZZysWqBKI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aj-clothing-e8477.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://aj-clothing-e8477-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aj-clothing-e8477',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aj-clothing-e8477.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '220735033224',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:220735033224:web:068d0c9199bf1dbe64743d',
}

// Initialize App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

// ---------------------------------------------------------------------------
// Authentication (staff email + password)
// ---------------------------------------------------------------------------
export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email.trim(), password)
export const signOut = () => fbSignOut(auth)
export const onUserChange = (cb) => onAuthStateChanged(auth, cb)

const requireAuth = () => {
  if (!auth.currentUser) throw new Error('Please sign in to continue.')
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toList = (val) => {
  if (!val) return []
  return (Array.isArray(val) ? val : Object.values(val)).filter(Boolean)
}
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
const nowIso = () => new Date().toISOString()
const cleanPath = (path) => path.replace(/^\/api\/v1/, '').replace(/^\/|\/$/g, '')

// Add a category by name if it does not exist yet (case-insensitive).
const ensureCategory = async (name) => {
  const clean = (name || '').trim()
  if (!clean) return
  const snap = await get(ref(db, 'categories'))
  const exists = toList(snap.val()).some(
    (c) => (c.name || '').trim().toLowerCase() === clean.toLowerCase()
  )
  if (!exists) {
    const id = Date.now()
    await set(ref(db, `categories/${id}`), { id, name: clean })
  }
}

// Apply a stock change to one product inside a transaction.
// Returns { ok, reason, product } — never lets stock go below zero.
const adjustStock = async (productId, delta) => {
  let reason = null
  const result = await runTransaction(ref(db, `products/${productId}`), (cur) => {
    reason = null
    if (cur === null) {
      // First run may see an empty local cache; commit nothing and re-check below.
      reason = 'missing'
      return cur
    }
    const next = (Number(cur.stock) || 0) + delta
    if (next < 0) {
      reason = 'insufficient'
      return undefined // abort
    }
    return { ...cur, stock: next, updated_at: nowIso() }
  })
  const product = result.snapshot.val()
  if (!result.committed && reason === 'insufficient') return { ok: false, reason, product }
  if (product === null) return { ok: false, reason: 'missing', product: null }
  return { ok: result.committed, reason: result.committed ? null : 'aborted', product }
}

const logMovement = (productId, productName, change, reason, extra = {}) => {
  const moveId = push(ref(db, `stock_movements/${productId}`)).key
  return {
    path: `stock_movements/${productId}/${moveId}`,
    value: {
      id: moveId,
      product: Number.isNaN(Number(productId)) ? productId : Number(productId),
      product_name: productName,
      change,
      reason,
      created_at: nowIso(),
      ...extra,
    },
  }
}

export const firebaseApi = {
  get: async (path) => {
    requireAuth()
    const clean = cleanPath(path)

    // GET /products/
    if (clean === 'products') {
      const snap = await get(ref(db, 'products'))
      return toList(snap.val())
    }

    // GET /categories/
    if (clean === 'categories') {
      const snap = await get(ref(db, 'categories'))
      const list = toList(snap.val())
      if (list.length > 0) return list
      // Fall back to the category names used by products
      const prods = toList((await get(ref(db, 'products'))).val())
      const names = [...new Set(prods.map((p) => p.category_name || p.category).filter(Boolean))]
      return names.map((name, idx) => ({ id: idx + 1, name }))
    }

    // GET /sales or /bills
    if (clean === 'sales' || clean === 'bills') {
      const snap = await get(ref(db, 'sales'))
      return toList(snap.val()).sort(
        (a, b) => new Date(b.created_at || b.at || 0) - new Date(a.created_at || a.at || 0)
      )
    }

    // GET /stock_movements or /movements
    if (clean === 'stock_movements' || clean === 'movements') {
      const [moveSnap, prodSnap] = await Promise.all([
        get(ref(db, 'stock_movements')),
        get(ref(db, 'products')),
      ])
      if (!moveSnap.exists()) return []
      const val = moveSnap.val() || {}
      const prodMap = prodSnap.exists() ? prodSnap.val() || {} : {}
      const list = []
      Object.entries(val).forEach(([prodId, moves]) => {
        if (moves && typeof moves === 'object') {
          Object.values(moves).forEach((m) => {
            if (m && m.change !== undefined) {
              const matchedProd = prodMap[m.product || prodId]
              list.push({
                ...m,
                productName: m.product_name || matchedProd?.name || 'Product',
                time: m.created_at
                  ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Today',
              })
            }
          })
        }
      })
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
    }

    // GET /products/:id/history/
    const historyMatch = clean.match(/^products\/([^/]+)\/history$/)
    if (historyMatch) {
      const snap = await get(ref(db, `stock_movements/${historyMatch[1]}`))
      return toList(snap.val()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    // GET /products/:id/
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      const snap = await get(ref(db, `products/${prodMatch[1]}`))
      return snap.exists() ? snap.val() : null
    }

    // Default fallback
    const snap = await get(ref(db, clean))
    return snap.exists() ? snap.val() : null
  },

  post: async (path, body = {}) => {
    requireAuth()
    const clean = cleanPath(path)

    // POST /products/
    if (clean === 'products') {
      const allProducts = toList((await get(ref(db, 'products'))).val())

      const name = (body.name || '').trim().toLowerCase()
      const colour = (body.colour || '').trim().toLowerCase()
      const size = (body.size || '').trim().toLowerCase()

      const duplicate = allProducts.find(
        (p) =>
          (p.name || '').trim().toLowerCase() === name &&
          (p.colour || '').trim().toLowerCase() === colour &&
          (p.size || '').trim().toLowerCase() === size
      )
      if (duplicate) {
        throw new Error(
          `Product "${body.name}" with colour "${body.colour}" and size "${body.size}" already exists (Current stock: ${duplicate.stock} units). Update existing stock instead.`
        )
      }

      const id = Date.now()
      const now = nowIso()
      const newProduct = {
        id,
        name: (body.name || '').trim(),
        category: body.category || '',
        category_name: body.category || '',
        colour: (body.colour || '').trim(),
        size: (body.size || '').trim(),
        price: Math.max(0, Number(body.price) || 0),
        stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
        description: body.description || '',
        is_active: body.is_active !== false,
        created_at: now,
        updated_at: now,
      }

      const writes = { [`products/${id}`]: newProduct }
      if (newProduct.stock > 0) {
        const m = logMovement(id, newProduct.name, newProduct.stock, 'Initial stock')
        writes[m.path] = m.value
      }
      await update(ref(db), writes)
      await ensureCategory(newProduct.category)
      return newProduct
    }

    // POST /products/:id/restock/
    const restockMatch = clean.match(/^products\/([^/]+)\/restock$/)
    if (restockMatch) {
      const prodId = restockMatch[1]
      const amount = Math.floor(Number(body.amount) || 0)
      if (amount <= 0) throw new Error('Amount must be greater than 0.')

      const res = await adjustStock(prodId, amount)
      if (!res.ok) throw new Error('Product not found')

      const m = logMovement(prodId, res.product.name, amount, body.reason || 'Stock added (Restock)')
      await set(ref(db, m.path), m.value)
      return res.product
    }

    // POST /sales or /bills — atomic checkout
    if (clean === 'sales' || clean === 'bills') {
      return createSale(body)
    }

    throw new Error(`Unsupported request: POST /${clean}`)
  },

  patch: async (path, body = {}) => {
    requireAuth()
    const clean = cleanPath(path)

    // PATCH /products/:id/
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      const prodId = prodMatch[1]
      const allProducts = toList((await get(ref(db, 'products'))).val())
      const current = allProducts.find((p) => String(p.id) === String(prodId))
      if (!current) throw new Error('Product not found')

      const pick = (field) => (body[field] !== undefined ? body[field] : current[field] || '')
      const name = String(pick('name')).trim().toLowerCase()
      const colour = String(pick('colour')).trim().toLowerCase()
      const size = String(pick('size')).trim().toLowerCase()

      const duplicate = allProducts.find(
        (p) =>
          String(p.id) !== String(prodId) &&
          (p.name || '').trim().toLowerCase() === name &&
          (p.colour || '').trim().toLowerCase() === colour &&
          (p.size || '').trim().toLowerCase() === size
      )
      if (duplicate) {
        throw new Error(
          `Another product with name "${body.name || current.name}", colour "${body.colour || current.colour}", and size "${body.size || current.size}" already exists.`
        )
      }

      const changes = { ...body }
      delete changes.id
      delete changes.stock_history
      if (changes.stock !== undefined) {
        changes.stock = Math.max(0, Math.floor(Number(changes.stock) || 0))
      }
      if (changes.price !== undefined) changes.price = Math.max(0, Number(changes.price) || 0)

      let oldStock = null
      const result = await runTransaction(ref(db, `products/${prodId}`), (cur) => {
        if (cur === null) return cur
        oldStock = Number(cur.stock) || 0
        return {
          ...cur,
          ...changes,
          category_name: changes.category || cur.category_name || cur.category || '',
          updated_at: nowIso(),
        }
      })
      const updated = result.snapshot.val()
      if (!updated) throw new Error('Product not found')

      if (changes.stock !== undefined && oldStock !== null && changes.stock !== oldStock) {
        const delta = changes.stock - oldStock
        const m = logMovement(
          prodId,
          updated.name,
          delta,
          delta < 0 ? 'Stock adjusted' : 'Stock added'
        )
        await set(ref(db, m.path), m.value)
      }
      if (changes.category) await ensureCategory(changes.category)
      return updated
    }

    throw new Error(`Unsupported request: PATCH /${clean}`)
  },

  delete: async (path) => {
    requireAuth()
    const clean = cleanPath(path)

    // DELETE /products/:id/ (past sales keep their own copy of the product details)
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      await remove(ref(db, `products/${prodMatch[1]}`))
      return { success: true }
    }

    throw new Error(`Unsupported request: DELETE /${clean}`)
  },
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
// Steps:
//   1. Merge duplicate cart lines.
//   2. Deduct stock per product inside a transaction (never below zero).
//      If any line fails, every deduction already made is restored.
//   3. Take the next bill number from counters/bills inside a transaction.
//   4. Recompute prices and totals from the live product records.
//   5. Write the sale and its stock movements in ONE multi-path update.
//      If that fails, stock is restored.
async function createSale(body) {
  const rawItems = body.items || []
  if (rawItems.length === 0) throw new Error('Cannot confirm sale with an empty cart.')

  // 1. Merge duplicate lines
  const wanted = new Map()
  for (const it of rawItems) {
    const id = it.id ?? it.product ?? (it.p && it.p.id)
    const qty = Math.floor(Number(it.qty ?? it.quantity ?? 1))
    if (id === undefined || id === null || id === '') {
      throw new Error('Every item in the bill must be a product from the stock list.')
    }
    if (!Number.isFinite(qty) || qty <= 0) continue
    wanted.set(String(id), (wanted.get(String(id)) || 0) + qty)
  }
  if (wanted.size === 0) throw new Error('Cannot confirm sale with an empty cart.')

  // 2. Deduct stock
  const deducted = [] // { id, qty, product }
  const restore = async () => {
    await Promise.allSettled(deducted.map((d) => adjustStock(d.id, d.qty)))
  }

  try {
    for (const [id, qty] of wanted) {
      const res = await adjustStock(id, -qty)
      if (!res.ok) {
        if (res.reason === 'insufficient') {
          const p = res.product
          throw new Error(
            `Only ${p.stock} units available for ${p.name} (${p.colour} · Size ${p.size}).`
          )
        }
        throw new Error('A product in this bill no longer exists. Refresh and try again.')
      }
      deducted.push({ id, qty, product: res.product })
    }

    // 3. Next bill number
    const counterRef = ref(db, 'counters/bills')
    let seed = 0
    const counterSnap = await get(counterRef)
    if (!counterSnap.exists()) {
      // First bill after migration: continue after any bills that already exist
      const salesSnap = await get(ref(db, 'sales'))
      seed = salesSnap.exists() ? Object.keys(salesSnap.val() || {}).length : 0
    }
    const counter = await runTransaction(counterRef, (cur) =>
      (typeof cur === 'number' ? cur : seed) + 1
    )
    const billNumber = `AJ-${String(counter.snapshot.val()).padStart(6, '0')}`

    // 4. Recompute everything from live product data
    const items = deducted.map((d) => {
      const price = round2(d.product.price)
      return {
        product: Number.isNaN(Number(d.id)) ? d.id : Number(d.id),
        name: d.product.name,
        colour: d.product.colour || '',
        size: d.product.size || '',
        price,
        qty: d.qty,
        line_total: round2(price * d.qty),
      }
    })
    const subtotal = round2(items.reduce((s, i) => s + i.line_total, 0))
    const discountPercent = Math.min(
      100,
      Math.max(0, Number(body.discount_percent ?? body.discountPercent ?? 0) || 0)
    )
    const discount = round2((subtotal * discountPercent) / 100)
    const afterDiscount = round2(Math.max(0, subtotal - discount))

    const roundOff = Boolean(body.round_off ?? body.roundOff)
    const requestedTotal = Number(body.total)
    let total = afterDiscount
    if (roundOff && Number.isFinite(requestedTotal) && requestedTotal >= 0) {
      total = round2(requestedTotal)
    }
    const roundingAdjustment = round2(total - afterDiscount)

    const now = nowIso()
    const saleId = push(ref(db, 'sales')).key
    const payment = body.payment_method || body.payment || 'Cash'
    const sale = {
      id: saleId,
      bill_number: billNumber,
      bill: billNumber,
      customer_name: String(body.customer_name || body.customerName || '').trim(),
      customer_mobile: String(body.customer_mobile || body.customerMobile || '').trim(),
      items,
      subtotal,
      discount_percent: discountPercent,
      discount,
      after_discount: afterDiscount,
      round_off: roundOff,
      rounding_adjustment: roundingAdjustment,
      total,
      payment_method: payment,
      payment,
      created_by: auth.currentUser?.email || auth.currentUser?.uid || '',
      created_at: now,
      at: now,
    }

    // 5. Sale + movements in one atomic write
    const writes = { [`sales/${saleId}`]: sale }
    for (const d of deducted) {
      const m = logMovement(d.id, d.product.name, -d.qty, `Sold (${billNumber})`, {
        bill: billNumber,
      })
      writes[m.path] = m.value
    }
    await update(ref(db), writes)
    return sale
  } catch (err) {
    await restore()
    throw err
  }
}

export default firebaseApi
