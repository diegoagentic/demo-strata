// ═══════════════════════════════════════════════════════════════════════════════
// Dupler Demo Profile — Vendor Data Extraction, Warehouse & Transit, Reporting
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── Step Definitions ────────────────────────────────────────────────────────

export const DUPLER_STEPS: DemoStep[] = [
    // ── Flow 1: Catalog to SIF Conversion ──────────────────────────────────────
    {
        id: 'd1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Catalog to SIF Conversion',
        title: 'Catalog Import & Product Extraction',
        description: 'The designer pastes a manufacturer catalog URL and Strata reads the entire page — identifying products with their part numbers, options, and pricing. Most items are mapped automatically; a few with incomplete options are flagged for review.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Catalog to SIF Conversion',
        title: 'AI & Expert Hub Resolution',
        description: 'Flagged items are shown for review. Strata\'s AI resolves some by suggesting the most likely option based on context. More complex items are handled by a specialist through Expert Hub. The designer reviews and approves each resolution.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Catalog to SIF Conversion',
        title: 'Price Validation & Adjustments',
        description: 'Strata checks all items for price accuracy against the manufacturer catalog. Items with premium options or upgrades that affect cost are flagged as upcharges. The designer reviews and acknowledges each adjustment.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Catalog to SIF Conversion',
        title: 'Specification Package & SIF Conversion',
        description: 'Strata packages the validated items into a specification document with full traceability — every item links back to its source (catalog, AI, or specialist). The specification is converted to SIF format and sent to the Sales Coordinator for pricing.',
        app: 'dupler-pdf',
        role: 'Designer',
    },
    {
        id: 'd1.5',
        groupId: 1,
        groupTitle: 'Flow 1: Catalog to SIF Conversion',
        title: 'SC Pricing & Priced SIF Approval',
        description: 'The Sales Coordinator receives the specification with source indicators per item. They apply the manufacturer discount with AI assistance, generate the priced specification, convert it to a priced SIF, and send it for approval and distribution.',
        app: 'dashboard',
        role: 'SC',
    },

    // ── Flow 2: Warehouse & Inventory Intelligence ─────────────────────────────
    {
        id: 'd2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Warehouse Health & Consignment Review',
        description: 'Strata scans all warehouses to assess capacity, flag aging furniture at client sites, and detect items promised to multiple projects. AI recommends inventory moves to optimize storage and reduce costs.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.2',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Receiving & Condition Check',
        description: 'Items from a purchase order are scanned at the dock. Most match automatically. Exceptions — missing items, wrong finishes, or damage — are flagged for review. Each item receives a condition assessment.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.3',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Price & Margin Verification',
        description: 'Strata verifies item prices against current manufacturer lists. Items with profit margins below the dealer threshold are flagged. The expert reviews each alert and decides whether to update pricing, override, or escalate.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Multi-Warehouse Sync',
        description: 'Inventory is synchronized across all warehouses and job sites. Dock scheduling conflicts are resolved automatically and delivery routes are optimized. Active shipments are detected, connecting to transit tracking.',
        app: 'dupler-warehouse',
        role: 'System',
    },
    {
        id: 'd2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Transit Tracking & Freight Audit',
        description: 'Active shipments are tracked in real time. Strata predicts potential delays and shows their impact on project timelines. A freight audit checks carrier charges against quotes to catch overcharges.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.6',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Vendor Claims & Returns',
        description: 'Active vendor claims for wrong finishes, damage, or warranty issues are reviewed. Each claim shows resolution options and expected credits. Items approaching warranty expiry are also flagged.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.7',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Dealer Review & Dispatch',
        description: 'The Dealer Principal receives a summary with key metrics. They review the staging checklist, confirm all items are accounted for, and approve dispatch with a scheduled delivery.',
        app: 'dashboard',
        role: 'Dealer',
    },

    // ── Flow 3: Observability & Client Reporting ────────────────────────────────
    {
        id: 'd3.1',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Cross-System Data Bridge',
        description: 'Strata connects all the systems the dealer uses daily — design, specifications, pricing, warehouse, and shipping — into a single unified view with inventory by category and an overall health score.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Data Update & Sync',
        description: 'Updates from warehouse operations are verified and synchronized across all connected systems. Changes are confirmed and propagated automatically — no manual intervention needed.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Assembly & Distribution',
        description: 'Strata assembles an intelligence report from synchronized data and sends proactive alerts via Teams, email, and SMS. The report can be previewed, downloaded, and sent to the team.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Observability & Client Reporting',
        title: 'Report Review & Client Portal',
        description: 'The dealer reviews the intelligence report with interactive sections — stock, capacity, backorders, and AI recommendations. A live client portal shows project progress with delivery milestones.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
];

// ─── Step Behavior ───────────────────────────────────────────────────────────

export const DUPLER_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Catalog to SIF Conversion
    'd1.1': { mode: 'interactive', userAction: 'Paste catalog URL. AI extracts products with pricing and options. Click "Continue to Review".' },
    'd1.2': { mode: 'interactive', userAction: 'Review AI suggestions and specialist resolutions. Accept or edit each. Click "Approve All".' },
    'd1.3': { mode: 'interactive', userAction: 'Review price verification and acknowledge upcharges. Click "Continue to Specification".' },
    'd1.4': { mode: 'interactive', userAction: 'Review source traceability. Convert to SIF and send to Sales Coordinator.' },
    'd1.5': { mode: 'interactive', userAction: 'Review specification. Apply discount, convert to priced SIF, and send for approval.' },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { mode: 'interactive', userAction: 'Review warehouse health, aging items, and allocation conflicts. Click "Apply Recommendations".' },
    'd2.2': { mode: 'interactive', userAction: 'Review receiving results and condition assessments. Click "Confirm Receiving".' },
    'd2.3': { mode: 'interactive', userAction: 'Review price verification and margin alerts. Click "Approve Pricing".' },
    'd2.4': { mode: 'interactive', userAction: 'Review warehouse sync and route optimization. Click "Analyze Transit & Freight".' },
    'd2.5': { mode: 'interactive', userAction: 'Review shipments, delay predictions, and freight audit. Click "Continue".' },
    'd2.6': { mode: 'interactive', userAction: 'Review vendor claims and warranty alerts. Click "Process Claims".' },
    'd2.7': { mode: 'interactive', userAction: 'Review consolidated report. Verify staging checklist and approve dispatch.' },

    // Flow 3: Observability & Client Reporting
    'd3.1': { mode: 'interactive', userAction: 'Review cross-system connections and health score. Click "Continue to Data Sync".' },
    'd3.2': { mode: 'interactive', userAction: 'Review updates from warehouse operations. Click "Synchronize" to propagate across all systems.' },
    'd3.3': { mode: 'interactive', userAction: 'Report assembles automatically. Preview, download, or send to team.' },
    'd3.4': { mode: 'interactive', userAction: 'Review report sections. Preview, download, or send. Check client portal.' },
};

// ─── Step Messages (AI Agent Progress) ───────────────────────────────────────

export const DUPLER_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1: Web Catalog Import
    'd1.1': [
        'WebScraperAgent: navigating Meridian Workspace catalog — Healthcare Office collection...',
        'TableExtractor: parsing product grid — 7 line items with pricing data',
        'OptionParser: classifying part numbers, options, finishes, quantities',
        'UndecidedDetector: 3 items have incomplete options — flagging for review',
    ],
    'd1.2': [
        'CatalogMapper: mapping 7 Meridian items to SPEC format...',
        'OptionInferenceEngine: analyzing project context — 2 options auto-suggested',
        'ExpertHubRouter: 2 items escalated to Expert Hub — specialist response received',
    ],
    'd1.3': [
        'OptionRuleChecker: validating 7 items against Meridian configuration rules',
        'UpchargeDetector: 2 option selections trigger upcharges — $1,470 total',
        'CatalogPriceVerifier: all 7 items verified against scraped catalog prices',
    ],
    'd1.4': [
        'SpecAssembler: building specification package — 7 Meridian items',
        'SourceLinker: linking items to catalog URL + Expert Hub resolutions',
        'TraceabilityArchiver: archiving source URL and expert notes for audit trail',
    ],
    'd1.5': [
        'SPEC-MH-0412 received from Designer Alex Rivera — specification ready',
        'DiscountAdvisor: suggesting Meridian Workspace dealer discount...',
        'MarginCalculator: computing margins after discount and upcharges',
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
        'UpdateVerifier: 3 updates from warehouse ops confirmed',
        'CrossSystemSync: propagating to CET · SPEC · Compass · WMS · Carrier',
        'ConsistencyCheck: 1,840 records verified — 100% consistent',
        'SyncComplete: all 5 systems in sync — ready for reporting',
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
};

// ─── Self-Indicated Steps (handle own AI indicator) ──────────────────────────

export const DUPLER_SELF_INDICATED: string[] = [
    'd1.1', 'd1.2', 'd1.3', 'd1.4', 'd1.5',                 // Flow 1: all steps
    'd2.1', 'd2.2', 'd2.3', 'd2.4', 'd2.5', 'd2.6', 'd2.7', // Flow 2: all steps
    'd3.1', 'd3.2', 'd3.3', 'd3.4',                            // Flow 3: all steps
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
};
