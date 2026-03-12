// ═══════════════════════════════════════════════════════════════════════════════
// Demo Profile Registry — Central configuration for multi-demo support
// ═══════════════════════════════════════════════════════════════════════════════

import type { StepBehavior } from '../components/demo/DemoStepBanner';
import { COI_STEPS, COI_STEP_BEHAVIOR, COI_STEP_MESSAGES, COI_SELF_INDICATED } from './profiles/coi';
import { COI_DEMO_STEPS, COI_DEMO_STEP_BEHAVIOR, COI_DEMO_STEP_MESSAGES, COI_DEMO_SELF_INDICATED } from './profiles/coi-demo';
import { CRM_STEPS, CRM_STEP_BEHAVIOR, CRM_STEP_MESSAGES, CRM_SELF_INDICATED } from './profiles/crm';
import { DUPLER_STEPS, DUPLER_STEP_BEHAVIOR, DUPLER_STEP_MESSAGES, DUPLER_SELF_INDICATED } from './profiles/dupler';

export type SimulationApp =
    | 'dashboard' | 'expert-hub' | 'email-marketplace'
    | 'quote-po' | 'dealer-kanban' | 'service-now'
    | 'catalog' | 'survey' | 'ack-detail' | 'order-detail'
    | 'quote-detail' | 'transactions' | 'mac' | 'inventory';

export interface DemoStep {
    id: string;
    groupId: number;
    groupTitle: string;
    title: string;
    description: string;
    app: SimulationApp;
    role: 'Expert' | 'System' | 'Dealer' | 'End User';
    highlightId?: string;
}

export type DemoProfileId = 'acme' | 'coi' | 'crm' | 'dupler';

export interface DemoProfile {
    id: DemoProfileId;
    name: string;
    companyName: string;
    description: string;
    icon: string;
    steps: DemoStep[];
    stepBehavior: Record<string, StepBehavior>;
    stepMessages: Record<string, string[]>;
    selfIndicatedSteps: string[];
}

export const DEMO_PROFILES: DemoProfile[] = [
    {
        id: 'acme',
        name: 'Acme Corp',
        companyName: 'Acme Corp',
        description: 'Furniture dealer experience',
        icon: '🪑',
        steps: COI_STEPS,
        stepBehavior: COI_STEP_BEHAVIOR,
        stepMessages: COI_STEP_MESSAGES,
        selfIndicatedSteps: COI_SELF_INDICATED,
    },
    {
        id: 'coi',
        name: 'COI',
        companyName: 'COI Interiors',
        description: 'Contract office interiors',
        icon: '🏗️',
        steps: COI_DEMO_STEPS,
        stepBehavior: COI_DEMO_STEP_BEHAVIOR,
        stepMessages: COI_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: COI_DEMO_SELF_INDICATED,
    },
    {
        id: 'crm',
        name: 'CRM Demo',
        companyName: 'Globex Industries',
        description: 'CRM workflow automation',
        icon: '📊',
        steps: CRM_STEPS,
        stepBehavior: CRM_STEP_BEHAVIOR,
        stepMessages: CRM_STEP_MESSAGES,
        selfIndicatedSteps: CRM_SELF_INDICATED,
    },
    {
        id: 'dupler',
        name: 'Dupler',
        companyName: 'Dupler',
        description: 'Custom client demo',
        icon: '🏢',
        steps: DUPLER_STEPS,
        stepBehavior: DUPLER_STEP_BEHAVIOR,
        stepMessages: DUPLER_STEP_MESSAGES,
        selfIndicatedSteps: DUPLER_SELF_INDICATED,
    },
];
