import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  ShoppingBag,
  Boxes,
  Layers,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Loader2,
} from 'lucide-react'
import logoImg from '../assets/AJ_logo.png'
import { formatINR, stockPill } from '../utils/format'
import api from '../api/client'

export default function DashboardPage({
  metrics: initialMetrics,
  lowStockItems: initialLowStock,
  movements: initialMovements,
  setActivePage,
}) {
  const [products, setProducts]   = useState([])
  const [movements, setMovements] = useState(initialMovements || [])
  const [loading, setLoading]     = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, moves] = await Promise.all([
        api.get('/products/').catch(() => []),
        api.get('/stock_movements').catch(() => []),
      ])

      const prodList = Array.isArray(prods) ? prods : (prods?.results || [])
      setProducts(prodList)

      if (Array.isArray(moves) && moves.length > 0) {
        setMovements(moves)
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Derive metrics and low stock list from live products
  const lowStockItems = products.length > 0
    ? products.filter((p) => Number(p.stock) <= 5)
    : (initialLowStock || [])

  const totalStock = products.length > 0
    ? products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)
    : (initialMetrics?.totalStock || 0)

  const totalProducts = products.length > 0
    ? products.length
    : (initialMetrics?.totalProducts || 0)

  const todaySales = initialMetrics?.todaySales || 0
  const soldToday  = initialMetrics?.soldToday || 0

  return (
    <div>
      <div className="head">
        <div>
          <span className="eyebrow">STORE OVERVIEW</span>
          <h1>Good day at the store.</h1>
          <p>A quick view of what is happening today.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setActivePage('billing')}>
          <Plus size={16} strokeWidth={2.4} style={{ marginRight: 6 }} /> Create a bill
        </button>
      </div>

      <section className="hero">
        <div>
          <span className="eyebrow" style={{ color: '#f0cbaf' }}>TODAY AT A GLANCE</span>
          <h2>Every piece counts.<br /><em>Every sale matters.</em></h2>
          <p>Keep a clear view of stock and sales as the day moves forward.</p>
          <button type="button" className="btn" onClick={() => setActivePage('stock')}>
            Explore stock <ArrowUpRight size={16} style={{ marginLeft: 6 }} />
          </button>
        </div>
        <div className="orb">
          <img src={logoImg} alt="AJ Clothing Logo" className="hero-orb-img" />
        </div>
      </section>

      {/* Metrics Cards */}
      <div className="stats">
        {[
          { icon: TrendingUp,  label: "Today's sales",        value: formatINR(todaySales) },
          { icon: ShoppingBag, label: "Products sold today",   value: soldToday },
          { icon: Boxes,       label: "Total available stock", value: loading && totalStock === 0 ? '…' : totalStock },
          { icon: Layers,      label: "Total products",        value: loading && totalProducts === 0 ? '…' : totalProducts },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat">
            <i className="stat-icon"><Icon size={18} strokeWidth={2} /></i>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="columns">
        {/* Low Stock Panel */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">NEEDS ATTENTION</span>
              <h3>
                Low stock{' '}
                {lowStockItems.length > 0 && (
                  <span className="muted" style={{ font: '12px DM Sans, sans-serif' }}>
                    ({lowStockItems.length})
                  </span>
                )}
              </h3>
            </div>
            <button type="button" className="btn tiny" onClick={() => setActivePage('stock')}>
              View stock <ArrowUpRight size={13} style={{ marginLeft: 3 }} />
            </button>
          </div>

          {loading && products.length === 0 ? (
            <div className="empty" style={{ padding: '24px 0' }}>
              <Loader2 className="spin" size={20} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
              <small className="muted">Checking stock levels…</small>
            </div>
          ) : lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div
                key={item.id}
                className="row"
                style={{ cursor: 'pointer' }}
                onClick={() => setActivePage('stock')}
                title="Click to view in stock maintenance"
              >
                <div className="avatar">{(item.name?.[0] || 'P').toUpperCase()}</div>
                <div className="grow">
                  <b>{item.name}</b>
                  <small style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    {item.colour && <span>{item.colour}</span>}
                    {item.colour && item.size && <span>·</span>}
                    {item.size && (
                      <span className="size-badge" style={{ fontSize: 10, padding: '1px 6px' }}>
                        {item.size.toLowerCase().startsWith('size') ? item.size : `Size ${item.size}`}
                      </span>
                    )}
                  </small>
                </div>
                {stockPill(item.stock)}
              </div>
            ))
          ) : (
            <div className="empty">
              <i><Sparkles size={22} strokeWidth={1.6} /></i>
              <strong>All stocked up</strong>
              <span>No variants have 5 or fewer units.</span>
            </div>
          )}
        </section>

        {/* Latest Movements Panel */}
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">LATEST MOVEMENTS</span>
              <h3>Today&apos;s activity</h3>
            </div>
          </div>

          {movements.length > 0 ? (
            movements.map((m) => (
              <div key={m.id} className="row">
                <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.change > 0 ? (
                    <ArrowDownLeft size={16} strokeWidth={2.2} style={{ color: 'var(--green)' }} />
                  ) : (
                    <ArrowUpRight size={16} strokeWidth={2.2} style={{ color: 'var(--accent)' }} />
                  )}
                </div>
                <div className="grow">
                  <b>{m.productName || m.product_name || 'Product'}</b>
                  <small>{m.reason || 'Stock adjustment'} · {m.time || 'Today'}</small>
                </div>
                <b style={{ color: m.change > 0 ? 'var(--green)' : 'var(--accent)' }}>
                  {m.change > 0 ? `+${m.change}` : m.change}
                </b>
              </div>
            ))
          ) : (
            <div className="empty">
              <i><Sparkles size={22} strokeWidth={1.6} /></i>
              <strong>A fresh start</strong>
              <span>Stock changes made today will appear here.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
