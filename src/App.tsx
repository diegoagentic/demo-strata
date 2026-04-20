import { useState, useEffect } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/DemoProfileContext'
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
import StrataArchitectureSlide from "./components/demo/StrataArchitectureSlide"

// Simulations
import ExpertHubTransactions from "./components/simulations/ExpertHubTransactions"
import EmailSimulation from "./components/simulations/EmailSimulation"
import DealerMonitorKanban from "./components/simulations/DealerMonitorKanban"
import ServiceNowSimulation from "./components/simulations/ServiceNowSimulation"
import SpecializedCatalog from "./components/simulations/SpecializedCatalog"
import ConversationalSurvey from "./components/simulations/ConversationalSurvey"
import CRMSimulation from "./components/simulations/CRMSimulation"
import DuplerPdfProcessor from "./components/simulations/DuplerPdfProcessor"
import DuplerWarehouse from "./components/simulations/DuplerWarehouse"
// WRG Demo v6 — Strata Estimator (Opción F: Collaborative Single-Shell)
import { StrataEstimatorShell } from "./features/strata-estimator"
// DuplerReporting now renders inside Dashboard.tsx (Follow Up notification + Metrics processing)

// MBI Demo — 5 page stubs (Phase 0.D · expanded in Phases 1-5)
import MBIOverviewPage from "./components/mbi/MBIOverviewPage"
import MBIBudgetPage from "./components/mbi/MBIBudgetPage"
import MBIAccountingPage from "./components/mbi/MBIAccountingPage"
import MBIQuotesPage from "./components/mbi/MBIQuotesPage"
import MBIDesignPage from "./components/mbi/MBIDesignPage"
import { Network as NetworkIcon, Calculator as CalculatorIcon, Receipt as ReceiptIcon, FileSearch as FileSearchIcon, Palette as PaletteIcon } from 'lucide-react'

import {
  HomeIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'

import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const { isDemoActive, currentStep, isSidebarCollapsed, steps, goToStep } = useDemo()
  const { activeProfile: demoProfile } = useDemoProfile()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'quote-detail' | 'order-detail' | 'ack-detail' | 'ack-detail-ai' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('transactions')
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false)
  const [showArchSlide, setShowArchSlide] = useState(false)

  // Set initial page for CRM steps
  useEffect(() => {
    if (isDemoActive && currentStep?.app === 'crm') {
      setCurrentPage(currentStep.id === '1.12' ? 'dashboard' : 'crm')
    }
  }, [isDemoActive, currentStep?.app, currentStep?.id])

  // Reset in-demo detail navigation when step changes
  useEffect(() => {
    if (isDemoActive && (currentPage === 'order-detail' || currentPage === 'quote-detail' || currentPage === 'ack-detail')) {
      setCurrentPage('transactions')
    }
  }, [currentStep?.id])

  const handleNavigate = (page: string) => {
    if (page === 'overview') {
      setCurrentPage('dashboard')
    } else if (page.startsWith('mbi-')) {
      // MBI nav tabs jump to the first demo step matching that module's app
      const idx = steps.findIndex(s => s.app === page)
      if (idx >= 0) goToStep(idx)
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
  const isContinua = demoProfile.id === 'continua';
  const isDupler = demoProfile.id === 'dupler';
  const isWRG = demoProfile.id === 'wrg';
  const isMBI = demoProfile.id === 'mbi';
  const getSimulationConfig = () => {
    if (!isDemoActive) return { appName: undefined, companyName: undefined, customNavigation: undefined };

    // Standardized app names and company per role
    const isExpert = ['expert-hub', 'dealer-kanban', 'ack-detail', 'transactions', 'mac', 'quote-detail'].includes(currentStep.app);

    // Continua: resolve appName by role (not app) for consistency
    const continuaAppName = currentStep.role === 'Expert' || currentStep.role === 'System' ? 'Expert Hub'
      : currentStep.role === 'Facility Manager' ? 'Facility Manager'
      : currentStep.role === 'Facility User' ? 'Facility User'
      : 'Expert Hub';
    const continuaCompany = currentStep.role === 'Expert' || currentStep.role === 'System' ? 'Strata Services'
      : demoProfile.companyName;

    const isDuplerExpert = isDupler && (currentStep.role === 'Expert' || currentStep.role === 'System');
    const isDuplerDealer = isDupler && currentStep.role === 'Dealer';
    const isWrgDealer = isWRG && currentStep.role === 'Dealer';
    const isWrgExpert = isWRG && currentStep.role === 'Expert';
    const isWrgDesigner = isWRG && currentStep.role === 'Designer';
    const resolvedAppName = isContinua ? continuaAppName
      : currentStep.app === 'email-marketplace' ? (isWRG ? 'WRG Mail' : 'Wells Fargo Mail')
      : currentStep.app === 'catalog' ? 'Marketplace'
      : currentStep.app === 'service-now' ? 'ServiceNow'
      : currentStep.app === 'crm' ? 'Strata CRM'
      : isWrgDesigner ? 'Designer Experience'
      : isWrgDealer ? 'Dealer Experience'
      : isWrgExpert ? 'Expert Hub'
      : isDuplerDealer ? 'Dealer Experience'
      : isDuplerExpert ? 'Expert Hub'
      : isExpert ? 'Expert Hub'
      : 'Dealer Experience';
    const resolvedCompany = isContinua ? continuaCompany : isExpert || isDuplerExpert || isWrgExpert || isWrgDesigner ? 'Strata Services' : demoProfile.companyName;

    // Continua profile: 4-tab nav including Inventory with "Connected" badge
    const continuaNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Inventory', page: 'inventory', icon: ArchiveBoxIcon, badge: 'Connected' },
      { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    const expertNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    const crmNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'CRM', page: 'crm', icon: UserGroupIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    // Dupler profile: 3-tab nav (Dashboard, Inventory, Transactions)
    const duplerNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Inventory', page: 'inventory', icon: ArchiveBoxIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    // WRG profile: no center nav (demo auto-drives all steps)
    const wrgNav: { name: string; page: string; icon: any; badge?: string }[] = [];

    // MBI profile: 5-tab primary nav matching MBI_Strata_Prototype_Flow.html reference
    const mbiNav = [
      { name: 'E2E Flow', page: 'mbi-overview', icon: NetworkIcon },
      { name: 'Budget Builder', page: 'mbi-budget', icon: CalculatorIcon },
      { name: 'Accounting AI', page: 'mbi-accounting', icon: ReceiptIcon },
      { name: 'Quotes AI', page: 'mbi-quotes', icon: FileSearchIcon },
      { name: 'Design AI', page: 'mbi-design', icon: PaletteIcon },
    ];

    const nav = currentStep.app === 'crm' ? crmNav : isWRG ? wrgNav : isDupler ? duplerNav : isContinua ? continuaNav : isMBI ? mbiNav : expertNav;
    return { appName: resolvedAppName, companyName: resolvedCompany, customNavigation: nav };
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
      'crm': currentPage === 'dashboard' ? 'dashboard' : 'crm',
      'dupler-pdf': 'transactions',
      'dupler-warehouse': 'inventory',
      'dupler-reporting': 'dashboard',
      // WRG Demo v6: no global Navbar tab — Estimator owns its own tabs
      'wrg-estimator': 'dashboard',
      // MBI Demo: each module owns its own primary nav tab (see mbiNav)
      'mbi-overview': 'mbi-overview',
      'mbi-budget': 'mbi-budget',
      'mbi-accounting': 'mbi-accounting',
      'mbi-quotes': 'mbi-quotes',
      'mbi-design': 'mbi-design',
    };
    return appToTab[currentStep.app] || currentPage;
  };

  // --- INDEPENDENT SIMULATION ROUTING ---
  const renderSimulation = () => {
    // Allow in-demo navigation to detail pages (e.g. step 1.2 → order-detail)
    if (currentPage === 'order-detail') {
      return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'ack-detail') {
      return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    }
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
      case 'crm':
        return <CRMSimulation onNavigate={handleNavigate} activePage={currentPage} />;
      case 'dupler-pdf':
        return (
          <>
            <DuplerPdfProcessor onNavigate={handleNavigate} />
            <Transactions onLogout={handleLogout} onNavigateToDetail={(type) => setCurrentPage(type as any)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
          </>
        );
      case 'dupler-warehouse':
        return (
          <>
            <DuplerWarehouse onNavigate={handleNavigate} />
            <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
          </>
        );
      case 'dupler-reporting':
        return (
          <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        );
      case 'wrg-estimator':
        // Single collaborative Shell — role + visual state driven by currentStep
        return <StrataEstimatorShell />;
      case 'mbi-overview':
        return <MBIOverviewPage />;
      case 'mbi-budget':
        return <MBIBudgetPage />;
      case 'mbi-accounting':
        return <MBIAccountingPage />;
      case 'mbi-quotes':
        return <MBIQuotesPage />;
      case 'mbi-design':
        return <MBIDesignPage />;
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

      {/* FIXED NAVBAR (Unified) — hidden for email simulation, WRG Estimator routes & workspace/detail */}
      {(isDemoActive
        ? currentStep.app !== 'email-marketplace'
          && currentStep.app !== 'wrg-estimator'
          && !['1.6', '2.1', '4.4'].includes(currentStep.id)
          && !(currentStep.id === '1.8' && currentStep.app !== 'crm')
          && !(currentStep.id === '3.5' && !isContinua)
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
      <main className={`transition-all duration-300 ${(isDemoActive ? currentStep.app !== 'email-marketplace' && currentStep.app !== 'wrg-estimator' : currentPage !== 'detail' && currentPage !== 'workspace') ? 'pt-16' : ''} ${isDemoActive ? (isSidebarCollapsed ? 'pl-0' : 'pl-80') + ' animate-in fade-in duration-500' : ''} min-h-screen bg-background`}>
        {isDemoActive && <DemoAIIndicator />}
        {isDemoActive ? renderSimulation() : renderCurrentPage()}
      </main>

      <DemoGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Architecture Slide — triggered by floating button */}
      {isDemoActive && (
        <>
          <button
            onClick={() => setShowArchSlide(true)}
            className="fixed bottom-4 right-4 z-[90] px-3 py-2 rounded-lg bg-card border border-border shadow-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-1.5"
            title="View Strata Architecture"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            Architecture
          </button>
          <StrataArchitectureSlide open={showArchSlide} onClose={() => setShowArchSlide(false)} />
        </>
      )}
    </GenUIProvider>
  );
}

export default App
