import type { Proposal } from './types';

export const MBI_PROPOSALS: Proposal[] = [
    {
        id: 'PROP-2026-001',
        budgetId: 'BDG-2026-006',
        coreStatus: 'approved',
        lineItemCount: 38,
        manufacturers: ['Allsteel', 'The HON Company'],
        createdBy: 'amy-behl',
        updatedAt: '2026-04-16T15:00:00Z',
    },
    {
        id: 'PROP-2026-002',
        budgetId: 'BDG-2026-005',
        coreStatus: 'approved',
        lineItemCount: 12,
        manufacturers: ['HBF', 'Knoll'],
        createdBy: 'mario',
        updatedAt: '2026-04-15T13:00:00Z',
    },
    {
        id: 'PROP-2026-003',
        budgetId: 'BDG-2026-002',
        coreStatus: 'pending-review',
        lineItemCount: 42,
        manufacturers: ['Allsteel', 'The HON Company', 'Knoll', 'Herman Miller'],
        createdBy: 'amy-behl',
        updatedAt: '2026-04-19T11:30:00Z',
    },
];
