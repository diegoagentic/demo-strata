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
// FLOW 2 — Accounting AI (Phase 2, Controller) · 4 scenes / 4 beats
//   m2.1: Morning queue — overnight processing surfaces only the exceptions
//   m2.2: HealthTrust exception — GPO royalty · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR wrap-up — taxonomy + collection emails + handoff to Flow 3
//
// FLOW 3 — Quotes AI (Phase 4, PM bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from the Account Manager → PM queue
//   m3.2: SIF → CORE auto-import — field-for-field, zero keystrokes
//   m3.3: AI validation — audit loops collapse into 1 AI + 1 human review
//   m3.4: Send proposal + handoff to Flow 4 (Design AI, upstream)
//
// FLOW 4 — Design AI (Phase 4, early-adopter Designer) · 3 scenes / 3 beats
//   m4.1: Pick project — Designer selects an ICU project · Phase 1 Pilot context
//   m4.2: Spec Check scan — four AI checks across the BOM
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
    // Account Manager · 5 beats
    // ═══════════════════════════════════════════
    {
        id: 'm1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Intake — Design-Assisted path',
        description: 'The Account Manager opens a new corporate-renovation opportunity and drops in the SIF export from CET plus the CAP worksheet from the design team. Strata processes each file as it lands and offers preview, replace and add controls — but waits for an explicit approval before any parsing happens. Nothing moves forward without a human green light.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI parsing + triage',
        description: 'Strata parses the SIF, applies the matched contract discount, computes freight and install, and runs the pre-flight checks. Two items surface for the Account Manager to triage before scenarios are built — a ceiling mismatch between SIF and CAP, plus an inventory swap suggestion. Each is decided inline and the run continues.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Pick a scenario — Good / Better / Best',
        description: 'Strata composes three scenarios — Good, Better, Best — with product swaps and clear pricing deltas vs the mid-range. The Account Manager compares them side by side, fine-tunes the markup with a slider, and pulls up the live pricing breakdown on demand. What used to be a week-long exercise becomes a single decision.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'AI validation — catch before send',
        description: 'Before the budget goes out, Strata flags an incompatibility between the worksurface size in the SIF and the panel system — exactly the class of error that historically slipped through and cost the deal. The Account Manager accepts the swap suggestion inline and a secondary finish warning resolves alongside it.',
        app: 'mbi-budget',
        role: 'Dealer',
    },
    {
        id: 'm1.5',
        groupId: 0,
        groupTitle: 'Flow 1: Budget Builder Prototype',
        title: 'Review + client delivery',
        description: 'The Account Manager reviews the chosen scenario one last time — client, scenario, validations cleared, line items one click away. On approval, Strata generates the Excel breakdown and the branded client summary, versions it in SharePoint, and surfaces the deliverables. One click sends it to the client.',
        app: 'mbi-budget',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Accounting AI (Phase 2)
    // Controller · Phase 1 Pilot · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'Morning queue — overnight processing complete',
        description: 'The Controller opens Strata to find the overnight queue already processed: Document AI read every vendor invoice, matched the lines to open POs in CORE, and pre-routed everything that was clean. What lands on the desk is a focused review of the exceptions only a human can decide.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'HealthTrust exception — GPO royalty',
        description: 'A hospital invoice hits the HealthTrust GPO contract. Strata recognizes the membership, calculates the royalty line, and stages it as a separate GL entry. The Controller reviews the calculation, then approves to post, overrides with a reason, or escalates to the Director of Healthcare via Teams.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'Non-EDI reconciliation — line-by-line',
        description: 'A non-EDI vendor sends a paper invoice. Strata OCRs it and compares it line-by-line to the matching PO. The Controller sees the flagged variances surfaced inline — a short-shipped item and a finish upcharge — and resolves each with an accept or an override and reason. Every override trains the vendor-specific matcher.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Accounting AI',
        title: 'AR wrap-up — forecast + collection emails',
        description: 'Before logging off: AR Status Taxonomy shows every open account by state. Strata has pre-drafted collection emails for the escalated accounts using each client\'s tone history. The Controller reviews and sends. The live billing forecast replaces the bi-weekly Excel — leadership reads real-time numbers.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Quotes AI (Phase 4)
    // Project Manager · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm3.1',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Incoming budget · handoff from the Account Manager',
        description: "The signed budget from the Account Manager lands in the Project Manager's queue. All four readiness checks pass — budget confirmed, contract identified, scope locked, design sign-off. For the first time the PM picks up a quote-ready project instead of chasing missing context across teams.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.2',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'SIF → CORE auto-import',
        description: "The single largest bottleneck — manually re-entering the SIF into CORE — disappears. Strata auto-imports the structured data field-for-field. Zero keystrokes, zero typos. The PM team shifts from builders to reviewers.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.3',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'AI validation · audit loops collapse',
        description: "Spec Check runs against the assembled BOM. The four sequential audit loops the team used to run by eye — internal, vendor, manager, client — collapse into one AI pass plus one human review. Non-catalog items get cross-checked against manufacturer price books and the COM fabric workflow is formalized so spec gaps stop slipping through.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.4',
        groupId: 2,
        groupTitle: 'Flow 3: Quotes AI',
        title: 'Send proposal · route orders',
        description: "One human review later, the PM sends the proposal. Orders auto-route: EDI manufacturers receive transmissions instantly, non-EDI vendors get drafted PO emails ready to send, and Compass reconciliation queues for the manufacturers that require it. Hours of manual routing happen in minutes.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // ═══════════════════════════════════════════
    // FLOW 4: Design AI (Phase 4)
    // Designer · early-adopter pilot · 3 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm4.1',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Pick project · pilot run',
        description: "The design team's AI trust is the lowest in the company, so the rollout starts with a single early-adopter Designer running Spec Check on one of her own projects — a hospital ICU expansion with a locked palette. The visible win on this run is what unlocks team-wide adoption.",
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.2',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Spec check scan · four AI checks',
        description: 'Strata runs four AI checks against the BOM in sequence: dimensions match the CET footprint, finish consistency across upholstery and laminate, palette match against the project palette, and vendor availability against the install date. The full pass finishes faster than the team\'s manual line-by-line review — and catches what the eye misses.',
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.3',
        groupId: 3,
        groupTitle: 'Flow 4: Design AI',
        title: 'Findings review · "all blue except this"',
        description: 'One finding surfaces: a chair finish lands outside the project palette — exactly the class of mistake that historically reaches the client first ("everything is blue, this one is green"). The Designer accepts the AI-suggested swap in one click. Caught before delivery. The proof point unlocks team-wide rollout.',
        app: 'mbi-design',
        role: 'Designer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm1.1': { mode: 'interactive', userAction: 'Watch the files process, preview if you want, then approve the intake' },
    'm1.2': { mode: 'interactive', userAction: 'Triage the surfaced discrepancies · apply the inventory swap · reconcile the ceiling' },
    'm1.3': { mode: 'interactive', userAction: 'Pick Good / Better / Best and fine-tune the markup slider' },
    'm1.4': { mode: 'interactive', userAction: 'Review the validation flag and accept the AI swap suggestion' },
    'm1.5': { mode: 'interactive', userAction: 'Approve the chosen scenario and deliver the branded summary' },
    'm2.1': { mode: 'interactive', userAction: 'Review the overnight queue · pre-processed invoices ready · exceptions flagged for human decision' },
    'm2.2': { mode: 'interactive', userAction: 'Approve the GPO royalty · override with a reason · or escalate to the Director of Healthcare' },
    'm2.3': { mode: 'interactive', userAction: 'Reconcile the non-EDI invoice line-by-line · accept or override each variance' },
    'm2.4': { mode: 'interactive', userAction: 'Close the morning with AR review + collection emails · hand off to Quotes AI' },
    'm3.1': { mode: 'interactive', userAction: 'Review the signed budget handoff from the Account Manager · verify the readiness checks' },
    'm3.2': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE · field-for-field · zero keystrokes' },
    'm3.3': { mode: 'interactive', userAction: 'Review Spec Check · audit loops collapse into one AI pass plus one human review' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers' },
    'm4.1': { mode: 'interactive', userAction: 'Confirm the early-adopter Designer as Phase 1 Pilot · select the ICU project for the spec scan' },
    'm4.2': { mode: 'interactive', userAction: 'Run Spec Check · watch the four AI checks run against the BOM' },
    'm4.3': { mode: 'interactive', userAction: 'Review the palette finding · accept the AI swap · close the demo arc' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm1.1': [
        'Receiving the new corporate-renovation opportunity',
        'Streaming the SIF export from CET',
        'Reading the CAP worksheet',
        'Processing documents · schema + checksum',
        'Detecting path · Design-Assisted',
        'Awaiting reviewer approval',
    ],
    'm1.2': [
        'Parsing the SIF schema',
        'Matching the contract and applying its discount',
        'Applying default markup',
        'Calculating freight',
        'Calculating install',
        'Cross-checking CAP overrides against the SIF ceiling',
        'Searching inventory for cheaper equivalents',
        'Surfacing items for review · ceiling mismatch + inventory swap',
    ],
    'm1.3': [
        'Composing scenario · Good (entry-tier swaps)',
        'Composing scenario · Better (recommended mid-range)',
        'Composing scenario · Best (premium finishes)',
        'Computing pricing deltas across scenarios',
        'Scenarios ready · awaiting pick + markup',
    ],
    'm1.4': [
        'Cross-checking SIF quantities against the CET config',
        'Validating worksurface dimensions',
        'Detected incompatibility · worksurface size vs panel system',
        'Suggesting an in-system swap that resolves the conflict',
    ],
    'm1.5': [
        'Applying the final markup',
        'Generating the Excel breakdown',
        'Rendering the branded client summary',
        'Preparing the send to the client',
        'Version logged in SharePoint',
    ],
    'm2.1': [
        'Fetching overnight invoice queue',
        'Document AI extracting fields from each vendor invoice',
        'Matching invoice lines to open POs in CORE',
        'Applying HealthTrust exception logic',
        'Clean invoices auto-posted · exceptions surfaced for human review',
    ],
    'm2.2': [
        'Detected HealthTrust GPO member on this invoice',
        'Computing GPO royalty against the invoice subtotal',
        'Staging royalty line as a separate GL entry',
        'Awaiting Controller approval before posting to GPO payable',
    ],
    'm2.3': [
        'Vendor flagged as non-EDI · falling back to OCR',
        'Matching invoice to its source PO line-by-line',
        'Surfacing variances inline · short-shipped item + finish upcharge',
        'Training the vendor-specific matcher from each decision',
    ],
    'm2.4': [
        'Generating AR aging report (live, not bi-weekly)',
        'Drafting collection emails by account tone + history',
        'Updating leadership billing forecast in real-time',
        'Morning complete · ready for handoff to Quotes AI',
    ],
    'm3.1': [
        'Signed budget received from the Account Manager',
        'Checking readiness gate · budget, contract, scope, design sign-off',
        'All checks green · routing to the PM queue',
        'Project Manager picks it up · bottleneck avoided',
    ],
    'm3.2': [
        'Reading the signed SIF · structured fields detected',
        'Applying the matched contract discount',
        'Freight + install recalculated (no manual touching)',
        'Building the CORE proposal draft',
        'Auto-import complete · zero keystrokes',
    ],
    'm3.3': [
        'Running Spec Check — dimensions, finish, palette, availability',
        'Cross-checking non-catalog items vs manufacturer price books',
        'COM workflow · fabric approvals traced',
        'Audit loops collapsed into one AI pass + one human review',
    ],
    'm3.4': [
        'Project Manager signed off · proposal ready to send',
        'Transmitting EDI to manufacturers that support it',
        'Drafting non-EDI POs for the rest',
        'Compass reconciliation queued where required',
        'Account Manager pinged · handoff complete',
    ],
    'm4.1': [
        'Loading the Designer\'s active projects',
        'ICU Expansion flagged as ready for Spec Check',
        'Project palette locked · BOM ready to scan',
        'Phase 1 Pilot mode · single early-adopter for now',
    ],
    'm4.2': [
        'Running AI check 1 · dimensions match the CET footprint',
        'Running AI check 2 · finish consistency across upholstery + laminate',
        'Running AI check 3 · palette match against the project palette',
        'Running AI check 4 · vendor availability against the install date',
        'Most checks clean · one finding to review',
    ],
    'm4.3': [
        'Finding · a chair finish lands outside the project palette',
        'Suggesting an in-palette swap',
        'Designer accepts · BOM palette fully clean',
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
