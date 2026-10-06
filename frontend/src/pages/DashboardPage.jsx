import {
  TrendingUp,
  ShoppingBag,
  Boxes,
  Layers,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react'
import { formatINR, stockPill } from '../utils/format'

export default function DashboardPage({ metrics, lowStockItems, movements, setActivePage }) {
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
        <div className="orb">AJ</div>
      </section>

      <div className="stats">
        {[
          { icon: TrendingUp,  label: "Today's sales",        value: formatINR(metrics.todaySales) },
          { icon: ShoppingBag, label: "Products sold today",   value: metrics.soldToday },
          { icon: Boxes,       label: "Total available stock", value: metrics.totalStock },
          { icon: Layers,      label: "Total products",        value: metrics.totalProducts },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat">
            <i className="stat-icon"><Icon size={18} strokeWidth={2} /></i>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="columns">
        <section className="panel">
          <div className="panel-title">
            <div><span className="eyebrow">NEEDS ATTENTION</span><h3>Low stock</h3></div>
            <button type="button" className="btn tiny" onClick={() => setActivePage('stock')}>
              View stock <ArrowUpRight size={13} style={{ marginLeft: 3 }} />
            </button>
          </div>
          {lowStockItems.length > 0 ? lowStockItems.map((item) => (
            <div key={item.id} className="row">
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
          )) : (
            <div className="empty">
              <i><Sparkles size={22} strokeWidth={1.6} /></i>
              <strong>All stocked up</strong>No variants have 5 or fewer units.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title">
            <div><span className="eyebrow">LATEST MOVEMENTS</span><h3>Today&apos;s activity</h3></div>
          </div>
          {movements.length > 0 ? movements.map((m) => (
            <div key={m.id} className="row">
              <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.change > 0 ? <ArrowDownLeft size={16} strokeWidth={2.2} /> : <ArrowUpRight size={16} strokeWidth={2.2} />}
              </div>
              <div className="grow">
                <b>{m.productName || 'Product'}</b>
                <small>{m.reason} · {m.time || 'Today'}</small>
              </div>
              <b style={{ color: m.change > 0 ? 'var(--green)' : 'var(--accent)' }}>
                {m.change > 0 ? `+${m.change}` : m.change}
              </b>
            </div>
          )) : (
            <div className="empty">
              <i><Sparkles size={22} strokeWidth={1.6} /></i>
              <strong>A fresh start</strong>Stock changes made today will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
