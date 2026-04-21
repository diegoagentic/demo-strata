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
// FLOW 1 — Budget Builder (Prototype, Phase 3) · 5 tour beats / 6 wizard steps
//   m1.1: Intake — Design-Assisted + Approve/Reject (wizard 0)
//   m1.2: AI Parsing + 2 triage discrepancies (wizard 1)
//   m1.3: Pick a scenario — Good/Better/Best + markup (wizard 2)
//   m1.4: AI Validation — Catches $18K Allsteel worksurface mismatch (wizard 3)
//   m1.5: Review + client delivery — approve folds into Output (wizard 4 → 5)
//
// FLOW 2 — Accounting AI (Phase 2, Kathy Belleville) · 4 scenes / 4 beats
//   m2.1: Morning queue — 12 invoices pre-processed, 2 exceptions
//   m2.2: HealthTrust exception — 3% royalty · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR wrap-up — taxonomy + collection emails + handoff to Flow 3
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
    // Amanda Renshaw (Account Manager) · 5 beats
    // ═══════════════════════════════════════════
    {
        id: 'm1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Intake — Design-Assisted path',
        description: 'Amanda, account manager at MBI, receives a new opportunity from Enterprise Holdings for a corporate HQ floor renovation. She drops in the SIF export from CET and the CAP worksheet from the design team — Strata processes each file in real time, lets her preview, replace or add documents, and then either approve the intake or send it back to the uploader with feedback. Nothing is parsed until she approves.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI parsing + triage',
        description: 'Strata parses 24 fields from the SIF, applies the HNI contract discount, calculates freight and install, and runs a 5-check pre-flight. Two items surface for Amanda to triage before scenarios — a $7,450 ceiling mismatch between the SIF and the CAP, and a Knoll Propeller table that exists in Strata\'s inventory $1,500 cheaper per unit. She decides, then continues.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Pick a scenario — Good / Better / Best',
        description: 'Strata generates three scenarios automatically from the parsed SIF — Good, Better, Best — with product swaps and clear pricing deltas vs the mid-range. Amanda compares them side by side, fine-tunes the markup with a slider, and opens the live pricing breakdown on demand. What used to take a week is a decision she makes in under two minutes.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI validation — $18K catch',
        description: 'Before Amanda sends the budget, Strata flags a critical issue: the Allsteel Further worksurface size in the SIF is incompatible with the panel system. Confidence 94%. Estimated impact: $18,240 — exactly the class of error that cost MBI a real deal last quarter. Amanda accepts the swap suggestion; a secondary finish warning is cleared at the same time.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.5',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Review + client delivery',
        description: 'Amanda reviews the Better scenario one last time — client, scenario, validations cleared, line items one click away. She approves: Strata generates the Excel breakdown and the MBI-branded client summary PDF, logs a version in SharePoint, and surfaces the delivery output. She sends it to Enterprise Holdings with one click. Total time: 4 minutes, down from 1 week.',
        app: 'mbi-budget',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Accounting AI (Phase 2)
    // Kathy Belleville (Controller · Phase 1 Pilot) · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'Morning queue — 12 invoices pre-processed',
        description: 'Kathy, MBI controller, opens Strata. Overnight, Document AI read every vendor invoice, extracted fields with 90%+ OCR confidence, matched to open POs in CORE, and flagged 2 exceptions. What used to be a 4-hour morning is now a focused review of what only Kathy can decide.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'HealthTrust exception — 3% royalty',
        description: 'Mercy hospital invoice hits the HealthTrust GPO contract. Strata auto-calculates the $1,872 royalty line and flags for approval. Kathy reviews the calculation, approves to post, overrides with a reason, or escalates to Lynda Alexander (Director of Healthcare) via Teams.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'Non-EDI reconciliation — line-by-line',
        description: 'Herman Miller doesn\'t ship EDI. Strata OCR\'d the paper invoice and compared it to PO-2026-0051 line-by-line. Kathy sees 2 flagged variances (Jarvis short-ship, oak veneer upcharge) — she accepts or overrides each with a reason. Every override trains the vendor-specific matcher.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'AR wrap-up — forecast + collection emails',
        description: 'Before logging off: AR Status Taxonomy shows every open account by state. Strata pre-drafted collection emails for the 3 escalated accounts using each client\'s tone history. Kathy reviews and sends. Live billing forecast replaces the bi-weekly Excel — leadership sees real-time numbers.',
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
    'm1.1': { mode: 'interactive', userAction: 'Watch the files process, preview if you want, then approve the intake' },
    'm1.2': { mode: 'interactive', userAction: 'Triage the 2 discrepancies: apply the inventory swap and reconcile the ceiling' },
    'm1.3': { mode: 'interactive', userAction: 'Pick Good / Better / Best and fine-tune the markup slider' },
    'm1.4': { mode: 'interactive', userAction: 'Review the $18K validation flag and accept the AI suggestion' },
    'm1.5': { mode: 'interactive', userAction: 'Approve the Better scenario and deliver the branded summary' },
    'm2.1': { mode: 'interactive', userAction: 'Review the overnight queue · 12 invoices pre-processed · 2 exceptions flagged' },
    'm2.2': { mode: 'interactive', userAction: 'Approve the 3% HealthTrust royalty · or override with a reason · or escalate to Lynda' },
    'm2.3': { mode: 'interactive', userAction: 'Reconcile the Herman Miller non-EDI invoice line-by-line' },
    'm2.4': { mode: 'interactive', userAction: 'Close the morning with AR review + collection emails · hand off to Quotes AI' },
    'm3.1': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE and the proposal auto-build' },
    'm4.1': { mode: 'interactive', userAction: 'Run Spec Check on Beth\'s ICU project and catch the finish issue' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm1.1': [
        'Receiving new Enterprise Holdings opportunity',
        'Streaming SIF export from CET',
        'Reading CAP worksheet',
        'Processing documents — schema + checksum',
        'Detecting path: Design-Assisted',
        'Awaiting reviewer approval',
    ],
    'm1.2': [
        'Parsing SIF schema — 24 fields extracted',
        'Matching contract: HNI Corporate (55% discount)',
        'Applying markup — 35% default',
        'Calculating freight (10% of net)',
        'Calculating install (12% non-union)',
        'Cross-checking CAP overrides vs SIF ceiling',
        'Searching inventory for cheaper equivalents',
        'Flagged: ceiling mismatch ($7,450) + inventory swap ($3,000 savings)',
    ],
    'm1.3': [
        'Composing scenario: Good (entry-tier swaps)',
        'Composing scenario: Better (recommended mid-range)',
        'Composing scenario: Best (premium finishes)',
        'Computing per-scenario pricing deltas vs Mid-Range',
        'Scenarios ready — awaiting pick + markup',
    ],
    'm1.4': [
        'Cross-checking SIF quantities against CET config',
        'Validating worksurface dimensions',
        'Detected anomaly: Allsteel Further 72×36 not compatible with panel system',
        'Estimating impact: $18,240',
        'AI confidence: 94%',
        'Suggesting swap: Allsteel Shape (compatible 72×36)',
    ],
    'm1.5': [
        'Applying final markup',
        'Generating Excel breakdown',
        'Rendering branded MBI client summary PDF',
        'Preparing send to Enterprise Holdings',
        'Version logged in SharePoint',
    ],
    'm2.1': [
        'Fetching overnight invoice queue — 12 vendor PDFs',
        'Document AI extracting fields · 90%+ OCR confidence',
        'Matching to open POs in CORE',
        'Applying HealthTrust exception logic',
        '10 invoices auto-posted · 2 exceptions surfaced for Kathy',
    ],
    'm2.2': [
        'Detected HealthTrust GPO member: Mercy hospital',
        'Computing 3% royalty on $62,400 subtotal',
        'Staging royalty line as separate GL entry',
        'Awaiting Kathy approval before posting to GPO payable',
    ],
    'm2.3': [
        'Herman Miller flagged as non-EDI · OCR fallback',
        'Matching invoice to PO-2026-0051 line-by-line',
        'Detected 2 variances: Jarvis qty 5/6, oak veneer $95 vs $85',
        'Training matcher from Kathy\'s decisions',
    ],
    'm2.4': [
        'Generating AR aging report (live, not bi-weekly)',
        'Drafting collection emails by account tone + history',
        'Updating leadership billing forecast in real-time',
        'Morning complete · 18 min vs 4h before',
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
    'm1.1', 'm1.2', 'm1.3', 'm1.4', 'm1.5',
    'm2.1', 'm2.2', 'm2.3', 'm2.4',
    'm3.1',
    'm4.1',
];
