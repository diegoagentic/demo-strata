// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Role Profiles
// Phase 4.5 of WRG Demo v6 implementation
// Maps demo roles (Expert/Designer/Dealer/Salesperson) to ConnectedUser profiles
// ═══════════════════════════════════════════════════════════════════════════════

import type { ConnectedUser } from './StrataEstimatorNavbar'

export const ROLE_PROFILES: Record<string, ConnectedUser> = {
    Expert: {
        name: 'David Park',
        role: 'Regional Sales Manager',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    Designer: {
        name: 'Alex Rivera',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    Dealer: {
        name: 'Sara Chen',
        role: 'Account Manager',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    'Sales Coordinator': {
        name: 'Riley Morgan',
        role: 'Sales Account Coordinator',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    },
}

/**
 * Returns the ConnectedUser for a given role string, or null if not found.
 * Used by the Shell to pass the correct user to the navbar based on currentStep.role.
 */
export function getRoleProfile(role: string | undefined): ConnectedUser | null {
    if (!role) return null
    return ROLE_PROFILES[role] ?? null
}
