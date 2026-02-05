import { useState } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import Login from "./Login"
import Dashboard from "./Dashboard"
import Detail from "./Detail"
import Workspace from "./Workspace"
import Inventory from "./Inventory"
import Catalogs from "./Catalogs"
import MAC from "./MAC"
import Transactions from "./Transactions"
import CRM from "./CRM"
import Pricing from "./Pricing"
import Navbar from "./components/Navbar"

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'detail' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('login')

  const handleNavigate = (page: string) => {
    // Map generic page names to specific state keys if needed, or just use directly
    // 'overview' from Navbar maps to 'dashboard' here
    if (page === 'overview') {
      setCurrentPage('dashboard')
    } else {
      // @ts-ignore
      setCurrentPage(page)
    }
  }

  return (
    <GenUIProvider onNavigate={handleNavigate}>
      {currentPage !== 'login' && currentPage !== 'detail' && currentPage !== 'workspace' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar
            onLogout={() => setCurrentPage('login')}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            activeTab={currentPage}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      <div className={currentPage !== 'login' && currentPage !== 'detail' && currentPage !== 'workspace' ? 'pt-24' : ''}>
        {currentPage === 'login' ? (
          <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
        ) : currentPage === 'dashboard' ? (
          <Dashboard onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'inventory' ? (
          <Inventory onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'catalogs' ? (
          <Catalogs onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'mac' ? (
          <MAC onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'transactions' ? (
          <Transactions onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'crm' ? (
          <CRM onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'pricing' ? (
          <Pricing onLogout={() => setCurrentPage('login')} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        ) : currentPage === 'detail' ? (
          <Detail onBack={() => setCurrentPage('dashboard')} onLogout={() => setCurrentPage('login')} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : currentPage === 'workspace' ? (
          <Workspace onBack={() => setCurrentPage('dashboard')} onLogout={() => setCurrentPage('login')} onNavigateToWorkspace={() => setCurrentPage('workspace')} />
        ) : null}
      </div>
    </GenUIProvider>
  )
}

export default App
