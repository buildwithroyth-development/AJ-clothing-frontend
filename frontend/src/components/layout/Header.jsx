import { Menu } from 'lucide-react'

export default function Header({ activePage, mobileNavOpen, setMobileNavOpen }) {
  return (
    <header className="top">
      <button
        type="button"
        className="mobile-toggle"
        id="mobile-toggle"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>
      <div className="crumb">AJ CLOTHING <span>/</span> {activePage.toUpperCase()}</div>
      <div className="top-right"><b>●</b> Store workspace</div>
    </header>
  )
}
