import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Receipt,
  ScrollText,
  Settings,
} from 'lucide-react'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import DashboardPage from './pages/DashboardPage'
import StockPage from './pages/StockPage'
import ComingSoonPage from './pages/ComingSoonPage'

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'stock',     icon: Package,         label: 'Stock maintenance' },
  { id: 'billing',   icon: Receipt,         label: 'Billing' },
  { id: 'bills',     icon: ScrollText,      label: 'All bills' },
  { id: 'settings',  icon: Settings,        label: 'Settings' },
]

export default function App({
  metrics = { todaySales: 0, soldToday: 0, totalStock: 0, totalProducts: 0 },
  lowStockItems = [],
  movements = [],
}) {
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            metrics={metrics}
            lowStockItems={lowStockItems}
            movements={movements}
            setActivePage={setActivePage}
          />
        )
      case 'stock':
        return <StockPage />
      default:
        return (
          <ComingSoonPage
            title={NAV_ITEMS.find((n) => n.id === activePage)?.label || activePage}
          />
        )
    }
  }

  return (
    <div className="layout">
      <Sidebar
        navItems={NAV_ITEMS}
        activePage={activePage}
        setActivePage={setActivePage}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <div className="shell">
        <Header
          activePage={activePage}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />

        <main className="page">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
