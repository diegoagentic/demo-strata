// ═══════════════════════════════════════════════════════════════════════════════
// WRG — Demo Profile v6 (Opción F: Collaborative Single-Shell)
// 5-step collaborative quoting process on a single Strata Estimator Shell
//
// Step 0 (Origin Splash): how WRG used to build quotes (4 disconnected tools)
//   w0.1: Fullscreen animation → transitions into the Estimator
//
// Flow 2: Labor Estimation & Quote Assembly — 3 roles share the same Shell
//   w2.1: Estimation Active   · Expert   (David Park)
//   w2.2: Designer Escalation · Designer (Alex Rivera)
//   w2.3: Quote Assembly      · Expert   (David Park)
//   w2.4: Proposal Review     · Dealer   (Sara Chen)
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
    // STEP 0: Origin Splash — "The Old Way"
    // Fullscreen animation, no Shell yet
    // ═══════════════════════════════════════════
    {
        id: 'w0.1',
        groupId: 0,
        groupTitle: 'Origin: The Old Way',
        title: 'How WRG builds quotes today',
        description: 'Yesterday at WRG, building a $202K quote for JPS Health Network meant juggling 4 disconnected tools: email + CORE export + spec PDFs + Product Selection Sheet + Delivery Pricer. Eight hours of manual work, 85% of decisions without an audit trail. Strata Estimator replaces the 4 tools in the middle — CORE still receives the final file, but every calculation is now preserved.',
        app: 'wrg-origin',
        role: 'System',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Collaborative Estimation & Quote Assembly
    // Single Shell — 4 role handoffs
    // ═══════════════════════════════════════════
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Flow: Collaborative Estimation & Quote Assembly',
        title: 'Estimation — Expert kick-off',
        description: 'David (Expert) opens the Strata Estimator. The JPS dossier is pre-loaded from the CORE export. He imports the Bill of Materials (24 items), runs the financial hero, and reviews the 5 items the AI flagged. One item — the OFS Serpentine 12-seat lounge — is a custom product he escalates to the designer for verification.',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Flow: Collaborative Estimation & Quote Assembly',
        title: 'Designer verification',
        description: 'Alex (Designer) receives the handoff banner inside the same Estimator. Row 19 (OFS Serpentine) is focused, the rest of the BoM dims. Alex checks connection hardware, confirms modular assembly, and validates the 14-hour install estimate. She sends the verified module back to the expert.',
        app: 'wrg-estimator',
        role: 'Designer',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Flow: Collaborative Estimation & Quote Assembly',
        title: 'Quote assembly',
        description: 'David confirms the designer\'s verification. The pricing waterfall runs: MillerKnoll list $287,450 → JPS contract 38% discount → $178,219 net product + $17,685 labor + $6,234 freight = $202,138 proposal. He selects Sara as the reviewing dealer and sends the proposal for approval.',
        app: 'wrg-estimator',
        role: 'Expert',
    },
    {
        id: 'w2.4',
        groupId: 1,
        groupTitle: 'Flow: Collaborative Estimation & Quote Assembly',
        title: 'Proposal review & release',
        description: 'Sara (Dealer) opens the read-only proposal view. She reviews product / labor / freight sections, confirms the 4-person approval chain (David, Alex, Sara, Jordan), previews the PDF, and releases the $202,138 quote. CORE receives the final file — every calculation, every rate, every decision preserved with full audit trail.',
        app: 'wrg-estimator',
        role: 'Dealer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WRG_DEMO_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'w0.1': { mode: 'auto', duration: 10, aiSummary: 'The Old Way — 4 disconnected tools, 8 hours of manual work' },
    'w2.1': { mode: 'interactive', userAction: 'Import the BoM, review the 5 flagged items, and escalate the OFS Serpentine to the designer' },
    'w2.2': { mode: 'interactive', userAction: 'Validate the escalated module and send the verification back to the expert' },
    'w2.3': { mode: 'interactive', userAction: 'Confirm the adjustments, watch the pricing waterfall, and send the proposal to the dealer' },
    'w2.4': { mode: 'interactive', userAction: 'Review the $202,138 proposal, approve the chain, and release to JPS Health Network' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WRG_DEMO_STEP_MESSAGES: Record<string, string[]> = {
    'w0.1': [
        'Email with PDF specs arrives — estimator reads and forwards',
        'Estimator opens CORE manually, downloads scope files (PDF + CSV)',
        'Spec PDFs opened — hours of reading line by line',
        'Product Selection Sheet — map items to categories manually',
        'Delivery Pricer + Labor Worksheet — apply Mark\'s 100-year rates',
        '4 disconnected tools, 8 hours of work, 85% without audit trail',
    ],
    'w2.1': [
        'Loading JPS dossier from CORE export...',
        'Importing Bill of Materials — 24 items staggered in',
        'Calculating delivery and installation — 185 man-hours at $57/hr',
        '5 flagged items ready for expert review',
        'OFS Serpentine 12-seat lounge escalated to designer',
    ],
    'w2.2': [
        'Row 19 (OFS Serpentine) focused — rest of BoM dimmed',
        'Checking connection hardware for 12-seat serpentine lounge...',
        'Standard brackets compatible — modular assembly confirmed',
        'Assembly time: 12 seats × 1.0 hr + 2.0 hrs alignment = 14.0 hrs',
        'Verification ready — sending back to expert',
    ],
    'w2.3': [
        'Designer verification received — all adjustments resolved',
        'Retrieving MillerKnoll product quote — $287,450 list...',
        'Applying JPS contract — 38% discount → $178,219 net...',
        'Adding labor ($17,685) + freight ($6,234)...',
        'Proposal assembled — $202,138 total',
    ],
    'w2.4': [
        'Full proposal loaded — $178K product + $17.7K labor + $6.2K freight',
        'Delivery: 8-10 weeks standard, 12 weeks custom OFS Serpentine',
        'Approval chain — David Park, Alex Rivera, Sara Chen, Jordan Park',
        'Quote generated, CORE receives final file, JPS Health Network notified',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const WRG_DEMO_SELF_INDICATED: string[] = [
    'w0.1',
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
    'w0.1': { notifDelay: 0,    notifDuration: 0,    agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },
    'w2.1': { notifDelay: 1000, notifDuration: 4000, agentStagger: 700, agentDone: 500, breathing: 1000, resultsDur: 0 },
    'w2.2': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800, agentDone: 500, breathing: 800,  resultsDur: 0 },
    'w2.3': { notifDelay: 1000, notifDuration: 3000, agentStagger: 800, agentDone: 500, breathing: 1200, resultsDur: 0 },
    'w2.4': { notifDelay: 2000, notifDuration: 5000, agentStagger: 0,   agentDone: 0,   breathing: 0,    resultsDur: 0 },
};
