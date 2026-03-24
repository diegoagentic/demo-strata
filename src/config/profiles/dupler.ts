// ═══════════════════════════════════════════════════════════════════════════════
// Dupler Demo Profile — Vendor Data Extraction, Warehouse & Transit, Reporting
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── Step Definitions ────────────────────────────────────────────────────────

export const DUPLER_STEPS: DemoStep[] = [
    // ── Flow 1: Vendor Data Extraction & Specification Building ──────────────
    {
        id: 'd1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'Vendor Data Upload & AI Extraction',
        description: 'Designer uploads a vendor quote PDF (or pastes a manufacturer URL) into Strata. AI Extraction Agent reads the document using OCR and semantic parsing — identifies 8 National items with part numbers, quantities, finishes, options, and list prices.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'AI Mapping & Confidence Review',
        description: 'AI Mapping Agent structures extracted data into SPEC/PMX format. 6 of 8 items auto-mapped at 97%+ confidence. 2 items flagged for designer review — quantity ambiguity and truncated option string.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'Validation: Options, Upcharges & Pricing',
        description: 'AI Validation Agent checks options and upcharges ($1,380 total). For HNI items (24 from CET): Compass price verification — 2 updates detected. For non-CET items (8 National): prices verified against source PDF.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'Audit vs Drawings & PMX Generation',
        description: 'AI Audit Agent cross-references spec quantities against floor plan drawings — 1 discrepancy found (Waveworks Desk: spec 8, drawing 10). Source PDF auto-archived to project record. Validated PMX generated and sent to Sales Coordinator.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'SC Review & Pricing Application',
        description: 'Sales Coordinator Randy Martinez receives validated PMX with full source traceability. Applies discounts (Strata-assisted), margins, and freight. Generates SIF and exports to CORE.',
        app: 'dashboard',
        role: 'SC',
    },

    // ── Flow 2: Warehouse & Inventory Intelligence ─────────────────────────────
    {
        id: 'd2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Warehouse Health & Consignment Intelligence',
        description: '3 Dupler warehouses scanned — Columbus at 72% with Mercy Health Phase 2 arriving. Wall of Shame: 3 consignment items overdue. 2 allocation conflicts detected. AI recommends relocating 85 items to Cincinnati for $3,600/mo savings.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Receiving & Condition Assessment',
        description: 'QR scan 30 items from PO-2026-0389. 28 auto-matched, 1 missing (backorder), 1 wrong finish. Condition assessment: 26 pristine, 3 inspect, 1 damaged.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'PO Price & Margin Verification',
        description: 'Scanning Allsteel, Kimball, National price lists. 2 items with margin below 25% flagged. Regional tax compliance noted for OH and IL deliveries.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Multi-Warehouse Sync',
        description: 'Synchronizing 3 warehouses + 2 job sites. Dock conflict auto-resolved (SH-002 → Dock 3). Route optimization saves $1,200.',
        app: 'dupler-warehouse',
        role: 'System',
    },
    {
        id: 'd2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'In-Transit Intelligence & Freight Audit',
        description: '5 active shipments tracked. Predictive alert: SH-004 weather delay +2 days. Freight audit: $340 carrier overcharge detected. Split-shipment: PO-2026-0389 28/30 received, 2 backordered.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.6',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Vendor Claims & Returns',
        description: '3 active claims: wrong finish RMA, packaging damage inspection, warranty repair. $2,770 in credits processing. 4 warranty alerts.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.7',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Dealer Review & Dispatch Approval',
        description: 'Sarah Chen (Dealer) reviews consolidated warehouse intelligence report. Staging checklist: 24/26 items ready. Approves dispatch for Interior Installations Thursday 8AM.',
        app: 'dashboard',
        role: 'Dealer',
    },

    // ── Flow 3: Inventory Intelligence & Reporting ────────────────────────────
    {
        id: 'd3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Cross-System Data Bridge',
        description: 'Syncing 1,840 items across 5 connected systems: CET ↔ SPEC ↔ Compass ↔ Warehouse ↔ Carrier. Stock availability computed by category. Inventory health score: 78/100.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Inventory Reconciliation',
        description: 'Physical vs system count: 97.2% match. 3 discrepancies found: count mismatch (Acuity Chairs), location error (Stride Bench), missing item (Park Table relocated). 5 categories below reorder point.',
        app: 'dupler-reporting',
        role: 'Expert',
    },
    {
        id: 'd3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Assembly & Proactive Alerts',
        description: 'Building inventory intelligence report with proactive push notifications. 3 alerts sent via Teams/Email/SMS. Stock availability, capacity forecast, backorder analysis, 3 AI recommendations.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Review & Distribution',
        description: 'Dealer reviews inventory intelligence report with drill-down. 3 AI recommendations: reorder Acuity Chairs, relocate 85 items ($3,600/mo savings), 5 EOL SKUs for clearance ($8,450). Export PDF to Randy and Tara.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
    {
        id: 'd3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Client Portal Preview',
        description: 'Client-facing portal preview: Mercy Health Phase 2 — 68% complete. Timeline, delivery status, next milestones. Read-only view from client perspective.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
];

// ─── Step Behavior ───────────────────────────────────────────────────────────

export const DUPLER_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Vendor Data Extraction
    'd1.1': { mode: 'interactive', userAction: 'Click "Upload Vendor Data" in Quick Actions. Designer uploads a vendor PDF quote. AI extracts 8 items using OCR and semantic parsing.' },
    'd1.2': { mode: 'interactive', userAction: 'Review AI mapping results. 6 items auto-mapped (97%+). Resolve 2 flagged exceptions (quantity ambiguity, truncated option). Click "Approve Mapping".' },
    'd1.3': { mode: 'interactive', userAction: 'Acknowledge 2 upcharges ($1,380). Review Compass verification (HNI) and source PDF verification (non-CET). Click "Approve Validation".' },
    'd1.4': { mode: 'interactive', userAction: 'Review drawing audit (1 discrepancy). Verify source traceability. Generate PMX and send to Sales Coordinator.' },
    'd1.5': { mode: 'interactive', userAction: 'SC reviews validated PMX with source badges. Applies discounts (AI-assisted). Generates SIF and exports to CORE.' },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { mode: 'interactive', userAction: 'Review warehouse health, Wall of Shame, and allocation conflicts. Click "Apply Recommendations" to optimize.' },
    'd2.2': { mode: 'interactive', userAction: 'Review receiving: 28/30 matched, 26 pristine, 3 inspect, 1 damaged. Click "Confirm Receiving".' },
    'd2.3': { mode: 'interactive', userAction: 'Review price verification: 2 margin alerts. Click "Approve Pricing".' },
    'd2.4': { mode: 'auto', duration: 10, aiSummary: 'Synchronizing 3 warehouses + 2 job sites. Resolving dock conflict, optimizing routes...' },
    'd2.5': { mode: 'interactive', userAction: 'Review 5 shipments, predictive delay alert, freight audit ($340 overcharge), and split-shipment status. Click "Continue".' },
    'd2.6': { mode: 'interactive', userAction: 'Review 3 vendor claims ($2,770 credits) and 4 warranty alerts. Click "Process Claims".' },
    'd2.7': { mode: 'interactive', userAction: 'Sarah Chen (Dealer) reviews consolidated report. Verify staging checklist, then click "Approve All & Dispatch".' },

    // Flow 3: Observability & Client Reporting
    'd3.1': { mode: 'interactive', userAction: 'Review cross-system data bridge: 5 systems connected, 1,840 items, health score 78/100. Click "Continue to Reconciliation".' },
    'd3.2': { mode: 'interactive', userAction: 'Review inventory reconciliation: 97.2% match, 3 discrepancies. Resolve each, then click "Acknowledge & Continue".' },
    'd3.3': { mode: 'auto', duration: 8, aiSummary: 'Assembling inventory health report with proactive alerts — Teams, Email, SMS notifications...' },
    'd3.4': { mode: 'interactive', userAction: 'Review inventory intelligence report sections. Click "Export PDF & Send to Team" to distribute.' },
    'd3.5': { mode: 'interactive', userAction: 'Preview client portal: Mercy Health Phase 2 — 68% complete. Click "Complete Demo" to finish.' },
};

// ─── Step Messages (AI Agent Progress) ───────────────────────────────────────

export const DUPLER_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1: Vendor Data Extraction
    'd1.1': [
        'PdfOcrAgent: reading vendor quote PDF — National Furniture #NF-2026-0412...',
        'SemanticParser: identifying structured fields — tables, footnotes, margin notes',
        'LineItemDetector: 8 line items found across 2 product categories',
        'FieldClassifier: extracting SKUs, quantities, finishes, options, list prices',
    ],
    'd1.2': [
        'ExtractionMapper: structuring 8 items into SPEC/PMX format...',
        'FormatAdapter: mapping field types to SPEC schema',
        'ConfidenceScorer: 6 items at 97%+ confidence — 2 flagged for review',
    ],
    'd1.3': [
        'OptionValidator: checking finish/option configurations against catalog rules',
        'UpchargeDetector: 2 finish selections trigger upcharges — $1,380 total',
        'PriceVerifier: HNI items → Compass (22/24 ✓), non-CET → source PDF match',
    ],
    'd1.4': [
        'DrawingAuditor: cross-referencing spec quantities against floor plan drawings...',
        'QuantityReconciler: 31/32 items match — 1 discrepancy (Waveworks Desk)',
        'SourceArchiver: vendor PDF archived to project record — tagged to line items',
        'PmxGenerator: generating validated PMX-MH-0412...',
    ],
    'd1.5': [
        'PMX-MH-0412 sent to Randy Martinez (SC) — specification package ready',
        'DiscountAdvisor: suggesting applicable discount tiers per manufacturer...',
        'MarginCalculator: computing margins after discounts and upcharges',
        'SifGenerator: generating SIF for CORE export — 32 items, $95,580',
    ],

    // Flow 2
    'd2.1': [
        'WarehouseScanner: scanning 1,840 items across 3 warehouses...',
        'CapacityForecaster: Columbus → 89% in 2 weeks (Mercy Health Phase 2)',
        'ConsignmentTracker: 3 items overdue on client floor — Wall of Shame flagged',
        'AllocationChecker: 2 allocation conflicts detected',
        'OverflowOptimizer: 85 items flagged for relocation — $3,600/mo savings',
    ],
    'd2.2': [
        'QRScanner: scanning 30 items from PO-2026-0389...',
        'POMatchEngine: 28/30 auto-matched',
        'ConditionScanner: 26 pristine, 3 inspect, 1 damaged',
        'ExceptionHandler: 1 missing + 1 wrong finish — claims drafted',
    ],
    'd2.3': [
        'PriceListScanner: scanning Allsteel, Kimball, National Q1 2026...',
        'CostBasisChecker: 3 items with cost changes detected',
        'MarginCalculator: 2 items below 25% margin — flagged',
    ],
    'd2.4': [
        'WarehouseSync: synchronizing Columbus + Cincinnati + Dayton...',
        'DockScheduler: Dock 1 conflict resolved — SH-002 moved to Dock 3',
        'RouteOptimizer: 2 Allsteel deliveries consolidated — $1,200 savings',
    ],
    'd2.5': [
        'TransitTracker: 5 active shipments from 4 carriers...',
        'PredictiveAlertEngine: SH-004 weather delay predicted — +2 days',
        'FreightAuditor: carrier billed $1,540 vs quoted $1,200 — $340 overcharge',
        'SplitReconciler: PO-2026-0389 — 28/30 received, 2 backordered',
    ],
    'd2.6': [
        'ClaimTracker: 3 active claims across Allsteel, National...',
        'ReturnAnalyzer: CLM-2026-052 RMA approved — replacement shipping',
        'CreditProcessor: $2,770 total credits processing',
        'WarrantyChecker: 4 items approaching warranty expiry',
    ],
    'd2.7': [
        'StagingAgent: preparing Mercy Health Phase 2 checklist...',
        '24/26 items staged — 2 pending (Park Table backorder)',
        'Sarah Chen reviewing consolidated warehouse report',
        'Dispatch confirmed: Interior Installations, Thursday 8AM',
    ],

    // Flow 3: Observability & Client Reporting
    'd3.1': [
        'DataBridge: connecting CET ↔ SPEC ↔ Compass ↔ Warehouse ↔ Carrier...',
        'WarehouseSync: scanning 1,840 items across 3 warehouses',
        'StockAnalyzer: computing availability by category',
        'HealthScorer: inventory health score 78/100',
    ],
    'd3.2': [
        'CountVerifier: physical vs system — 97.2% match',
        'LocationChecker: 3 items in wrong location',
        'StockAlertEngine: 5 categories below reorder point',
        'KPICalculator: fill rate 89%, turnover 4.8×',
    ],
    'd3.3': [
        'HealthReporter: building stock availability section...',
        'TrendAnalyzer: computing 6-month category trends',
        'AlertEngine: sending Teams, Email, and SMS notifications...',
        'InsightEngine: 3 inventory optimization recommendations',
    ],
    'd3.4': [
        'Report ready — 4 interactive sections',
        'AI Rec 1: Reorder Acuity Chairs — stock below safety level',
        'AI Rec 2: Relocate 85 items Columbus → Cincinnati — $3,600/mo',
        'AI Rec 3: 5 EOL SKUs — mark for clearance ($8,450)',
    ],
    'd3.5': [
        'ClientPortal: building Mercy Health Phase 2 dashboard...',
        'Timeline: 68% complete — 8 milestones tracked',
        'DeliveryTracker: next delivery scheduled Mar 28',
    ],
};

// ─── Self-Indicated Steps (handle own AI indicator) ──────────────────────────

export const DUPLER_SELF_INDICATED: string[] = [
    'd1.1', 'd1.2', 'd1.3', 'd1.4', 'd1.5',       // Flow 1: all steps
    'd2.1', 'd2.2', 'd2.3', 'd2.4', 'd2.5', 'd2.6', // Flow 2: all processing steps
    'd3.1', 'd3.2', 'd3.3',                          // Flow 3: sync, recon, report assembly
];

// ─── Step Timing ─────────────────────────────────────────────────────────────

export interface DuplerStepTiming {
    notifDelay: number;     // ms before notification appears
    notifDuration: number;  // ms notification stays before processing
    agentStagger: number;   // ms between each agent appearing
    agentDone: number;      // ms after agent appears before checkmark
    breathing: number;      // ms pause between processing and revealed
    resultsDur: number;     // ms results shown before auto-advance (0 = manual)
}

export const DUPLER_STEP_TIMING: Record<string, DuplerStepTiming> = {
    // Flow 1: Vendor Data Extraction
    'd1.1': { notifDelay: 1500, notifDuration: 5000, agentStagger: 700, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd1.2': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900, agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd1.3': { notifDelay: 2000, notifDuration: 5000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd1.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd1.5': { notifDelay: 2000, notifDuration: 4000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800,  agentDone: 500, breathing: 1500, resultsDur: 0 },
    'd2.2': { notifDelay: 2500, notifDuration: 7000, agentStagger: 1000, agentDone: 700, breathing: 1800, resultsDur: 0 },
    'd2.3': { notifDelay: 3000, notifDuration: 7000, agentStagger: 1200, agentDone: 800, breathing: 2000, resultsDur: 0 },
    'd2.4': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900,  agentDone: 600, breathing: 1500, resultsDur: 10000 },
    'd2.5': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900,  agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd2.6': { notifDelay: 2500, notifDuration: 7000, agentStagger: 900,  agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd2.7': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },

    // Flow 3: Observability & Client Reporting
    'd3.1': { notifDelay: 2000, notifDuration: 6000, agentStagger: 900,  agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd3.2': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800,  agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd3.3': { notifDelay: 1500, notifDuration: 5000, agentStagger: 700,  agentDone: 500, breathing: 1000, resultsDur: 8000 },
    'd3.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },
    'd3.5': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },
};
