import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import { getAuth, signInAnonymously } from 'firebase/auth'

// Firebase Web Configuration
// Can be customized via Vite environment variables or defaults to project AJ-Clothing
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

// Initial sample catalogue for instant seeding if RTDB is empty
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Everyday Tee', category_name: 'Tops', colour: 'Ivory', size: 'M', price: 799, stock: 15 },
  { id: 2, name: 'Everyday Tee', category_name: 'Tops', colour: 'Cocoa', size: 'L', price: 799, stock: 9 },
  { id: 3, name: 'Relaxed Denim', category_name: 'Bottoms', colour: 'Indigo', size: '32', price: 1499, stock: 8 },
  { id: 4, name: 'Linen Shirt', category_name: 'Shirts', colour: 'White', size: 'M', price: 1199, stock: 4 },
  { id: 5, name: 'Classic Kurta', category_name: 'Ethnic', colour: 'Maroon', size: 'L', price: 1299, stock: 7 },
  { id: 6, name: 'Festive Saree', category_name: 'Ethnic', colour: 'Gold', size: 'Free', price: 2499, stock: 13 },
  { id: 7, name: 'Oxford Shirt', category_name: 'Shirts', colour: 'Sky Blue', size: 'L', price: 1399, stock: 12 },
  { id: 8, name: 'Checked Shirt', category_name: 'Shirts', colour: 'Red', size: 'XL', price: 999, stock: 10 },
  { id: 9, name: 'Denim Shirt', category_name: 'Shirts', colour: 'Indigo', size: 'M', price: 1599, stock: 8 },
  { id: 10, name: 'Formal Shirt', category_name: 'Shirts', colour: 'Black', size: 'S', price: 1299, stock: 16 },
  { id: 11, name: 'Slim Fit Chino Pant', category_name: 'Bottoms', colour: 'Beige', size: '30', price: 1399, stock: 14 },
  { id: 12, name: 'Formal Trouser', category_name: 'Bottoms', colour: 'Charcoal', size: '34', price: 1699, stock: 10 },
  { id: 13, name: 'Cargo Pant', category_name: 'Bottoms', colour: 'Olive', size: '32', price: 1799, stock: 9 },
  { id: 14, name: 'Cotton Jogger Pant', category_name: 'Bottoms', colour: 'Black', size: '36', price: 1099, stock: 18 },
  { id: 15, name: 'Cotton Kurta', category_name: 'Ethnic', colour: 'Cream', size: 'M', price: 999, stock: 15 },
  { id: 16, name: 'Printed Kurta', category_name: 'Ethnic', colour: 'Blue', size: 'XL', price: 1499, stock: 11 },
  { id: 17, name: 'Festive Silk Kurta', category_name: 'Ethnic', colour: 'Mustard', size: 'L', price: 2299, stock: 6 },
  { id: 18, name: 'Short Kurta', category_name: 'Ethnic', colour: 'Green', size: 'S', price: 1199, stock: 13 },
  { id: 19, name: 'Cotton Saree', category_name: 'Ethnic', colour: 'Pink', size: 'Free', price: 1299, stock: 12 },
  { id: 20, name: 'Silk Saree', category_name: 'Ethnic', colour: 'Royal Blue', size: 'Free', price: 3499, stock: 7 },
  { id: 21, name: 'Printed Saree', category_name: 'Ethnic', colour: 'Green', size: 'Free', price: 1599, stock: 16 },
  { id: 22, name: 'Chiffon Saree', category_name: 'Ethnic', colour: 'Peach', size: 'Free', price: 1999, stock: 10 },
  { id: 23, name: 'Polo T-shirt', category_name: 'Tops', colour: 'Navy', size: 'L', price: 899, stock: 20 },
  { id: 24, name: 'Graphic Tee', category_name: 'Tops', colour: 'White', size: 'M', price: 699, stock: 18 },
  { id: 25, name: 'Oversized Tee', category_name: 'Tops', colour: 'Black', size: 'XL', price: 999, stock: 12 },
  { id: 26, name: 'Striped Tee', category_name: 'Tops', colour: 'Grey', size: 'S', price: 749, stock: 15 },
]

// Ensure authenticated session if required by security rules
let authPromise = null
export const ensureAuth = async () => {
  if (auth.currentUser) return auth.currentUser
  if (!authPromise) {
    authPromise = signInAnonymously(auth).catch((err) => {
      console.warn('Anonymous sign-in note:', err?.message || err)
      return null
    })
  }
  return authPromise
}

// Ensure database is populated with initial catalogue if completely empty
let seedPromise = null
const ensureSeeded = async () => {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    try {
      const snap = await get(ref(db, 'products'))
      if (!snap.exists() || snap.val() === null) {
        const productMap = {}
        const categorySet = new Set()
        INITIAL_PRODUCTS.forEach((p) => {
          productMap[p.id] = {
            ...p,
            category: p.category_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          }
          if (p.category_name) categorySet.add(p.category_name)
        })

        const categoryList = Array.from(categorySet).map((name, idx) => ({
          id: idx + 1,
          name,
        }))

        await Promise.all([
          set(ref(db, 'products'), productMap),
          set(ref(db, 'categories'), categoryList),
        ])
      }
    } catch (err) {
      console.warn('Seeding check note:', err?.message || err)
    }
  })()
  return seedPromise
}

export const firebaseApi = {
  get: async (path) => {
    await ensureAuth()
    await ensureSeeded()

    const clean = path.replace(/^\/api\/v1/, '').replace(/^\/|\/$/g, '')

    // GET /products/
    if (clean === 'products') {
      const snap = await get(ref(db, 'products'))
      if (!snap.exists()) return []
      const val = snap.val()
      if (Array.isArray(val)) return val.filter(Boolean)
      return Object.values(val || {})
    }

    // GET /categories/
    if (clean === 'categories') {
      const snap = await get(ref(db, 'categories'))
      if (!snap.exists()) return []
      const val = snap.val()
      if (Array.isArray(val)) return val.filter(Boolean)
      return Object.values(val || {})
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
                time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
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
      const prodId = historyMatch[1]
      const snap = await get(ref(db, `stock_movements/${prodId}`))
      if (!snap.exists()) return []
      const val = snap.val()
      const list = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {})
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    // GET /products/:id/
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      const prodId = prodMatch[1]
      const snap = await get(ref(db, `products/${prodId}`))
      return snap.exists() ? snap.val() : null
    }

    // Default fallback
    const snap = await get(ref(db, clean))
    return snap.exists() ? snap.val() : null
  },

  post: async (path, body = {}) => {
    await ensureAuth()
    await ensureSeeded()

    const clean = path.replace(/^\/api\/v1/, '').replace(/^\/|\/$/g, '')

    // POST /products/
    if (clean === 'products') {
      const snap = await get(ref(db, 'products'))
      const allProducts = snap.exists()
        ? (Array.isArray(snap.val()) ? snap.val().filter(Boolean) : Object.values(snap.val() || {}))
        : []

      const name = (body.name || '').trim().toLowerCase()
      const colour = (body.colour || '').trim().toLowerCase()
      const size = (body.size || '').trim().toLowerCase()

      const duplicate = allProducts.find((p) =>
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
      const newProduct = {
        id,
        name: body.name || '',
        category: body.category || '',
        category_name: body.category || '',
        colour: body.colour || '',
        size: body.size || '',
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
        description: body.description || '',
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await set(ref(db, `products/${id}`), newProduct)

      // Record initial stock movement
      if (newProduct.stock > 0) {
        const moveId = Date.now()
        await set(ref(db, `stock_movements/${id}/${moveId}`), {
          id: moveId,
          product: id,
          product_name: newProduct.name,
          change: newProduct.stock,
          reason: 'Initial stock',
          created_at: new Date().toISOString(),
        })
      }

      return newProduct
    }

    // POST /products/:id/restock/
    const restockMatch = clean.match(/^products\/([^/]+)\/restock$/)
    if (restockMatch) {
      const prodId = restockMatch[1]
      const amount = Number(body.amount) || 0
      const prodSnap = await get(ref(db, `products/${prodId}`))
      if (!prodSnap.exists()) throw new Error('Product not found')

      const current = prodSnap.val()
      const newStock = (current.stock || 0) + amount
      const updated = {
        ...current,
        stock: newStock,
        updated_at: new Date().toISOString(),
      }

      await set(ref(db, `products/${prodId}`), updated)

      // Add movement history
      const moveId = Date.now()
      await set(ref(db, `stock_movements/${prodId}/${moveId}`), {
        id: moveId,
        product: Number(prodId),
        product_name: current.name,
        change: amount,
        reason: 'Stock added (Restock)',
        created_at: new Date().toISOString(),
      })

      return updated
    }

    // Default POST fallback
    const id = Date.now()
    await set(ref(db, `${clean}/${id}`), { id, ...body })
    return { id, ...body }
  },

  patch: async (path, body = {}) => {
    await ensureAuth()
    const clean = path.replace(/^\/api\/v1/, '').replace(/^\/|\/$/g, '')

    // PATCH /products/:id/
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      const prodId = prodMatch[1]
      const snap = await get(ref(db, 'products'))
      const allProducts = snap.exists()
        ? (Array.isArray(snap.val()) ? snap.val().filter(Boolean) : Object.values(snap.val() || {}))
        : []

      const prodSnap = await get(ref(db, `products/${prodId}`))
      const current = prodSnap.exists() ? prodSnap.val() : {}

      const name = (body.name !== undefined ? body.name : current.name || '').trim().toLowerCase()
      const colour = (body.colour !== undefined ? body.colour : current.colour || '').trim().toLowerCase()
      const size = (body.size !== undefined ? body.size : current.size || '').trim().toLowerCase()

      const duplicate = allProducts.find((p) =>
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

      const updated = {
        ...current,
        ...body,
        category_name: body.category || current.category_name || current.category,
        updated_at: new Date().toISOString(),
      }

      await update(ref(db, `products/${prodId}`), updated)
      return updated
    }

    await update(ref(db, clean), body)
    return body
  },

  delete: async (path) => {
    await ensureAuth()
    const clean = path.replace(/^\/api\/v1/, '').replace(/^\/|\/$/g, '')

    // DELETE /products/:id/
    const prodMatch = clean.match(/^products\/([^/]+)$/)
    if (prodMatch) {
      const prodId = prodMatch[1]
      await remove(ref(db, `products/${prodId}`))
      return { success: true }
    }

    await remove(ref(db, clean))
    return { success: true }
  },
}

export default firebaseApi
