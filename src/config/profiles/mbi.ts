// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Modern Business Interiors · Strata AI Demo Profile
//
// CLIENT: Modern Business Interiors (St. Charles, MO + Lenexa, KS · ~42 employees
//         · ~$17M · 30+ manufacturer partners · Allsteel dealer)
// PREPARED BY: Avanto
// DATE: April 2026
//
// DEMO NARRATIVE: 5 AI modules, hero prototype = Budget Builder
//
// FLOW 1 — Budget Builder (Prototype, Phase 3)
//   m1.1: Intake — Design-Assisted path (SIF/CAP upload)
//   m1.2: AI Parsing & Scenarios — Good/Better/Best generated
//   m1.3: AI Validation — Catches $18K Allsteel worksurface mismatch
//   m1.4: Human Review + Output — PDF/Excel delivery
//
// FLOW 2 — Accounting AI (Phase 2, Kathy Belleville)
//   m2.1: AP invoice ingestion with HealthTrust logic
//   m2.2: Non-EDI reconciliation + AR aging alerts
//
// FLOW 3 — Quotes AI (Phase 4, PC bottleneck resolution)
//   m3.1: SIF → CORE auto-import + AI proposal
//
// FLOW 4 — Design AI (Phase 4, Beth Gianino early adopter)
//   m4.1: Spec Check Engine (Q10 #1 — 9.08/10 priority)
//
// HERO SCENARIO: Enterprise Holdings Corporate HQ · $385,000 · HNI contract
//   Allsteel Further worksurface size mismatch caught by AI — $18,240 prevented
//
// Reference: strata-projects/mbi/MBI_DEMO_DEVELOPMENT_PLAN.md
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const MBI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Budget Builder (Hero Prototype)
    // Amanda Renshaw (Account Manager) · 4 steps
    // ═══════════════════════════════════════════
    {
        id: 'm1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Intake — Design-Assisted path',
        description: 'Amanda, account manager at MBI, receives a new opportunity from Enterprise Holdings for a corporate HQ floor renovation. She uploads the SIF export from CET and the CAP worksheet from the design team. Strata detects the path automatically and routes to the parser.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI parsing + scenario generation',
        description: 'Strata parses 24 fields from the SIF, applies the HNI contract discount, calculates freight and install, and generates three scenarios — Good, Better, Best — with product swaps and clear pricing deltas. What used to take Amanda a week is ready in under two minutes.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI validation — $18K catch',
        description: 'Before Amanda sends the budget, Strata flags a critical issue: the Allsteel Further worksurface size in the SIF is incompatible with the panel system. Confidence 94%. Estimated impact: $18,240 — exactly the class of error that cost MBI a real deal last quarter. Amanda accepts the swap suggestion.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Review + client delivery',
        description: 'Amanda reviews the Better scenario, tunes the markup to 33%, and approves. Strata generates both the Excel breakdown and a branded MBI client summary PDF. She sends it to Enterprise Holdings with one click. Total time: 4 minutes, down from 1 week.',
        app: 'mbi-budget',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Accounting AI (Phase 2)
    // Kathy Belleville (Controller, 1-person dept) · 2 steps
    // ═══════════════════════════════════════════
    {
        id: 'm2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'AP invoice ingestion with HealthTrust logic',
        description: 'Kathy, MBI controller, opens her morning queue. Strata has already read 12 vendor invoices overnight — extracted fields, pre-populated CORE vouchers. Healthcare invoices trigger HealthTrust contract logic automatically and flag the 3% royalty line. Kathy reviews exceptions, not every invoice.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'Non-EDI reconciliation + AR aging',
        description: 'For non-EDI manufacturers, Strata compares PO to invoice line-by-line and routes clean matches automatically. Kathy sees only the flagged exceptions. The live billing forecast replaces the bi-weekly Excel — leadership now has real-time visibility.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Quotes AI (Phase 4)
    // PC bottleneck resolution · 1 step
    // ═══════════════════════════════════════════
    {
        id: 'm3.1',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'SIF → CORE auto-import',
        description: 'The approved budget flows downstream. Instead of a PC manually re-entering the SIF into CORE — the largest bottleneck at MBI — Strata auto-imports the structured data and builds the proposal draft. The PC team shifts from builders to reviewers. Three audit loops collapse into one AI validation plus one human check.',
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // ═══════════════════════════════════════════
    // FLOW 4: Design AI (Phase 4)
    // Beth Gianino (early adopter, Q4 8/10) · 1 step
    // ═══════════════════════════════════════════
    {
        id: 'm4.1',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Spec check engine (pilot with Beth)',
        description: 'Beth, an early adopter on the design team, runs Strata Spec Check on her Mercy Hospital ICU project. The engine scans the CET BOM in under 5 minutes, flagging a finish inconsistency — "everything is blue, this one chair is green." Caught before the client sees it. This is the story that will unlock adoption for the rest of the design team.',
        app: 'mbi-design',
        role: 'Designer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm1.1': { mode: 'interactive', userAction: 'Upload the SIF and CAP files and let Strata route to the parser' },
    'm1.2': { mode: 'interactive', userAction: 'Watch Strata parse the SIF and generate three scenarios' },
    'm1.3': { mode: 'interactive', userAction: 'Review the $18K validation flag and accept the AI suggestion' },
    'm1.4': { mode: 'interactive', userAction: 'Approve the Better scenario and send the branded summary to the client' },
    'm2.1': { mode: 'interactive', userAction: 'Review the invoice queue and the HealthTrust-flagged exceptions' },
    'm2.2': { mode: 'interactive', userAction: 'Check the non-EDI reconciliation and the live billing forecast' },
    'm3.1': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE and the proposal auto-build' },
    'm4.1': { mode: 'interactive', userAction: 'Run Spec Check on Beth\'s ICU project and catch the finish issue' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm1.1': [
        'Receiving new Enterprise Holdings opportunity',
        'Loading SIF export from CET',
        'Reading CAP worksheet',
        'Detecting path: Design-Assisted',
        'Routing to AI parser',
    ],
    'm1.2': [
        'Parsing SIF schema — 24 fields extracted',
        'Matching contract: HNI Corporate (55% discount)',
        'Applying markup — 35% default',
        'Calculating freight (% of net)',
        'Calculating install (12% non-union)',
        'Generating Good / Better / Best scenarios',
        'Computing swap deltas',
    ],
    'm1.3': [
        'Cross-checking SIF quantities against CET config',
        'Validating worksurface dimensions',
        'Detected anomaly: Allsteel Further 72×36 not compatible with panel system',
        'Estimating impact: $18,240',
        'AI confidence: 94%',
        'Suggesting swap: Allsteel Shape (compatible 72×36)',
    ],
    'm1.4': [
        'Applying markup 33%',
        'Generating Excel breakdown',
        'Rendering branded MBI client summary PDF',
        'Preparing send to Enterprise Holdings',
        'Version logged in SharePoint',
    ],
    'm2.1': [
        'Fetching overnight invoice queue — 12 vendor PDFs',
        'Document AI extracting fields',
        'Matching to open POs in CORE',
        'Applying HealthTrust exception logic',
        'Flagging 3% royalty lines on Mercy invoices',
        'Routing clean invoices, surfacing exceptions',
    ],
    'm2.2': [
        'Comparing PO vs invoice for non-EDI manufacturers',
        'Flagging mismatches for Kathy review',
        'Generating AR aging report',
        'Drafting collection emails by account',
        'Updating live billing forecast',
    ],
    'm3.1': [
        'Approved budget received from Amanda',
        'Auto-importing SIF structured data to CORE',
        'Building proposal draft from CET + customer context',
        'Running AI spec validation',
        'Handing off to PC for final review',
    ],
    'm4.1': [
        'Beth running Spec Check on ICU project',
        'Scanning CET BOM — 47 line items',
        'Checking finishes — 46 matching, 1 anomaly',
        'Flagged: Line 23 finish "Forest Green" inconsistent with project "Marine Blue" palette',
        'Generating structured report',
        'Caught before client review',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm1.1', 'm1.2', 'm1.3', 'm1.4',
    'm2.1', 'm2.2',
    'm3.1',
    'm4.1',
];
