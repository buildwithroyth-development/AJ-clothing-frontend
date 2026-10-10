import { Menu } from 'lucide-react'
import logoImg from '../../assets/AJ_logo.png'

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
      <div className="crumb">
        <img src={logoImg} alt="AJ Clothing Logo" className="crumb-logo-img" />
        <span>AJ CLOTHING</span>
        <span className="crumb-sep">/</span>
        <span>{activePage.toUpperCase()}</span>
      </div>
      <div className="top-right"><b>●</b> Store workspace</div>
    </header>
  )
}
