// ═══════════════════════════════════════════════════════════════════════════════
// Demo Profile Registry — Central configuration for multi-demo support
// ═══════════════════════════════════════════════════════════════════════════════

import type { StepBehavior } from '../components/demo/DemoStepBanner';
import { COI_STEPS, COI_STEP_BEHAVIOR, COI_STEP_MESSAGES, COI_SELF_INDICATED } from './profiles/coi';
import { COI_DEMO_STEPS, COI_DEMO_STEP_BEHAVIOR, COI_DEMO_STEP_MESSAGES, COI_DEMO_SELF_INDICATED } from './profiles/coi-demo';
import { DUPLER_STEPS, DUPLER_STEP_BEHAVIOR, DUPLER_STEP_MESSAGES, DUPLER_SELF_INDICATED } from './profiles/dupler';
import { OPS_DEMO_STEPS, OPS_DEMO_STEP_BEHAVIOR, OPS_DEMO_STEP_MESSAGES, OPS_DEMO_SELF_INDICATED } from './profiles/ops-demo';
import { CONTINUA_DEMO_STEPS, CONTINUA_DEMO_STEP_BEHAVIOR, CONTINUA_DEMO_STEP_MESSAGES, CONTINUA_DEMO_SELF_INDICATED } from './profiles/continua-demo';
import { WRG_DEMO_STEPS, WRG_DEMO_STEP_BEHAVIOR, WRG_DEMO_STEP_MESSAGES, WRG_DEMO_SELF_INDICATED } from './profiles/wrg-demo';
import { MBI_STEPS, MBI_STEP_BEHAVIOR, MBI_STEP_MESSAGES, MBI_SELF_INDICATED } from './profiles/mbi';

export type SimulationApp =
    | 'dashboard' | 'expert-hub' | 'email-marketplace'
    | 'quote-po' | 'dealer-kanban' | 'service-now'
    | 'catalog' | 'survey' | 'ack-detail' | 'order-detail'
    | 'quote-detail' | 'transactions' | 'mac' | 'inventory'
    | 'crm'
    | 'dupler-pdf' | 'dupler-warehouse' | 'dupler-reporting'
    | 'wrg-estimator'
    | 'mbi-overview' | 'mbi-budget' | 'mbi-accounting' | 'mbi-quotes' | 'mbi-design';

export interface DemoStep {
    id: string;
    groupId: number;
    groupTitle: string;
    title: string;
    description: string;
    app: SimulationApp;
    role: 'Expert' | 'System' | 'Dealer' | 'End User' | 'Sales Rep' | 'Facility Manager' | 'Facility User' | 'Designer' | 'Sales Coordinator' | 'Estimator' | 'Project Manager';
    highlightId?: string;
}

export type DemoProfileId = 'acme' | 'coi' | 'dupler' | 'ops' | 'continua' | 'wrg' | 'mbi';

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
        companyName: 'COI',
        description: 'Contract office interiors',
        icon: '🏗️',
        steps: COI_DEMO_STEPS,
        stepBehavior: COI_DEMO_STEP_BEHAVIOR,
        stepMessages: COI_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: COI_DEMO_SELF_INDICATED,
    },
    {
        id: 'ops',
        name: 'OPS Demo (Demo 2)',
        companyName: 'Apex Furniture',
        description: 'Receiving, invoicing & financial control',
        icon: '📦',
        steps: OPS_DEMO_STEPS,
        stepBehavior: OPS_DEMO_STEP_BEHAVIOR,
        stepMessages: OPS_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: OPS_DEMO_SELF_INDICATED,
    },
    {
        id: 'dupler',
        name: 'Dupler',
        companyName: 'Dupler',
        description: 'PDF→SIF, Warehouse & Transit, Unified Reporting',
        icon: '🏢',
        steps: DUPLER_STEPS,
        stepBehavior: DUPLER_STEP_BEHAVIOR,
        stepMessages: DUPLER_STEP_MESSAGES,
        selfIndicatedSteps: DUPLER_SELF_INDICATED,
    },
    {
        id: 'continua',
        name: 'Continua',
        companyName: 'Continua',
        description: 'Project lifecycle, inventory intelligence & sustainability',
        icon: '🏗️',
        steps: CONTINUA_DEMO_STEPS,
        stepBehavior: CONTINUA_DEMO_STEP_BEHAVIOR,
        stepMessages: CONTINUA_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: CONTINUA_DEMO_SELF_INDICATED,
    },
    {
        id: 'wrg',
        name: 'WRG',
        companyName: 'WRG',
        description: 'Quoting lifecycle — intake to client proposal',
        icon: '🔧',
        steps: WRG_DEMO_STEPS,
        stepBehavior: WRG_DEMO_STEP_BEHAVIOR,
        stepMessages: WRG_DEMO_STEP_MESSAGES,
        selfIndicatedSteps: WRG_DEMO_SELF_INDICATED,
    },
    {
        id: 'mbi',
        name: 'MBI',
        companyName: 'MBI',
        description: 'Modern Business Interiors · Budget Builder prototype + Accounting/Quotes/Design AI',
        icon: '🏢',
        steps: MBI_STEPS,
        stepBehavior: MBI_STEP_BEHAVIOR,
        stepMessages: MBI_STEP_MESSAGES,
        selfIndicatedSteps: MBI_SELF_INDICATED,
    },
];
