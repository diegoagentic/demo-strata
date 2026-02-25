import { useState } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import Login from "./Login"
import Dashboard from "./Dashboard"
import Detail from "./Detail"
import QuoteDetail from "./QuoteDetail"
import OrderDetail from "./OrderDetail"
import AckDetail from "./AckDetail"
import Workspace from "./Workspace"
import Inventory from "./Inventory"
import Catalogs from "./Catalogs"
import MAC from "./MAC"
import Transactions from "./Transactions"
import CRM from "./CRM"
import Pricing from "./Pricing"
import Navbar from "./components/Navbar"
import SessionExpiryModal from "./components/SessionExpiryModal"
import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'

function App() {
  const { user, loading, signOut, showSessionWarning, refreshSession } = useAuth()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'quote-detail' | 'order-detail' | 'ack-detail' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('dashboard')

  const handleNavigate = (page: string) => {
    if (page === 'overview') {
      setCurrentPage('dashboard')
    } else {
      // @ts-ignore
      setCurrentPage(page)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentPage('dashboard')
  }

  // Loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoLightBrand} alt="Strata" className="h-16 w-auto block dark:hidden" />
          <img src={logoDarkBrand} alt="Strata" className="h-16 w-auto hidden dark:block" />
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated: show login
  if (!user) {
    return <Login />
  }

  // Authenticated: show app
  return (
    <GenUIProvider onNavigate={handleNavigate}>
      {/* Session Expiry Modal */}
      <SessionExpiryModal
        isOpen={showSessionWarning}
        onExtend={refreshSession}
        onLogout={handleLogout}
      />

      {currentPage !== 'detail' && currentPage !== 'workspace' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar
            onLogout={handleLogout}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            activeTab={currentPage}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      <div className={currentPage !== 'detail' && currentPage !== 'workspace' ? 'pt-24' : ''}>
        {currentPage === 'dashboard' ? (
          <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'inventory' ? (
          <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'catalogs' ? (
          <Catalogs onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'mac' ? (
          <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'transactions' ? (
          <Transactions
            onLogout={handleLogout}
            onNavigateToDetail={(type) => setCurrentPage(type as any)}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={handleNavigate}
          />
        ) : currentPage === 'crm' ? (
          <CRM onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'pricing' ? (
          <Pricing onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'detail' ? (
          <Detail onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : currentPage === 'quote-detail' ? (
          <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : currentPage === 'order-detail' ? (
          <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : currentPage === 'ack-detail' ? (
          <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : currentPage === 'workspace' ? (
          <Workspace onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : null}
      </div>
    </GenUIProvider>
  )
}

export default App
