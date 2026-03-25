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
        description: 'The designer uploads a vendor quote (PDF or website URL) into Strata. The AI reads the document, identifies 8 furniture items, and extracts key details — product names, quantities, finishes, options, and prices. Each item gets a confidence score showing how certain the AI is about the data.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'AI Mapping & Confidence Review',
        description: 'Strata organizes the 8 extracted items into the project specification format. 5 items map automatically with high confidence. 3 need the designer\'s review — a side-by-side view shows the original document next to the AI result so the designer can confirm or correct each value.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'Validation: Options, Upcharges & Pricing',
        description: 'Strata validates product options and detects $1,380 in additional costs (special finishes and upgraded fabrics). For Allsteel and Gunlock items, prices are verified through the manufacturer\'s portal. For National items, prices are checked against the original quote. A handoff note prepares the transition to the Sales Coordinator.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'Audit vs Drawings & PMX Generation',
        description: 'Strata compares the specification quantities against the floor plan drawings — 31 of 32 match, with 1 discrepancy to resolve. The original documents are archived for traceability. The designer generates the project specification package and sends it to the Sales Coordinator for pricing.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Vendor Data Extraction',
        title: 'SC Review & Pricing Application',
        description: 'The Sales Coordinator receives the validated specification with clear indicators showing where each item came from (manufacturer portal vs. vendor quote). They can view the original source documents, apply manufacturer discounts with AI assistance, and export the final pricing to the ordering system.',
        app: 'dashboard',
        role: 'SC',
    },

    // ── Flow 2: Warehouse & Inventory Intelligence ─────────────────────────────
    {
        id: 'd2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Warehouse Health & Consignment Intelligence',
        description: 'Strata scans 3 warehouses — Columbus is at 72% capacity with the Mercy Health project arriving soon. A "Wall of Shame" highlights furniture sitting too long at client sites. Items promised to multiple projects are flagged, and the AI recommends moving inventory between locations to save $3,600/month.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Receiving & Condition Assessment',
        description: '30 items from a purchase order are scanned at receiving. 28 match automatically, but 2 need attention — one is missing (on backorder) and another arrived in the wrong finish. Condition check: 26 perfect, 3 need closer look, 1 damaged.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'PO Price & Margin Verification',
        description: 'Strata verifies prices against current manufacturer lists for 15 items. Two items are flagged because their profit margins fall below 25%. The expert reviews each alert and decides whether to update pricing, override the margin, or escalate to the Sales Coordinator.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Multi-Warehouse Sync',
        description: 'The system synchronizes inventory across 3 warehouses and 2 job sites. A dock scheduling conflict is resolved automatically, and delivery routes are optimized to save $1,200. The sync detects 5 active shipments, connecting to the next step.',
        app: 'dupler-warehouse',
        role: 'System',
    },
    {
        id: 'd2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'In-Transit Intelligence & Freight Audit',
        description: '5 shipments are tracked in real time. Strata predicts a weather delay on one shipment (+2 days) and shows the impact on the Mercy Health project. A freight audit catches a $340 overcharge from the carrier. A split shipment shows 28 of 30 items received with 2 on backorder.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.6',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Vendor Claims & Returns',
        description: '3 active vendor claims totaling $2,770 in credits — a wrong finish, packaging damage, and a warranty issue. Each has specific resolution options. 4 warranty alerts also need attention. The expert adds professional notes before completing the review.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.7',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Dealer Review & Dispatch Approval',
        description: 'Sarah Chen (Dealer Principal) receives a notification with key metrics — items ready, total value, and open claims. She reviews the full warehouse report, checks the staging checklist (24 of 26 items ready), and approves dispatch for Thursday 8AM delivery.',
        app: 'dashboard',
        role: 'Dealer',
    },

    // ── Flow 3: Inventory Intelligence & Reporting ────────────────────────────
    {
        id: 'd3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Cross-System Data Bridge',
        description: 'Strata connects the 5 systems Dupler uses daily (design, specifications, pricing, warehouse, and shipping) into a single unified view. The result: a visual map of all connections, inventory by category, and a health score of 78/100 across 1,840 items.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Inventory Reconciliation',
        description: 'A physical inventory count is compared against system records — 97.2% match. 3 discrepancies need expert review: a quantity mismatch on chairs, a bench in the wrong location, and a table that can\'t be located. Each gets a specific review form to investigate and resolve.',
        app: 'dupler-reporting',
        role: 'Expert',
    },
    {
        id: 'd3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Assembly & Proactive Alerts',
        description: 'The system assembles an intelligence report and sends 3 proactive notifications — a Teams message about low stock, an email on project staging progress, and an urgent SMS about a backorder. The report is ready for dealer review.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Review & Distribution',
        description: 'The dealer reviews the complete inventory report with stock availability, warehouse capacity, backorder analysis, and AI recommendations. Three actions available: preview as PDF, download the report, or send it directly to team members.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
    {
        id: 'd3.5',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Client Portal Preview',
        description: 'A preview of what the client sees: Mercy Health Phase 2 at 68% complete, with a delivery timeline showing 5 milestones from procurement through final walkthrough. This read-only portal keeps the client informed without needing calls or emails.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
];

// ─── Step Behavior ───────────────────────────────────────────────────────────

export const DUPLER_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Vendor Data Extraction
    'd1.1': { mode: 'interactive', userAction: 'Click "Upload Vendor Data" in Quick Actions. Designer uploads a vendor PDF quote. AI extracts 8 items using OCR and semantic parsing.' },
    'd1.2': { mode: 'interactive', userAction: 'Review AI mapping results. 4 items auto-mapped (97%+). Resolve 4 flagged exceptions (quantity, options, finish/color, material grade). Click "Approve Mapping".' },
    'd1.3': { mode: 'interactive', userAction: 'Acknowledge 2 upcharges ($1,380). Review Compass verification (HNI) and source PDF verification (non-CET). Click "Approve Validation".' },
    'd1.4': { mode: 'interactive', userAction: 'Review drawing audit (1 discrepancy). Verify source traceability. Generate PMX and send to Sales Coordinator.' },
    'd1.5': { mode: 'interactive', userAction: 'SC reviews validated PMX with source badges. Applies discounts (AI-assisted). Generates SIF and exports to CORE.' },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { mode: 'interactive', userAction: 'Review warehouse health, Wall of Shame, and allocation conflicts. Click "Apply Recommendations" to optimize.' },
    'd2.2': { mode: 'interactive', userAction: 'Review receiving: 28/30 matched, 26 pristine, 3 inspect, 1 damaged. Click "Confirm Receiving".' },
    'd2.3': { mode: 'interactive', userAction: 'Review price verification: 2 margin alerts. Click "Approve Pricing".' },
    'd2.4': { mode: 'interactive', userAction: 'Review warehouse sync: 5 locations synced, dock conflict resolved, route optimization -$1,200. Click "Analyze Transit & Freight" to proceed.' },
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
        'ConfidenceScorer: 4 items at 97%+ confidence — 4 flagged for review',
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
    'd1.1', 'd1.2', 'd1.3', 'd1.4', 'd1.5',                 // Flow 1: all steps
    'd2.1', 'd2.2', 'd2.3', 'd2.4', 'd2.5', 'd2.6', 'd2.7', // Flow 2: all steps
    'd3.1', 'd3.2', 'd3.3', 'd3.4', 'd3.5',                  // Flow 3: all steps
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
