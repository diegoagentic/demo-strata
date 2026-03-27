// ═══════════════════════════════════════════════════════════════════════════════
// WR — Demo Profile (Restructured v5 2026-03-27)
// 9-step quoting process: AI automates intake → estimation & quote assembly
//
// Flow 1: Project Intake — Expert (David Park) + Designer (Alex Rivera)
//   w1.1: Email ingestion (auto) · w1.2: Mismatch detection (interactive)
//   w1.3: Designer field review (interactive) · w1.4: Scope registration (interactive)
//   w1.5: Design review (HITL)
//
// Flow 2: Labor Estimation & Quote Assembly — Expert + Designer + Dealer (Sara Chen)
//   w2.1: Cost calc + expert review (interactive)
//   w2.2: Designer verification (interactive — modules, comments, PDF preview)
//   w2.3: Expert confirmation + quote assembly (interactive — sub-phases)
//   w2.4: Proposal review, approval & release (HITL + ApprovalChainModal + release)
//
// Data: JPS Health Center for Women — 24 items, 185.04 man-hours, $202,138 proposal
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const WRG_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Project Intake
    // 1 auto + 3 interactive + 1 HITL = 5 steps
    // Expert + Designer
    // ═══════════════════════════════════════════
    {
        id: 'w1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Project Intake',
        title: 'Email Ingestion',
        description: 'A new quoting request from JPS Health Network arrives in the shared inbox. The AI agent detects it automatically, reads the attached PDF documents (floor plans, product specs, site requirements), and starts processing the request.',
        app: 'email-marketplace',
        role: 'Expert',
    },
    {
        id: 'w1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Project Intake',
        title: 'Mismatch Detection',
        description: 'The AI compares both design documents side by side — product codes, quantities, and categories. It finds discrepancies and flags items that don\'t match. The expert reviews these findings and sends the flagged items to the designer for clarification.',
        app: 'wrg-handoff',
        role: 'Expert',
    },
    {
        id: 'w1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Project Intake',
        title: 'Designer Field Review',
        description: 'The designer receives the flagged items from the expert. For each one, the designer checks the product specs, corrects quantities or configurations where needed, and sends the updated information back.',
        app: 'wrg-designer',
        role: 'Designer',
    },
    {
        id: 'w1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Project Intake',
        title: 'Scope Registration & Assignment',
        description: 'With the designer\'s corrections confirmed, the AI reads the project details — building type, number of floors, furniture brand (MillerKnoll), and facility category (healthcare). It registers the quote in CORE, creates the Smartsheet record, and assigns the best-fit estimator based on availability and location.',
        app: 'wrg-intake',
        role: 'Expert',
    },
    {
        id: 'w1.5',
        groupId: 0,
        groupTitle: 'Flow 1: Project Intake',
        title: 'Design Review',
        description: 'The designer reviews everything: facility details, product list, expert assignment, and the CORE registration. Once approved, this authorizes the estimation phase to begin — the project moves from intake to costing.',
        app: 'wrg-intake-review',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Labor Estimation & Quote Assembly
    // 3 interactive + 1 HITL = 4 steps
    // Expert + Designer + Dealer
    // ═══════════════════════════════════════════
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Labor Estimation & Quote Assembly',
        title: 'Cost Calculation & Expert Review',
        description: 'Five AI agents calculate delivery and installation costs for 24 items — applying rate cards ($57/hr), checking scope limits, and analyzing site conditions (hospital restricted hours). The expert reviews 5 flagged items, applies AI suggestions, and escalates 1 custom product (OFS Serpentine, 12-seat lounge) to the designer.',
        app: 'wrg-labor',
        role: 'Expert',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Labor Estimation & Quote Assembly',
        title: 'Designer Verification',
        description: 'The designer reviews the estimation report in 5 modules: cost summary, project scope, escalated item (OFS Serpentine), assembly verification, and applied rate ($798). Each module can be validated with a checkbox and commented. Preview the verification report as PDF before sending it back to the expert.',
        app: 'wrg-labor',
        role: 'Designer',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Labor Estimation & Quote Assembly',
        title: 'Expert Confirmation & Quote Assembly',
        description: 'The expert confirms all adjustments are resolved and the designer\'s verification is complete. Then the system retrieves the MillerKnoll product quote ($287,450), applies JPS contract pricing (38% discount → $178,219 net), adds labor margin ($17,685) and freight ($6,234), and assembles the complete $202,138 proposal. The expert selects which dealer will review and approve.',
        app: 'wrg-labor',
        role: 'Expert',
    },
    {
        id: 'w2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Labor Estimation & Quote Assembly',
        title: 'Proposal Review, Approval & Release',
        description: 'The dealer reviews the full $202,138 proposal — product ($178K), labor ($17.7K), freight ($6.2K) — with delivery timeline (8-10 weeks standard, 12 weeks custom). Can add observations per section and request expert clarification. After previewing the quote as PDF and approving the 4-person approval chain, the proposal is generated and released to JPS Health Network with confirmation to all stakeholders.',
        app: 'wrg-review',
        role: 'Dealer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WRG_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: Project Intake
    'w1.1': { mode: 'auto', duration: 14, aiSummary: 'New quoting request from JPS Health Network detected — processing 3 PDF attachments' },
    'w1.2': { mode: 'interactive', userAction: 'Review mismatches found by AI, then click "Send to Designer" for the items that need clarification' },
    'w1.3': { mode: 'interactive', userAction: 'Check each flagged item, correct the specs or quantities, then submit your responses back to the expert' },
    'w1.4': { mode: 'interactive', userAction: 'Review the project details extracted by AI and assign an estimator to the project' },
    'w1.5': { mode: 'interactive', userAction: 'Review the complete intake summary — confirm everything looks correct and click "Approve & Send to Expert"' },
    // Flow 2: Labor Estimation & Quote Assembly
    'w2.1': { mode: 'interactive', userAction: 'Start the estimation agents, review the 5 flagged items, apply AI suggestions, then send the OFS Serpentine to the designer for verification' },
    'w2.2': { mode: 'interactive', userAction: 'Validate each of the 5 modules (checkbox), add comments if needed, preview the PDF report, then send back to expert' },
    'w2.3': { mode: 'interactive', userAction: 'Confirm all adjustments, watch the quote assembly ($287,450 product + pricing waterfall = $202,138 total), then select a dealer and send the proposal' },
    'w2.4': { mode: 'interactive', userAction: 'Review the $202,138 proposal, add observations, request expert clarification if needed, preview the quote PDF, then approve and release to JPS Health Network' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WRG_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    // Flow 1: Project Intake
    'w1.1': [
        'New quoting request from JPS Health Network detected...',
        'Reading 3 PDF attachments — floor plans, specifications, site requirements',
        'Processing request — healthcare facility, MillerKnoll products',
    ],
    'w1.2': [
        'Comparing Spec Narrative vs Selection Document line by line...',
        'Discrepancies found — quantities don\'t match in 4 items',
        'Custom and discontinued products flagged for review',
        'Room assignments verified across all 3 floors',
    ],
    'w1.3': [
        'Designer workspace loaded with 4 flagged items...',
        'Original spec vs selection values ready for comparison',
        'Tracking all corrections and overrides',
    ],
    'w1.4': [
        'Healthcare facility identified — extracting project scope...',
        'Quote request created in CORE — design brief linked',
        'Checking estimator availability and proximity...',
        'Best-fit estimator assigned — Design Team notified',
    ],
    'w1.5': [
        'Complete intake summary ready — facility, products, assignment',
        'Expert David Park assigned — CORE record registered',
        'Awaiting designer approval to start estimation phase',
    ],
    // Flow 2: Labor Estimation & Quote Assembly
    'w2.1': [
        'Checking 119 KD chairs against 50-chair scope limit...',
        'Calculating delivery costs — hospital site multipliers applied',
        'Calculating installation labor — 185 man-hours at $57/hr',
        'Merging delivery and installation totals',
        '5 flagged items ready for expert review — AI suggestions available',
    ],
    'w2.2': [
        'Checking connection hardware for 12-seat serpentine lounge...',
        'Standard brackets compatible — modular assembly confirmed',
        'Assembly time: 12 seats × 1.0 hr + 2.0 hrs alignment = 14.0 hrs',
    ],
    'w2.3': [
        'Designer verification complete — all 5 modules validated',
        'All expert adjustments resolved — estimate finalized at $15,378',
        'Retrieving MillerKnoll product quote — $287,450 list...',
        'Applying JPS contract — 38% discount → $178,219 net...',
        'Proposal assembled — $202,138 total (product + labor + freight)',
    ],
    'w2.4': [
        'Full proposal ready — $178K product + $17.7K labor + $6.2K freight',
        'Delivery: 8-10 weeks standard, 12 weeks custom OFS Serpentine',
        'Approval chain — David Park, Alex Rivera, Sara Chen, Jordan Park',
        'Quote generated and released to JPS Health Network',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const WRG_DEMO_SELF_INDICATED: string[] = [
    'w1.1', 'w1.2', 'w1.3', 'w1.4', 'w1.5',
    'w2.1', 'w2.2', 'w2.3', 'w2.4',
];

// ─── STEP TIMING ─────────────────────────────────────────────────────────────

export interface WrgStepTiming {
    notifDelay: number;     // ms before notification appears
    notifDuration: number;  // ms notification stays before processing
    agentStagger: number;   // ms between each agent appearing
    agentDone: number;      // ms after agent appears before checkmark
    breathing: number;      // ms pause between processing and revealed
    resultsDur: number;     // ms results shown before auto-advance (0 = manual)
}

export const WRG_STEP_TIMING: Record<string, WrgStepTiming> = {
    // Flow 1: Project Intake
    'w1.1': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800,  agentDone: 500, breathing: 1000, resultsDur: 2000 },
    'w1.2': { notifDelay: 1000, notifDuration: 5000, agentStagger: 900,  agentDone: 600, breathing: 1500, resultsDur: 0 },
    'w1.3': { notifDelay: 1000, notifDuration: 4000, agentStagger: 800,  agentDone: 500, breathing: 1200, resultsDur: 0 },
    'w1.4': { notifDelay: 1000, notifDuration: 4000, agentStagger: 800,  agentDone: 500, breathing: 1200, resultsDur: 0 },
    'w1.5': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },
    // Flow 2: Labor Estimation & Quote Assembly
    'w2.1': { notifDelay: 1000, notifDuration: 4000, agentStagger: 700,  agentDone: 500, breathing: 1000, resultsDur: 0 },
    'w2.2': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800,  agentDone: 500, breathing: 800,  resultsDur: 0 },
    'w2.3': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800,  agentDone: 500, breathing: 1200, resultsDur: 0 },
    'w2.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,    agentDone: 0,   breathing: 0,    resultsDur: 0 },
};
