import { useState } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import { useDemo } from './context/DemoContext'
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
import DemoGuide from "./components/DemoGuide"
import SessionExpiryModal from "./components/SessionExpiryModal"
import DemoSidebar from "./components/demo/DemoSidebar"
import DemoSpotlight from "./components/demo/DemoSpotlight"
import DemoProcessPanel from "./components/demo/DemoProcessPanel"
import DemoStepBanner from "./components/demo/DemoStepBanner"
import DemoAIIndicator from "./components/demo/DemoAIIndicator"

// Simulations
import ExpertHubTransactions from "./components/simulations/ExpertHubTransactions"
import EmailSimulation from "./components/simulations/EmailSimulation"
import DealerMonitorKanban from "./components/simulations/DealerMonitorKanban"
import ServiceNowSimulation from "./components/simulations/ServiceNowSimulation"
import SpecializedCatalog from "./components/simulations/SpecializedCatalog"
import ConversationalSurvey from "./components/simulations/ConversationalSurvey"

import {
  HomeIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'

import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const { isDemoActive, currentStep, isSidebarCollapsed } = useDemo()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'quote-detail' | 'order-detail' | 'ack-detail' | 'ack-detail-ai' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('transactions')
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false)

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

  if (initialLoading) {
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

  if (!user) {
    return <Login />
  }

  // --- SIMULATION CONFIGURATIONS ---
  const getSimulationConfig = () => {
    if (!isDemoActive) return { appName: undefined, companyName: undefined, customNavigation: undefined };

    // Standardized app names and company per role
    const isExpert = ['expert-hub', 'dealer-kanban', 'ack-detail', 'transactions', 'mac', 'quote-detail'].includes(currentStep.app);
    const resolvedAppName = currentStep.app === 'email-marketplace' ? 'Wells Fargo Mail'
      : currentStep.app === 'catalog' ? 'Marketplace'
      : currentStep.app === 'service-now' ? 'ServiceNow'
      : isExpert ? 'Expert Hub'
      : 'Dealer Experience';
    const resolvedCompany = isExpert ? 'Strata Services' : 'Acme Corp';

    switch (currentStep.app) {
      case 'expert-hub':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'service-now':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'dealer-kanban':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'catalog':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'email-marketplace':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'quote-po':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'dashboard':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'ack-detail':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'transactions':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'mac':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'quote-detail':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      case 'inventory':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
          ]
        };
      default:
        return { appName: undefined, companyName: undefined, customNavigation: undefined };
    }
  };

  const { appName, companyName, customNavigation } = getSimulationConfig();

  // Determine the correct active nav tab during demo mode
  const getActiveTab = () => {
    if (!isDemoActive) return currentPage;
    const appToTab: Record<string, string> = {
      'dealer-kanban': 'transactions',
      'expert-hub': 'transactions',
      'service-now': 'dashboard',
      'catalog': 'dashboard',
      'email-marketplace': 'dashboard',
      'dashboard': 'dashboard',
      'transactions': 'transactions',
      'quote-po': 'quote-detail',
      'quote-detail': 'quote-detail',
      'order-detail': 'order-detail',
      'ack-detail': 'transactions',
      'mac': 'mac',
      'inventory': 'inventory',
    };
    return appToTab[currentStep.app] || currentPage;
  };

  // --- INDEPENDENT SIMULATION ROUTING ---
  const renderSimulation = () => {
    switch (currentStep.app) {
      case 'expert-hub':
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
      case 'email-marketplace':
        return <EmailSimulation />;
      case 'dealer-kanban':
        return <DealerMonitorKanban onNavigate={handleNavigate} />;
      case 'service-now':
        return <ServiceNowSimulation />;
      case 'catalog':
        return <SpecializedCatalog />;
      case 'survey':
        return <ConversationalSurvey />;
      case 'quote-po':
        return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'order-detail':
        return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'ack-detail':
        return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'transactions':
        return <Transactions onLogout={handleLogout} onNavigateToDetail={(type) => setCurrentPage(type as any)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'mac':
        return <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'quote-detail':
        return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'inventory':
        return <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      default:
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
    }
  };

  const renderCurrentPage = () => {
    if (currentPage === 'dashboard') return <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'inventory') return <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'catalogs') return <Catalogs onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'mac') return <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'transactions') return (
      <Transactions
        onLogout={handleLogout}
        onNavigateToDetail={(type) => setCurrentPage(type as any)}
        onNavigateToWorkspace={() => setCurrentPage('workspace')}
        onNavigate={handleNavigate}
      />
    );
    if (currentPage === 'crm') return <CRM onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'pricing') return <Pricing onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'detail') return <Detail onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'quote-detail') return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'order-detail') return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'ack-detail') return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'ack-detail-ai') return <AckDetail initialTab={1} onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'workspace') return <Workspace onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />;
    return null;
  };

  return (
    <GenUIProvider onNavigate={handleNavigate}>
      <SessionExpiryModal
        isOpen={showSessionWarning}
        onExtend={refreshSession}
        onLogout={handleLogout}
      />

      {/* Demo UI Elements */}
      <DemoSidebar />
      <DemoSpotlight />
      <DemoProcessPanel onNavigate={handleNavigate} />
      <DemoStepBanner />

      {/* FIXED NAVBAR (Unified) — hidden for email simulation & workspace/detail */}
      {(isDemoActive
        ? currentStep.app !== 'email-marketplace' && !['1.8', '3.4'].includes(currentStep.id)
        : currentPage !== 'detail' && currentPage !== 'workspace'
      ) && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <Navbar
            onLogout={handleLogout}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            activeTab={getActiveTab()}
            onNavigate={handleNavigate}
            appName={appName}
            companyName={companyName}
            customNavigation={customNavigation}
          />
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className={`transition-all duration-300 ${(isDemoActive ? currentStep.app !== 'email-marketplace' : currentPage !== 'detail' && currentPage !== 'workspace') ? 'pt-16' : ''} ${isDemoActive ? (isSidebarCollapsed ? 'pl-0' : 'pl-80') + ' animate-in fade-in duration-500' : ''} min-h-screen bg-background`}>
        {isDemoActive && <DemoAIIndicator />}
        {isDemoActive ? renderSimulation() : renderCurrentPage()}
      </main>

      <DemoGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={handleNavigate}
      />
    </GenUIProvider>
  );
}

export default App
