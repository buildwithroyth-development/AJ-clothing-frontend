import { useState } from 'react'
import './App.css'

const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function App({
  metrics = {
    todaySales: 0,
    soldToday: 0,
    totalStock: 0,
    totalProducts: 0,
  },
  lowStockItems = [],
  movements = [],
}) {
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', icon: '◫', label: 'Dashboard' },
    { id: 'stock', icon: '▤', label: 'Stock maintenance' },
    { id: 'billing', icon: '◈', label: 'Billing' },
    { id: 'bills', icon: '▧', label: 'All bills' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ]

  return (
    <div className="layout">
      {/* Mobile backdrop drawer overlay */}
      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'active' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Global Sidebar Shell */}
      <aside className={`side ${mobileNavOpen ? 'open' : ''}`} id="side">
        <div className="brand">
          <div className="mark">AJ</div>
          <div>
            <b>AJ Clothing</b>
            <small>STORE DESK</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activePage === item.id ? 'active' : ''}
              onClick={() => {
                setActivePage(item.id)
                setMobileNavOpen(false)
              }}
            >
              <i>{item.icon}</i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="side-note">
          <strong>A little more in order.</strong>
          <p>Manage stock, create bills and keep your daily view clear.</p>
        </div>

        <div className="side-foot">
          AJ CLOTHING · STORE DESK
          <br />
          MAIN BRANCH
        </div>
      </aside>

      {/* Main App Shell */}
      <div className="shell">
        <header className="top">
          <button
            type="button"
            className="mobile-toggle"
            id="mobile-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <div className="crumb">
            AJ CLOTHING <span>/</span> {activePage.toUpperCase()}
          </div>
          <div className="top-right">
            <b>●</b> Store workspace
          </div>
        </header>

        <main className="page">
          {/* Page Heading */}
          <div className="head">
            <div>
              <span className="eyebrow">STORE OVERVIEW</span>
              <h1>Good day at the store.</h1>
              <p>A quick view of what is happening today.</p>
            </div>
            <button
              type="button"
              className="btn primary"
              onClick={() => setActivePage('billing')}
            >
              + Create a bill
            </button>
          </div>

          {/* Hero Banner */}
          <section className="hero">
            <div>
              <span className="eyebrow" style={{ color: '#f0cbaf' }}>
                TODAY AT A GLANCE
              </span>
              <h2>
                Every piece counts.
                <br />
                <em>Every sale matters.</em>
              </h2>
              <p>Keep a clear view of stock and sales as the day moves forward.</p>
              <button
                type="button"
                className="btn"
                onClick={() => setActivePage('stock')}
              >
                Explore stock ↗
              </button>
            </div>
            <div className="orb">AJ</div>
          </section>

          {/* Dynamic Stats Grid */}
          <div className="stats">
            <div className="stat">
              <i>◈</i>
              <small>Today&apos;s sales</small>
              <strong>{formatINR(metrics.todaySales)}</strong>
            </div>
            <div className="stat">
              <i>↗</i>
              <small>Products sold today</small>
              <strong>{metrics.soldToday}</strong>
            </div>
            <div className="stat">
              <i>▤</i>
              <small>Total available stock</small>
              <strong>{metrics.totalStock}</strong>
            </div>
            <div className="stat">
              <i>◫</i>
              <small>Total products</small>
              <strong>{metrics.totalProducts}</strong>
            </div>
          </div>

          {/* Two-Column Dashboard Panels */}
          <div className="columns">
            {/* Needs Attention / Low Stock Panel */}
            <section className="panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">NEEDS ATTENTION</span>
                  <h3>Low stock</h3>
                </div>
                <button
                  type="button"
                  className="btn tiny"
                  onClick={() => setActivePage('stock')}
                >
                  View stock ↗
                </button>
              </div>

              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="row">
                    <div className="avatar">{item.name?.[0] || 'P'}</div>
                    <div className="grow">
                      <b>{item.name}</b>
                      <small>
                        {item.colour} · {item.size}
                      </small>
                    </div>
                    <span className="pill low">{item.stock} units</span>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <i>✧</i>
                  <strong>All stocked up</strong>
                  No variants have 5 or fewer units.
                </div>
              )}
            </section>

            {/* Latest Movements / Today's Activity Panel */}
            <section className="panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">LATEST MOVEMENTS</span>
                  <h3>Today’s activity</h3>
                </div>
              </div>

              {movements.length > 0 ? (
                movements.map((m) => (
                  <div key={m.id} className="row">
                    <div className="avatar">{m.change > 0 ? '↙' : '↗'}</div>
                    <div className="grow">
                      <b>{m.productName || 'Product'}</b>
                      <small>
                        {m.reason} · {m.time || 'Today'}
                      </small>
                    </div>
                    <b style={{ color: m.change > 0 ? 'var(--green)' : 'var(--accent)' }}>
                      {m.change > 0 ? `+${m.change}` : m.change}
                    </b>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <i>✧</i>
                  <strong>A fresh start</strong>
                  Stock changes made today will appear here.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
