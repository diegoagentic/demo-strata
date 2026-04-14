// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Step State Mapping
// Phase 4.5 of WRG Demo v6 implementation · v7 restructure (2-flow split)
// Maps WRG demo step IDs (w1.1, w1.2, w2.1, w2.2, w2.3) to Estimator state
// ═══════════════════════════════════════════════════════════════════════════════

import { getRoleProfile } from './roles'
import type { ConnectedUser } from './StrataEstimatorNavbar'
import type { EstimatorTab } from './types'

/**
 * Visual states the Estimator can be in, driven by currentStep.
 */
export type EstimatorStepState =
    | 'idle'                    // default — JPS pre-loaded, not yet interactive
    | 'estimation-active'       // w1.1 — Hero live, AI stagger import, flag row 19
    | 'estimation-escalated'    // w1.2 — BoM row 19 focused, Designer overlay open
    | 'estimation-assembly'     // w2.1 — VerificationLogCard + pricing waterfall
    | 'proposal-review'         // w2.2 — read-only shell + approval chain modal
    | 'client-delivery'         // w2.3 — email → PDF preview → send to client

interface StepMapping {
    state: EstimatorStepState
    tab: EstimatorTab
    role: string // 'Expert' | 'Designer' | 'Dealer' | 'Sales Coordinator'
}

/**
 * Map each step ID to the corresponding Estimator state + active tab + role.
 */
const STEP_MAP: Record<string, StepMapping> = {
    // Flow 1 — AI Labor Estimation
    'w1.1': { state: 'estimation-active',    tab: 'ESTIMATOR', role: 'Expert' },
    'w1.2': { state: 'estimation-escalated', tab: 'ESTIMATOR', role: 'Designer' },
    // Flow 2 — Proposal Generation
    'w2.1': { state: 'estimation-assembly',  tab: 'ESTIMATOR', role: 'Expert' },
    'w2.2': { state: 'proposal-review',      tab: 'ESTIMATOR', role: 'Dealer' },
    'w2.3': { state: 'client-delivery',      tab: 'ESTIMATOR', role: 'Sales Coordinator' },
}

/**
 * Returns the Estimator visual state for a given step ID.
 * Defaults to 'idle' if step is not mapped.
 */
export function getStepState(stepId: string | undefined): EstimatorStepState {
    if (!stepId) return 'idle'
    return STEP_MAP[stepId]?.state ?? 'idle'
}

/**
 * Returns the tab that should be active for a given step ID.
 * Defaults to 'ESTIMATOR' if step is not mapped.
 */
export function getStepTab(stepId: string | undefined): EstimatorTab {
    if (!stepId) return 'ESTIMATOR'
    return STEP_MAP[stepId]?.tab ?? 'ESTIMATOR'
}

/**
 * Returns the ConnectedUser for a given step ID, or null if none applies.
 */
export function getStepRole(stepId: string | undefined): ConnectedUser | null {
    if (!stepId) return null
    const role = STEP_MAP[stepId]?.role
    if (!role) return null
    return getRoleProfile(role)
}
