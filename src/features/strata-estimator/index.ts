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
