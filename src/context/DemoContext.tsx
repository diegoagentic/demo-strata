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
    role: 'Expert' | 'System' | 'Dealer' | 'End User';
    highlightId?: string;
}

const DEMO_STEPS: DemoStep[] = [
    // ═══════════════════════════════════════════
    // FLOW 1: RFQ to PO Processing
    // ═══════════════════════════════════════════
    {
        id: '1.1',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Email Ingestion',
        description: 'Dealer sends email with RFQ: text + PDF spec + CSV line items.',
        app: 'email-marketplace',
        role: 'Dealer',
        highlightId: 'email-rfq-incoming'
    },
    {
        id: '1.2',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'AI Extraction & Parsing',
        description: 'OCR/TextExtract processes attachments. Parser extracts line items, quantities, finishes, ship-to, dates.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-ai-extraction'
    },
    {
        id: '1.3',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Normalization & Confidence',
        description: 'DataNormalizationAgent unifies data to RFQ/Quote Draft. Shows confidence score per field and missing fields.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-normalization'
    },
    {
        id: '1.4',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Quote Draft Creation',
        description: 'High confidence → auto Quote draft. Low confidence or missing fields → "Needs Attention" task for Expert.',
        app: 'dealer-kanban',
        role: 'System',
        highlightId: 'kanban-quote-draft'
    },
    {
        id: '1.5',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Expert Review (HITL)',
        description: 'Expert sees discrepancies and missing fields in queue. Approves AI corrections or manually edits.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-validation-row'
    },
    {
        id: '1.6',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Quote Approval Chain',
        description: 'System Policy Engine auto-approves. Manager shown as pending approval. Auto-advances.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'approval-chain-progress'
    },
    {
        id: '1.7',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Dealer Quote Approval',
        description: 'Dealer receives quote notification, reviews pricing and line items with AI summary, and approves.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'manager-approval-view'
    },
    {
        id: '1.8',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'PO Generation & Order Approval',
        description: 'Both approvers shown approved. PO auto-generated. Followed by automated order approval chain.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'po-order-approval'
    },
    {
        id: '1.9',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'End User Mobile Approval',
        description: 'End user receives PO approval notification on mobile. Reviews and acknowledges from their phone.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-dealer-approval'
    },
    {
        id: '1.10',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Smart Notifications',
        description: 'Dealer: "RFQ received, Quote ready, PO approved." Expert: only exceptions, digest by priority.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-notifications'
    },
    {
        id: '1.11',
        groupId: 1,
        groupTitle: 'Flow 1: RFQ to PO Processing',
        title: 'Pipeline View',
        description: 'Order creation notification. Pipeline view shows new order card with animated column transition.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'order-pipeline-view'
    },

    // ═══════════════════════════════════════════
    // FLOW 2: PO & ACK Comparison
    // ═══════════════════════════════════════════
    {
        id: '2.1',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Acknowledgement Intake — Pipeline',
        description: 'Two Acknowledgements arrive: AIS (50 lines, $65K) and HAT (5 lines, $8K). Both appear in Pending column.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-pipeline-intake'
    },
    {
        id: '2.2',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Normalization & Smart Comparison',
        description: 'HAT: AI trained — color/desc mismatch OK (part# match). HAT → Confirmed. AIS: grommet error flagged → Discrepancy.',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-dual-normalization'
    },
    {
        id: '2.3',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'AIS Acknowledgement — Delta Engine',
        description: 'Grommet config error (AI auto-corrects), date shifts (auto-accepted), quantity shortfall (escalated to expert).',
        app: 'expert-hub',
        role: 'System',
        highlightId: 'ack-delta-results'
    },
    {
        id: '2.4',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Expert Review — 50 Line Items',
        description: 'Expert reviews ACK-7842. AI corrections shown. Quantity shortfall reviewed and accepted.',
        app: 'expert-hub',
        role: 'Expert',
        highlightId: 'expert-ack-review'
    },
    {
        id: '2.5',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Pipeline Resolution',
        description: 'Pipeline shows: HAT in Confirmed, AIS in Partial. Both Acknowledgements resolved.',
        app: 'expert-hub',
        role: 'Dealer',
        highlightId: 'ack-pipeline-resolved'
    },
    {
        id: '2.6',
        groupId: 2,
        groupTitle: 'Flow 2: PO & Acknowledgement Comparison',
        title: 'Smart Notifications',
        description: 'Dealer: "2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved." Expert: only exceptions.',
        app: 'dashboard',
        role: 'Dealer',
        highlightId: 'action-center-ack-notify'
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Punch List / Warranty Claims
    // ═══════════════════════════════════════════
    {
        id: '3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Request Intake & AI Validation',
        description: 'Expert + AI review incoming service request. AI checks for required documentation: order number, line number, photos of issue, label, and box. Missing items flagged for expert clarification.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-request-intake'
    },
    {
        id: '3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Labor Reimbursement Review',
        description: 'AI validates labor quote against business rules: repair total, trip charge, certified installer, warranty coverage. Expert approves, edits, or rejects.',
        app: 'mac',
        role: 'Expert',
        highlightId: 'punch-labor-review'
    },
    {
        id: '3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'Claim Submission & Tracking',
        description: 'Claim package assembled with photos, issue description, and ship-to address. Acknowledgement received from manufacturer. Shipment tracked on dashboard.',
        app: 'mac',
        role: 'Dealer',
        highlightId: 'punch-claim-submission'
    },
    {
        id: '3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Punch List / Warranty Claims',
        title: 'End User Process Report',
        description: 'End user receives the completed punch list report on mobile. Reviews details and can leave comments before final acknowledgement.',
        app: 'dashboard',
        role: 'End User',
        highlightId: 'mobile-enduser-report'
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
    isPaused: boolean;
    togglePause: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isDemoActive, setIsDemoActive] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const togglePause = () => setIsPaused(prev => !prev);

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
                setIsSidebarCollapsed,
                isPaused,
                togglePause
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
