// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Barrel Export
// Based on Project Aries structure, built with Strata DS components
// See docs/wrg-demo/IMPLEMENTATION_PLAN.md for implementation phases
// ═══════════════════════════════════════════════════════════════════════════════

// Types (Phase 1)
export type {
    EstimatorTab,
    EstimateStatus,
    SyncStatus,
    Category,
    Subcategory,
    LineItem,
    Customer,
    OperationalVariables,
    EstimateResult,
    ConfigState,
    SavedEstimate,
} from './types'

// Shell + Navbar (Phase 3)
export { default as StrataEstimatorShell } from './StrataEstimatorShell'
export { default as StrataEstimatorNavbar } from './StrataEstimatorNavbar'
export type { ConnectedUser } from './StrataEstimatorNavbar'

// Estimator sections (Phase 4+)
export { default as EstimatorDossierCard } from './EstimatorDossierCard'
export { default as FinancialSummaryHero } from './FinancialSummaryHero'
export { default as BillOfMaterialsTable } from './BillOfMaterialsTable'
export { default as OperationalConstraintsPanel } from './OperationalConstraintsPanel'
export { default as VisionEngineModal } from './VisionEngineModal'
export { default as ProjectsArchiveView } from './ProjectsArchiveView'

// WRG Demo v6 Origin Splash (Phase 4.6)
export { default as WrgOriginSplash } from './WrgOriginSplash'

// WRG Demo v6 Handoff Banner (Phase 4.7)
export { default as HandoffBanner } from './HandoffBanner'

// Role profiles + Step state mapping (Phase 4.5)
export { ROLE_PROFILES, getRoleProfile } from './roles'
export {
    getStepState,
    getStepTab,
    getStepRole,
    isOriginSplashStep,
} from './stepStates'
export type { EstimatorStepState } from './stepStates'

// Calculations (Phase 2)
export { calculateInstall } from './calculations'

// Mock data (Phase 1)
export {
    INITIAL_CATEGORIES,
    INITIAL_RATES,
    INITIAL_MULTIPLIERS,
    INITIAL_MARGIN,
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CUSTOMER,
    JPS_LINE_ITEMS,
    MOCK_SAVED_ESTIMATES,
} from './mockData'
