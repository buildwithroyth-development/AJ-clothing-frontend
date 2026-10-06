export default function Sidebar({ navItems, activePage, setActivePage, mobileNavOpen, setMobileNavOpen }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'active' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`side ${mobileNavOpen ? 'open' : ''}`} id="side">
        <div className="brand">
          <div className="mark">AJ</div>
          <div><b>AJ Clothing</b><small>STORE DESK</small></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={activePage === item.id ? 'active' : ''}
                onClick={() => { setActivePage(item.id); setMobileNavOpen(false) }}
              >
                <i className="nav-icon"><Icon size={18} strokeWidth={1.9} /></i>
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="side-note">
          <strong>A little more in order.</strong>
          <p>Manage stock, create bills and keep your daily view clear.</p>
        </div>
        <div className="side-foot">
          AJ CLOTHING · STORE DESK<br />MAIN BRANCH
        </div>
      </aside>
    </>
  )
}
