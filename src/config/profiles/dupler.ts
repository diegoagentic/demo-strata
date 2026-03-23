// ═══════════════════════════════════════════════════════════════════════════════
// Dupler Demo Profile — PDF→SIF, Warehouse & Transit, Unified Reporting
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── Step Definitions ────────────────────────────────────────────────────────

export const DUPLER_STEPS: DemoStep[] = [
    // ── Flow 1: PDF to SIF Spec Check ───────────────────────────────────────
    {
        id: 'd1.1',
        groupId: 1,
        groupTitle: 'Flow 1: PDF to SIF Spec Check',
        title: 'PDF Extraction',
        description: 'National Furniture quote PDF received — 8 pages. OCR engine extracts 32 line items with part numbers, quantities, and list pricing — 99.2% accuracy.',
        app: 'dupler-pdf',
        role: 'System',
    },
    {
        id: 'd1.2',
        groupId: 1,
        groupTitle: 'Flow 1: PDF to SIF Spec Check',
        title: 'Smart Normalization & SIF Mapping',
        description: 'AI maps National part numbers to SIF catalog entries. Expert reviews 5 exceptions: 3 discontinued models with substitution suggestions, 2 description mismatches vs SIF catalog. 27 items auto-mapped at 95%+ confidence.',
        app: 'dupler-pdf',
        role: 'Expert',
    },
    {
        id: 'd1.3',
        groupId: 1,
        groupTitle: 'Flow 1: PDF to SIF Spec Check',
        title: 'Price & Contract Validation',
        description: 'AI cross-checks PDF list prices vs Compass discount tiers and vendor contracts in Core (SCS). 4 discrepancies flagged ($1,788 total): 2 regional tax adjustments (Cook County IL 6.7%, NYC 8.0%), 1 outdated list price (+3% vs current), 1 quantity mismatch vs PO.',
        app: 'dupler-pdf',
        role: 'Expert',
    },
    {
        id: 'd1.4',
        groupId: 1,
        groupTitle: 'Flow 1: PDF to SIF Spec Check',
        title: 'Dealer Review, Approval & Export',
        description: 'Dealer receives SIF from Expert, reviews document with regional tax adjustments, adds comments. After approval, 2-level compliance chain runs and SIF exports to Core (SCS).',
        app: 'dashboard',
        role: 'Dealer',
    },

    // ── Flow 2: Warehouse & Inventory Intelligence ─────────────────────────────
    {
        id: 'd2.1',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Warehouse Health & Capacity Forecast',
        description: '3 Dupler warehouses scanned — Columbus at 72% with Mercy Health Phase 2 arriving. AI recommends relocating 85 items to Cincinnati for $3,600/mo savings.',
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
        title: 'PO Price Verification & Tax Compliance',
        description: 'Scanning Allsteel, Kimball, National price lists. 2 items with margin below 25% flagged. Regional tax compliance verified for OH and IL deliveries.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.4',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Multi-Warehouse Sync & Transit',
        description: 'Synchronizing 3 warehouses + 2 job sites. 5 shipments tracked, dock conflict auto-resolved. Route optimization saves $1,200.',
        app: 'dupler-warehouse',
        role: 'System',
    },
    {
        id: 'd2.5',
        groupId: 2,
        groupTitle: 'Flow 2: Warehouse & Inventory Intelligence',
        title: 'Vendor Claims & Returns',
        description: '3 active claims: wrong finish RMA, packaging damage inspection, warranty repair. $2,770 in credits processing. 4 warranty alerts.',
        app: 'dupler-warehouse',
        role: 'Expert',
    },
    {
        id: 'd2.6',
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
        groupTitle: 'Flow 3: Inventory Intelligence & Reporting',
        title: 'Inventory Data Sync',
        description: 'Syncing 1,840 items across 3 warehouses. Stock availability computed by category. 9 active POs tracked ($890K). Inventory health score: 78/100.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.2',
        groupId: 3,
        groupTitle: 'Flow 3: Inventory Intelligence & Reporting',
        title: 'Inventory Reconciliation',
        description: 'Physical vs system count: 97.2% match. 3 discrepancies found: count mismatch (Acuity Chairs), location error (Stride Bench), missing item (Park Table relocated). 5 categories below reorder point.',
        app: 'dupler-reporting',
        role: 'Expert',
    },
    {
        id: 'd3.3',
        groupId: 3,
        groupTitle: 'Flow 3: Inventory Intelligence & Reporting',
        title: 'Inventory Health Report',
        description: 'Building inventory intelligence report: stock availability by category, warehouse capacity forecast (Columbus 72%→89%), backorder analysis, 3 AI optimization recommendations.',
        app: 'dupler-reporting',
        role: 'System',
    },
    {
        id: 'd3.4',
        groupId: 3,
        groupTitle: 'Flow 3: Inventory Intelligence & Reporting',
        title: 'Report Review & Distribution',
        description: 'Dealer reviews inventory intelligence report with drill-down. 3 AI recommendations: reorder Acuity Chairs, relocate 85 items ($3,600/mo savings), 5 EOL SKUs for clearance ($8,450). Export PDF to Randy and Tara.',
        app: 'dupler-reporting',
        role: 'Dealer',
    },
];

// ─── Step Behavior ───────────────────────────────────────────────────────────

export const DUPLER_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: PDF to SIF Spec Check
    'd1.1': { mode: 'interactive', userAction: 'Click "Convert to SIF" in Quick Actions to upload a manufacturer PDF quote. OCR extraction runs automatically after upload.' },
    'd1.2': { mode: 'interactive', userAction: 'Review SIF mapping: 3 discontinued models, 2 description mismatches. Approve when all 5 exceptions reviewed.' },
    'd1.3': { mode: 'interactive', userAction: 'Review price discrepancies: $1,788 across 4 lines (incl. 2 regional tax adjustments). Resolve each flag, then click "Validate & Generate SIF".' },
    'd1.4': { mode: 'interactive', userAction: 'Dealer receives SIF from Expert. Review document, add comments if needed, then click "Approve SIF" to trigger compliance chain and export.' },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { mode: 'interactive', userAction: 'Review warehouse health: Columbus 72% (89% forecast). Click "Apply Recommendations" to optimize.' },
    'd2.2': { mode: 'interactive', userAction: 'Review receiving: 28/30 matched, 26 pristine, 3 inspect, 1 damaged. Click "Confirm Receiving".' },
    'd2.3': { mode: 'interactive', userAction: 'Review price verification: 2 margin alerts, tax compliance for OH/IL. Click "Approve Pricing".' },
    'd2.4': { mode: 'auto', duration: 10, aiSummary: 'Synchronizing 3 warehouses + 2 job sites. Resolving dock conflict, optimizing routes...' },
    'd2.5': { mode: 'interactive', userAction: 'Review 3 vendor claims ($2,770 credits) and 4 warranty alerts. Click "Process Claims".' },
    'd2.6': { mode: 'interactive', userAction: 'Sarah Chen (Dealer) reviews consolidated report. Verify staging checklist, then click "Approve All & Dispatch".' },

    // Flow 3: Inventory Intelligence & Reporting
    'd3.1': { mode: 'auto', duration: 10, aiSummary: 'Syncing inventory data — 1,840 items across 3 warehouses, 9 active POs ($890K)...' },
    'd3.2': { mode: 'interactive', userAction: 'Review inventory reconciliation: 97.2% match, 3 discrepancies. Resolve each, then click "Acknowledge & Continue".' },
    'd3.3': { mode: 'auto', duration: 8, aiSummary: 'Assembling inventory health report — stock availability, capacity forecast, backorder analysis, AI recommendations...' },
    'd3.4': { mode: 'interactive', userAction: 'Review inventory intelligence report sections. Click "Export PDF & Send to Team" to distribute.' },
};

// ─── Step Messages (AI Agent Progress) ───────────────────────────────────────

export const DUPLER_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1
    'd1.1': [
        'UploadAgent: receiving National Furniture quote PDF — 2.4 MB, 8 pages...',
        'OCRAgent: ingesting National Furniture quote PDF — 8 pages detected...',
        'TextExtractAgent: parsing line items — 32 items identified',
        'LineParserAgent: extracting part numbers, quantities, list pricing',
        'CatalogMapper: pre-mapping National codes to SIF catalog entries',
    ],
    'd1.2': [
        'SIFMappingAgent: cross-referencing 32 items against SIF catalog...',
        '27 items auto-mapped with 95%+ confidence',
        '3 discontinued models detected — substitution suggestions generated',
        '2 description mismatches flagged for expert review',
    ],
    'd1.3': [
        'PriceValidationAgent: cross-checking against Compass discounts + vendor contracts...',
        'RegionalTaxEngine: loading tax rates for ship-to addresses (IL, NY)...',
        'Compass + Contract DB: 28 items match current pricing',
        'Discrepancy found: 4 lines with $1,788 total variance',
        'Flags: 2 regional tax adjustments (IL 6.7%, NYC 8.0%), 1 outdated list, 1 qty mismatch',
    ],
    'd1.4': [
        'SIF DUP-0412 sent to Sarah Chen (Dealer) — awaiting review...',
        'Sarah Chen reviewing: 32 items, $94,200, regional tax adjustments (IL, NY)',
        'Sarah Chen approved — triggering compliance chain...',
        'ComplianceAgent: AI Compliance ✓ → Expert ✓',
        'SIFGeneratorAgent: exporting to Core (SCS) — PMX/SPEC import confirmed',
    ],

    // Flow 2
    'd2.1': [
        'WarehouseScanner: scanning 1,840 items across 3 warehouses...',
        'CapacityForecaster: Columbus → 89% in 2 weeks (Mercy Health Phase 2)',
        'OverflowOptimizer: 85 items flagged for relocation to Cincinnati',
        'CostAnalyzer: $3,600/month savings projected',
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
        'RegionalTaxEngine: verifying OH 7.8%, IL 6.7% compliance',
        'MarginCalculator: 2 items below 25% margin — flagged',
    ],
    'd2.4': [
        'WarehouseSync: synchronizing Columbus + Cincinnati + Dayton...',
        'TransitTracker: 5 shipments from 3 manufacturers',
        'DockScheduler: Dock 1 conflict resolved — SH-002 moved to Dock 3',
        'RouteOptimizer: 2 Allsteel deliveries consolidated — $1,200 savings',
    ],
    'd2.5': [
        'ClaimTracker: 3 active claims across Allsteel, National...',
        'ReturnAnalyzer: CLM-2026-052 RMA approved — replacement shipping',
        'CreditProcessor: $2,770 total credits processing',
        'WarrantyChecker: 4 items approaching warranty expiry',
    ],
    'd2.6': [
        'StagingAgent: preparing Mercy Health Phase 2 checklist...',
        '24/26 items staged — 2 pending (Park Table backorder)',
        'Sarah Chen reviewing consolidated warehouse report',
        'Dispatch confirmed: Interior Installations, Thursday 8AM',
    ],

    // Flow 3: Inventory Intelligence
    'd3.1': [
        'WarehouseSync: scanning 1,840 items across 3 warehouses...',
        'POTracker: 9 active POs — $890K receivables',
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
        'InsightEngine: 3 inventory optimization recommendations',
        'Report assembled — 4 sections, PDF-ready',
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
    'd1.1', 'd1.2', 'd1.3', 'd1.4',   // Flow 1: all steps (pipeline processing visible)
    'd2.1', 'd2.2', 'd2.3', 'd2.4', 'd2.5', // Flow 2: all processing steps
    'd3.1', 'd3.2', 'd3.3',            // Flow 3: sync, recon, report assembly
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
    // Flow 1: PDF to SIF
    'd1.1': { notifDelay: 1500, notifDuration: 5000, agentStagger: 700, agentDone: 500, breathing: 1200, resultsDur: 8000 },
    'd1.2': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900, agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd1.3': { notifDelay: 2000, notifDuration: 5000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd1.4': { notifDelay: 2000, notifDuration: 4000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },

    // Flow 2: Warehouse & Inventory Intelligence
    'd2.1': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800, agentDone: 500, breathing: 1500, resultsDur: 0 },
    'd2.2': { notifDelay: 2500, notifDuration: 7000, agentStagger: 1000, agentDone: 700, breathing: 1800, resultsDur: 0 },
    'd2.3': { notifDelay: 3000, notifDuration: 7000, agentStagger: 1200, agentDone: 800, breathing: 2000, resultsDur: 0 },
    'd2.4': { notifDelay: 2500, notifDuration: 6000, agentStagger: 900, agentDone: 600, breathing: 1500, resultsDur: 10000 },
    'd2.5': { notifDelay: 2500, notifDuration: 7000, agentStagger: 900, agentDone: 600, breathing: 1500, resultsDur: 0 },
    'd2.6': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },

    // Flow 3: Unified Reporting
    'd3.1': { notifDelay: 2000, notifDuration: 6000, agentStagger: 900, agentDone: 600, breathing: 1500, resultsDur: 10000 },
    'd3.2': { notifDelay: 2500, notifDuration: 6000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'd3.3': { notifDelay: 1500, notifDuration: 5000, agentStagger: 700, agentDone: 500, breathing: 1000, resultsDur: 8000 },
    'd3.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },
};
