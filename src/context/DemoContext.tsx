import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type SimulationApp =
    | 'dashboard' | 'expert-hub' | 'email-marketplace'
    | 'quote-po' | 'dealer-kanban' | 'service-now'
    | 'catalog' | 'survey' | 'ack-detail' | 'order-detail'
    | 'quote-detail' | 'transactions' | 'mac' | 'inventory';

interface DemoStep {
    id: string;
    groupId: number;
    groupTitle: string;
    title: string;
    description: string;
    app: SimulationApp;
    role: 'Expert' | 'System' | 'Dealer';
    highlightId?: string;
}

const DEMO_STEPS: DemoStep[] = [
    // ═══════════════════════════════════════════
    // FLOW 1: Email Intake (RFQ → Quote → PO)
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Email Ingestion',
        description: 'Dealer sends email with RFQ: text + PDF spec + CSV line items.',
        app: 'email-marketplace',
        role: 'Dealer',
        highlightId: 'email-rfq-incoming'
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'AI Extraction & Parsing',
        description: 'OCR/TextExtract processes attachments. Parser extracts line items, quantities, finishes, ship-to, dates.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ai-extraction'
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Normalization & Confidence',
        description: 'DataNormalizationAgent unifies data to RFQ/Quote Draft. Shows confidence score per field and missing fields.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-normalization'
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Quote Draft Creation',
        description: 'High confidence → auto Quote draft. Low confidence or missing fields → "Needs Attention" task for Expert.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-quote-draft'
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Expert Review (HITL)',
        description: 'Expert sees discrepancies and missing fields in queue. Approves AI corrections or manually edits.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-validation-row'
    },
    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Approval Chain',
        description: 'Total exceeds threshold or non-standard discounts detected → approval chain fires.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'approval-chain-progress'
    },
    {
        id: '1.7',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'PO Generation',
        description: 'Quote approved → POBuilderAgent generates clean PO with mapped line items.',
        app: 'order-detail',
        role: 'Dealer',
        highlightId: 'po-generation'
    },
    {
        id: '1.8',
        groupId: 1,
        groupTitle: 'Flow 1: Email Intake',
        title: 'Smart Notifications',
        description: 'Dealer: "RFQ received, Quote ready, PO approved." Expert: only exceptions, digest by priority.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-notifications'
    },

    // ═══════════════════════════════════════════
    // FLOW 2: ERP Intake (ACK + Comparison)
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'ERP Event Emission',
        description: 'ERP emits event: "ACK Created/Updated" (or EDI/855 translation by connector).',
        app: 'dashboard',
        role: 'System',
        highlightId: 'erp-ack-event'
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'Normalization & Linking',
        description: 'ACK normalized to standard model and linked to original PO.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ack-normalize'
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'PO vs ACK Delta Engine',
        description: 'Line-by-line comparison: substitutions, price changes, date changes, partial quantities.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ack-match'
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'Auto-Fix / Expert Escalation',
        description: 'Within guardrails → auto-resolution. Outside → Expert Hub task with context + recommendation.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-ack-autofix'
    },
    {
        id: '2.5',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'Guided Correction',
        description: 'Two-Pane comparison (PO Original vs ACK Modified). Accept, Reject, or Edit actions.',
        app: 'ack-detail',
        role: 'Expert',
        highlightId: 'expert-ack-fix'
    },
    {
        id: '2.6',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'Backorder Generation',
        description: 'Partial/delayed items → BackorderAgent creates backorder with traceability (item, qty, ETA, impact).',
        app: 'order-detail',
        role: 'System',
        highlightId: 'backorder-split'
    },
    {
        id: '2.7',
        groupId: 2,
        groupTitle: 'Flow 2: ERP Intake',
        title: 'Approval & Notifications',
        description: 'Cost/delivery impact → approval chain. Dealer: "ACK received, 2 exceptions, backorder created."',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-ack-notify'
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Document Intake (Post-PO Operations)
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Document Intake',
        title: 'Document Upload & Classification',
        description: 'Dealer uploads SIF/PDF/CSV/XML/JSON. DocumentClassifierAgent identifies type: Invoice, BOL, MAC, Claim.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'doc-classification'
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Document Intake',
        title: 'Invoice / Bills (3-Way Match)',
        description: 'PO vs ACK vs Invoice comparison. Match → auto-create Invoice. Mismatch → discrepancy + auto-fix proposal.',
        app: 'transactions',
        role: 'Expert',
        highlightId: 'three-way-match'
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Document Intake',
        title: 'Shipment Management',
        description: 'ASN/BOL parsed. Timeline updated with tracking, delays, partial shipments. Backorders generated if needed.',
        app: 'order-detail',
        role: 'Dealer',
        highlightId: 'shipment-timeline'
    },
    {
        id: '3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Document Intake',
        title: 'MAC (Move/Add/Change)',
        description: 'MAC request validated against inventory and active orders. Plan created with approval for scope/cost impact.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'mac-orchestrator'
    },
    {
        id: '3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Document Intake',
        title: 'Warranty Claims',
        description: 'Evidence photos + text. OCR extracts serials. Claim assembled with carrier vs mfg liability recommendation.',
        app: 'service-now',
        role: 'Dealer',
        highlightId: 'warranty-claim-package'
    },
];

interface DemoContextType {
    currentStepIndex: number;
    currentStep: DemoStep;
    steps: DemoStep[];
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    isDemoActive: boolean;
    setIsDemoActive: (active: boolean) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isDemoActive, setIsDemoActive] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const nextStep = () => {
        if (currentStepIndex < DEMO_STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const goToStep = (index: number) => {
        if (index >= 0 && index < DEMO_STEPS.length) {
            setCurrentStepIndex(index);
        }
    };

    return (
        <DemoContext.Provider
            value={{
                currentStepIndex,
                currentStep: DEMO_STEPS[currentStepIndex],
                steps: DEMO_STEPS,
                nextStep,
                prevStep,
                goToStep,
                isDemoActive,
                setIsDemoActive,
                isSidebarCollapsed,
                setIsSidebarCollapsed
            }}
        >
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
};
