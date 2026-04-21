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
// FLOW 3 — Quotes AI (Phase 4, PC bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from Amanda → PC queue
//   m3.2: SIF → CORE auto-import — 24 fields, zero keystrokes
//   m3.3: AI validation — 4 audit loops → 1 AI + 1 human review
//   m3.4: Send proposal + handoff to Flow 4 (Design AI, upstream)
//
// FLOW 4 — Design AI (Phase 4, Beth Gianino early adopter) · 3 scenes / 3 beats
//   m4.1: Pick project — Beth selects BJC ICU · Phase 1 Pilot context
//   m4.2: Spec Check scan — 4 AI checks, 47 items, under 5 min
//   m4.3: Findings review + demo recap — one swap catches "all blue except this"
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
    // Marcia Ludwig (Director of PM) + 3.5 PCs for 29 staff · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm3.1',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Incoming budget · handoff from Amanda',
        description: "The Enterprise Holdings budget Amanda approved last week lands in the PC team's queue. All 4 readiness checks pass: budget confirmed, contract identified, scope locked, design sign-off. For the first time, a PC can pick up a quote-ready project instead of chasing missing context.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.2',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'SIF → CORE auto-import',
        description: "Instead of a PC manually re-entering 24 SIF fields into CORE (the largest bottleneck at MBI — 2 hours per proposal), Strata auto-imports the structured data in under 90 seconds. Zero keystrokes, zero typos. The PC team shifts from builders to reviewers.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.3',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'AI validation · audit loops collapse',
        description: "MBI's Q10 #1 priority (9.08/10): Spec Check. Today PCs run 4 sequential audit loops by eye — internal, vendor, manager, client. Strata collapses those into 1 AI pass + 1 human review. Non-catalog items cross-checked against manufacturer price books, COM fabric workflow formalized, no spec gaps slip through.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.4',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Send proposal · route orders',
        description: "One human review later, the PC sends the proposal. Orders auto-route: 5 EDI manufacturers get transmitted instantly, 2 non-EDI get PO emails drafted and sent. Compass reconciliation queued for the 4 manufacturers that require it. 2 hours of PC work → 12 minutes.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // ═══════════════════════════════════════════
    // FLOW 4: Design AI (Phase 4)
    // Beth Gianino (early adopter · Phase 1 Pilot · Q4 8/10) · 3 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm4.1',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Pick project · Beth\'s pilot',
        description: "Design team's Q4 AI trust averages 3.3/10 — lowest in company. Rogers Diffusion says don't deploy to the 1-out-of-10 first. Beth Gianino (8/10 trust, early adopter) picks her BJC ICU project with 47 line items and Marine Blue palette. She pilots Spec Check alone · a visible win unlocks team-wide rollout.",
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.2',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Spec check scan · 4 AI checks',
        description: 'Strata runs 4 sequential AI checks across the 47 BOM items: dimensions (match CET footprint), finish (every upholstery + laminate), palette (Marine Blue project), availability (vendor lead times). Total scan time: under 5 minutes vs today\'s manual line-by-line review that still misses things.',
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.3',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Findings review · "all blue except this"',
        description: 'One finding: Line 23 HON Ignition chair is Forest Green — outside the Marine Blue project palette. Exactly the class of mistake that cost MBI before ("everything is blue, this one chair is green"). Beth accepts the AI swap to Onyx Black in one click. Caught before the client sees it. Proof point unlocked · demo arc closes.',
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
    'm3.1': { mode: 'interactive', userAction: "Review the signed budget handoff from Amanda · verify the 4 readiness checks" },
    'm3.2': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE · 24 fields, 87 seconds, zero keystrokes' },
    'm3.3': { mode: 'interactive', userAction: 'Review Spec Check · audit loops collapse from 4 to 1+1' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers' },
    'm4.1': { mode: 'interactive', userAction: "Confirm Beth as Phase 1 Pilot · select BJC ICU project · 47 items, Marine Blue palette" },
    'm4.2': { mode: 'interactive', userAction: 'Run Spec Check · watch 4 AI checks run against the 47-item BOM' },
    'm4.3': { mode: 'interactive', userAction: 'Review the palette finding on Line 23 · accept swap · close the demo arc' },
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
        'Enterprise Holdings budget signed by client',
        'Checking readiness gate · budget, contract, scope, design sign-off',
        'All 4 checks green · routing to Marcia\'s PC queue',
        'Amy Behl picks it up · bottleneck avoided',
    ],
    'm3.2': [
        'Reading signed SIF v5 · 24 structured fields',
        'Applying HNI Corporate contract discount (55%)',
        'Freight + install recalculated (no manual touching)',
        'Building CORE proposal draft PROP-2026-003',
        'Zero keystrokes · 87 seconds · 2h saved',
    ],
    'm3.3': [
        'Running Spec Check — dimensions, finish, palette, availability',
        'Cross-checking non-catalog items vs manufacturer price books',
        'COM workflow: 5 fabric approvals traced',
        'Audit loops collapsed: 4 → 1 AI + 1 PC review',
    ],
    'm3.4': [
        'PC signed off · proposal ready to send',
        'Transmitting EDI to 5 manufacturers',
        'Drafting non-EDI POs for Gunlocke + HBF',
        'Compass reconciliation queued for 4 mfrs',
        'Amanda pinged · handoff complete',
    ],
    'm4.1': [
        'Loading Beth\'s active design projects',
        'BJC ICU Expansion flagged as ready for Spec Check',
        '47 line items · Marine Blue palette locked',
        'Phase 1 Pilot mode · Beth alone for now',
    ],
    'm4.2': [
        'Running AI check 1: Dimensions · matching CET footprint',
        'Running AI check 2: Finish consistency · upholstery + laminate + powder-coat',
        'Running AI check 3: Palette match · Marine Blue 5-color set',
        'Running AI check 4: Vendor availability · lead times vs install date',
        '3 of 4 checks clean · 1 finding on Line 23',
    ],
    'm4.3': [
        'Finding: HON Ignition chair finish Forest Green',
        'Project palette is Marine Blue · no green',
        'Suggesting swap to Onyx Black (palette match)',
        'Beth accepts · BOM palette 100% clean',
        'Proof point logged · ready for team rollout',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm1.1', 'm1.2', 'm1.3', 'm1.4', 'm1.5',
    'm2.1', 'm2.2', 'm2.3', 'm2.4',
    'm3.1', 'm3.2', 'm3.3', 'm3.4',
    'm4.1', 'm4.2', 'm4.3',
];
