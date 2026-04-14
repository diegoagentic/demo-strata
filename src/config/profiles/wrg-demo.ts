// ═══════════════════════════════════════════════════════════════════════════════
// WRG — Demo Profile v7 (2-Flow Restructure)
// 5-step collaborative quoting process on a single Strata Estimator Shell
//
// FLOW 1 — AI Labor Estimation (Expert + Designer)
//   w1.1: Expert kickoff · David reviews the AI draft + escalates custom item
//   w1.2: Designer verification · Alex validates the escalated module
//
// FLOW 2 — Proposal Generation (Expert + Dealer + Salesperson)
//   w2.1: Quote assembly · David runs the pricing waterfall + picks the dealer
//   w2.2: Dealer review & release · Sara approves the 4-person chain
//   w2.3: Representative handoff · Riley assembles the PDF + sends to the client rep
//
// The origin splash (w0.1 "The Old Way") was removed in this version.
// Demo now opens directly on Flow 1 w1.1.
//
// CORE constraint: CORE is EXPORT-ONLY. Strata reads files exported from CORE,
// never syncs or integrates directly. See docs/wrg-demo/requirements/CORE_INTEGRATION_CONSTRAINT.md
//
// Data: JPS Health Center for Women — 24 items, 185.04 man-hours, $202,138 proposal
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const WRG_DEMO_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: AI Labor Estimation
    // Expert + Designer · 2 steps
    // ═══════════════════════════════════════════
    {
        id: 'w1.1',
        groupId: 0,
        groupTitle: 'Flow 1: AI Labor Estimation',
        title: 'Expert kickoff',
        description: 'David (Expert) opens the Strata Estimator. The JPS dossier pre-loads from the CORE export, the AI agent extracts 24 line items from the spec PDFs, maps them to labor categories (21 template, 3 fallback), flags a scope breach on the 119 KD chairs, and produces the dual-engine draft. David reviews the 5 flagged items — one custom product, the OFS Serpentine 12-seat lounge, gets escalated to the designer.',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w1.2',
        groupId: 0,
        groupTitle: 'Flow 1: AI Labor Estimation',
        title: 'Designer verification',
        description: 'Alex (Designer) receives the escalation inside the same Estimator. The overlay shows the provenance ("From David Park · 5s ago · custom product · designer verification recommended"). Row 19 is focused, the rest of the BoM dims. Alex checks connection hardware, confirms modular assembly, and validates the 14-hour install estimate across the 5 verification modules.',
        app: 'wrg-estimator',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Proposal Generation
    // Expert + Dealer + Salesperson · 3 steps
    // ═══════════════════════════════════════════
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Proposal Generation',
        title: 'Quote assembly',
        description: 'David confirms the verification log and runs the pricing waterfall: MillerKnoll list $287,450 → JPS contract 38% discount → $178,219 net product + $17,685 labor + $6,234 freight = $202,138 proposal. Picks the dealer (Sara, Jordan or Michael) and sends the full proposal for dealer approval.',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Proposal Generation',
        title: 'Dealer review & release',
        description: 'Sara (Dealer) opens the read-only proposal view. She reviews product / labor / freight sections, previews the PDF, and triggers the 4-person approval chain (David, Alex, Sara, Jordan — auto-signs ~800 ms apart). Once complete, the release animation plays and the proposal is marked as approved inside Strata.',
        app: 'wrg-estimator',
        role: 'Dealer',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Proposal Generation',
        title: 'Representative handoff',
        description: 'Riley (Sales Coordinator) picks up the approved proposal. A new email notification arrives from CORE with the full internal breakdown. Riley opens the representative-facing PDF preview (JPS branding, no internal cost fields), reviews the cover letter + line-item summary + delivery schedule, and sends the proposal to JPS Health Network\'s client representative. Strata tracks the handoff status end-to-end.',
        app: 'wrg-estimator',
        role: 'Sales Coordinator',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WRG_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'w1.1': { mode: 'interactive', userAction: 'Watch the AI draft land, review the 5 flagged items, and escalate the OFS Serpentine to the designer' },
    'w1.2': { mode: 'interactive', userAction: 'Validate the 5 verification modules and send the approved module back to the expert' },
    'w2.1': { mode: 'interactive', userAction: 'Watch the pricing waterfall, pick the dealer, and send the proposal for review' },
    'w2.2': { mode: 'interactive', userAction: 'Review the $202,138 proposal, approve the chain, and release it into Strata' },
    'w2.3': { mode: 'interactive', userAction: 'Review the representative-facing PDF and hand the proposal off to JPS\'s client representative' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WRG_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    'w1.1': [
        'Loading JPS dossier from CORE export...',
        'Importing Bill of Materials — 24 items staggered in',
        'Mapping products to labor categories · 21 template / 3 fallback',
        'Scope override applied · 119 KD chairs > 50 limit',
        'Dual-engine calculation · installation + delivery',
        'Draft produced · OFS Serpentine flagged for designer',
    ],
    'w1.2': [
        'Row 19 (OFS Serpentine) focused — rest of BoM dimmed',
        'Checking connection hardware for 12-seat serpentine lounge...',
        'Standard brackets compatible — modular assembly confirmed',
        'Assembly time: 12 seats × 1.0 hr + 2.0 hrs alignment = 14.0 hrs',
        'Verification ready — sending back to expert',
    ],
    'w2.1': [
        'Verification log received — all 5 modules approved',
        'Retrieving MillerKnoll product quote — $287,450 list...',
        'Applying JPS contract — 38% discount → $178,219 net...',
        'Adding labor ($17,685) + freight ($6,234)...',
        'Proposal assembled — $202,138 total · selecting dealer...',
    ],
    'w2.2': [
        'Full proposal loaded — $178K product + $17.7K labor + $6.2K freight',
        'Approval chain — David Park, Alex Rivera, Sara Chen, Jordan Park',
        'Chain complete · proposal approved for representative handoff',
    ],
    'w2.3': [
        'Approved proposal routed from CORE · notifying Sales',
        'Generating representative-facing PDF · JPS branding, cover letter, summary',
        'Preview ready · awaiting Sales Coordinator review',
        'Proposal sent to JPS Health Network\'s representative · handoff tracked',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const WRG_DEMO_SELF_INDICATED: string[] = [
    'w1.1', 'w1.2',
    'w2.1', 'w2.2', 'w2.3',
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
    'w1.1': { notifDelay: 1000, notifDuration: 4000, agentStagger: 700, agentDone: 500, breathing: 1000, resultsDur: 0 },
    'w1.2': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800, agentDone: 500, breathing: 800,  resultsDur: 0 },
    'w2.1': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'w2.2': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },
    'w2.3': { notifDelay: 1000, notifDuration: 3000, agentStagger: 0,   agentDone: 0,   breathing: 800,  resultsDur: 0 },
};
