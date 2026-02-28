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
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  Squares2X2Icon,
  CubeTransparentIcon,
  BellIcon,
  SparklesIcon,
  TruckIcon,
  EnvelopeIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const { isDemoActive, currentStep, isSidebarCollapsed } = useDemo()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'quote-detail' | 'order-detail' | 'ack-detail' | 'ack-detail-ai' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('dashboard')
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
    if (!isDemoActive) return { appName: undefined, customNavigation: undefined };

    switch (currentStep.app) {
      case 'expert-hub':
        return {
          appName: 'Expert Hub',
          customNavigation: [
            { name: 'Home', page: 'dashboard', icon: HomeIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
            { name: 'Quotes', page: 'quote-detail', icon: DocumentTextIcon },
            { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
            { name: 'Analytics', page: '_sim_analytics', icon: ChartBarIcon },
          ]
        };
      case 'service-now':
        return {
          appName: 'ServiceNow',
          customNavigation: [
            { name: 'Service Portal', page: 'dashboard', icon: HomeIcon },
            { name: 'IT Desk', page: '_sim_itdesk', icon: WrenchScrewdriverIcon },
            { name: 'Incidents', page: '_sim_incidents', icon: ExclamationCircleIcon },
            { name: 'Requests', page: '_sim_requests', icon: ClipboardDocumentListIcon },
            { name: 'Knowledge', page: '_sim_knowledge', icon: BookOpenIcon },
          ]
        };
      case 'dealer-kanban':
        return {
          appName: 'Dealer',
          customNavigation: [
            { name: 'Kanban Board', page: 'dashboard', icon: Squares2X2Icon },
            { name: 'Automated Agents', page: '_sim_agents', icon: CubeTransparentIcon },
            { name: 'Performance', page: '_sim_perf', icon: ChartBarIcon },
            { name: 'Alerts', page: '_sim_alerts', icon: BellIcon },
          ]
        };
      case 'catalog':
        return {
          appName: 'Marketplace',
          customNavigation: [
            { name: 'Product Catalog', page: 'dashboard', icon: BookOpenIcon },
            { name: 'AI Assistant', page: '_sim_ai', icon: SparklesIcon },
            { name: 'My Orders', page: '_sim_orders', icon: TruckIcon },
            { name: 'Settings', page: '_sim_settings', icon: WrenchScrewdriverIcon },
          ]
        };
      case 'email-marketplace':
        return {
          appName: 'Wells Fargo Mail',
          customNavigation: [
            { name: 'Inbox', page: 'dashboard', icon: EnvelopeIcon },
            { name: 'Archive', page: '_sim_archive', icon: FolderIcon },
            { name: 'Spam', page: '_sim_spam', icon: ExclamationCircleIcon },
          ]
        };
      case 'quote-po':
        return {
          appName: 'Strata Dealer Portal',
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
            { name: 'Quotes & Orders', page: 'quote-detail', icon: ClipboardDocumentListIcon },
            { name: 'Projects', page: '_sim_projects', icon: FolderIcon },
          ]
        };
      case 'dashboard':
        return {
          appName: 'Strata Dealer Portal',
          customNavigation: [
            { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
            { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
            { name: 'Quotes & Orders', page: 'quote-detail', icon: ClipboardDocumentListIcon },
            { name: 'Projects', page: '_sim_projects', icon: FolderIcon },
          ]
        };
      case 'ack-detail':
        return {
          appName: 'Expert Hub',
          customNavigation: [
            { name: 'Home', page: 'dashboard', icon: HomeIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
            { name: 'Quotes', page: 'quote-detail', icon: DocumentTextIcon },
            { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
            { name: 'Analytics', page: '_sim_analytics', icon: ChartBarIcon },
          ]
        };
      case 'transactions':
        return {
          appName: 'Expert Hub',
          customNavigation: [
            { name: 'Home', page: '_sim_home', icon: HomeIcon },
            { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
            { name: 'Invoices', page: '_sim_invoices', icon: DocumentTextIcon },
            { name: 'Analytics', page: '_sim_analytics', icon: ChartBarIcon },
          ]
        };
      case 'mac':
        return {
          appName: 'Expert Hub',
          customNavigation: [
            { name: 'Home', page: 'dashboard', icon: HomeIcon },
            { name: 'MAC Requests', page: 'mac', icon: WrenchScrewdriverIcon },
            { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
            { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
          ]
        };
      case 'quote-detail':
        return {
          appName: 'Expert Hub',
          customNavigation: [
            { name: 'Home', page: '_sim_home', icon: HomeIcon },
            { name: 'Quotes', page: 'quote-detail', icon: DocumentTextIcon },
            { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
            { name: 'Analytics', page: '_sim_analytics', icon: ChartBarIcon },
          ]
        };
      case 'inventory':
        return {
          appName: 'Strata Dealer Portal',
          customNavigation: [
            { name: 'Dashboard', page: '_sim_home', icon: HomeIcon },
            { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
            { name: 'Shipments', page: 'order-detail', icon: TruckIcon },
            { name: 'Projects', page: '_sim_projects', icon: FolderIcon },
          ]
        };
      default:
        return { appName: undefined, customNavigation: undefined };
    }
  };

  const { appName, customNavigation } = getSimulationConfig();

  // Determine the correct active nav tab during demo mode
  const getActiveTab = () => {
    if (!isDemoActive) return currentPage;
    const appToTab: Record<string, string> = {
      'dealer-kanban': 'dashboard',
      'expert-hub': 'dashboard',
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

      {/* FIXED NAVBAR (Unified) — hidden for email simulation & workspace/detail */}
      {(isDemoActive
        ? currentStep.app !== 'email-marketplace'
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
            customNavigation={customNavigation}
          />
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className={`transition-all duration-300 ${(isDemoActive ? currentStep.app !== 'email-marketplace' : currentPage !== 'detail' && currentPage !== 'workspace') ? 'pt-16' : ''} ${isDemoActive ? (isSidebarCollapsed ? 'pl-0' : 'pl-80') + ' animate-in fade-in duration-500' : ''} min-h-screen bg-background`}>
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
