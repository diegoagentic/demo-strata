// ═══════════════════════════════════════════════════════════════════════════════
// Dupler Demo Profile — Placeholder (content TBD)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

export const DUPLER_STEPS: DemoStep[] = [
    // Flow 1: Order Processing
    {
        id: 'dup-1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Order Processing',
        title: 'Order Intake',
        description: 'Incoming order received and queued for AI-assisted processing.',
        app: 'dashboard',
        role: 'Dealer',
    },
    {
        id: 'dup-1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Order Processing',
        title: 'AI Validation',
        description: 'AI validates order against inventory, pricing rules, and customer history.',
        app: 'dashboard',
        role: 'System',
    },
    {
        id: 'dup-1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Order Processing',
        title: 'Order Confirmation',
        description: 'Order confirmed and acknowledgement sent to customer with delivery estimate.',
        app: 'dashboard',
        role: 'Dealer',
    },

    // Flow 2: Fulfillment
    {
        id: 'dup-2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Fulfillment',
        title: 'Warehouse Assignment',
        description: 'AI assigns order to optimal warehouse based on inventory and proximity.',
        app: 'dashboard',
        role: 'System',
    },
    {
        id: 'dup-2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Fulfillment',
        title: 'Pick & Pack',
        description: 'Order picked and packed with automated quality check verification.',
        app: 'dashboard',
        role: 'Dealer',
    },
    {
        id: 'dup-2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Fulfillment',
        title: 'Shipping & Tracking',
        description: 'Shipment dispatched with real-time tracking and customer notification.',
        app: 'dashboard',
        role: 'System',
    },

    // Flow 3: Analytics
    {
        id: 'dup-3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Analytics',
        title: 'Operations Dashboard',
        description: 'Real-time overview of order volume, fulfillment rates, and exceptions.',
        app: 'dashboard',
        role: 'Dealer',
    },
    {
        id: 'dup-3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Analytics',
        title: 'AI Recommendations',
        description: 'AI-driven recommendations for inventory optimization and process improvements.',
        app: 'dashboard',
        role: 'System',
    },
];

export const DUPLER_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'dup-1.1': { mode: 'interactive', userAction: 'Review incoming order details' },
    'dup-1.2': { mode: 'auto', duration: 10, aiSummary: 'Validating order against inventory and pricing...' },
    'dup-1.3': { mode: 'interactive', userAction: 'Confirm order and send acknowledgement' },
    'dup-2.1': { mode: 'auto', duration: 8, aiSummary: 'Assigning to optimal warehouse...' },
    'dup-2.2': { mode: 'interactive', userAction: 'Verify pick & pack completion' },
    'dup-2.3': { mode: 'auto', duration: 12, aiSummary: 'Dispatching shipment and generating tracking...' },
    'dup-3.1': { mode: 'interactive', userAction: 'Review operations dashboard metrics' },
    'dup-3.2': { mode: 'auto', duration: 8, aiSummary: 'Generating AI recommendations...' },
};

export const DUPLER_STEP_MESSAGES: Record<string, string[]> = {
    'dup-1.1': ['New order received...', 'Processing order details'],
    'dup-1.2': ['Checking inventory levels...', 'Validating pricing rules', 'Order validated successfully'],
    'dup-1.3': ['Order confirmed...', 'Acknowledgement sent to customer'],
    'dup-2.1': ['Analyzing warehouse proximity...', 'Optimal warehouse selected'],
    'dup-2.2': ['Pick list generated...', 'Quality check complete'],
    'dup-2.3': ['Carrier selected...', 'Tracking number generated', 'Customer notified'],
    'dup-3.1': ['Loading operations metrics...', 'Dashboard ready'],
    'dup-3.2': ['Analyzing patterns...', 'Recommendations generated'],
};

export const DUPLER_SELF_INDICATED: string[] = [];
