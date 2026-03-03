// ─── Step behavior metadata ───────────────────────────────────────────────────
// Defines whether each step is AI-driven (auto) or requires user interaction.
// This data is consumed by DemoSidebar and DemoAIIndicator.

export interface StepBehavior {
    mode: 'auto' | 'interactive';
    duration?: number;     // approximate seconds for auto steps
    aiSummary?: string;    // what AI is doing (auto steps)
    userAction?: string;   // what user should do (interactive steps)
}

export const STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: RFQ to PO Processing
    '1.1':  { mode: 'auto', duration: 25, aiSummary: 'Ingesting dealer email — extracting RFQ attachments' },
    '1.2':  { mode: 'auto', duration: 20, aiSummary: 'AI agents parsed and extracted 200 line items' },
    '1.3':  { mode: 'interactive', userAction: 'Click "Continue to Quote Draft" when ready' },
    '1.4':  { mode: 'interactive', userAction: 'Click "Route to Expert Hub" to escalate' },
    '1.5':  { mode: 'interactive', userAction: 'Review AI corrections, then click "Approve & Create Quote"' },
    '1.6':  { mode: 'auto', duration: 14, aiSummary: 'Policy engine and approval chain running automatically' },
    '1.7':  { mode: 'interactive', userAction: 'Review quote details, then click "Approve Quote"' },
    '1.8':  { mode: 'auto', duration: 37, aiSummary: 'Generating PO and running automated order approval chain' },
    '1.9':  { mode: 'interactive', userAction: 'Review PO notification on mobile, tap "Acknowledge"' },
    '1.10': { mode: 'interactive', userAction: 'Review smart notifications' },
    '1.11': { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    // Flow 2: PO & Acknowledgement Comparison
    '2.1':  { mode: 'auto', duration: 10, aiSummary: 'Two Acknowledgements arriving in pipeline — AIS and HAT' },
    '2.2':  { mode: 'auto', duration: 20, aiSummary: 'Normalizing Acknowledgement data and running smart comparison' },
    '2.3':  { mode: 'interactive', userAction: 'Review delta results, click "Accept and Send to Client"' },
    '2.4':  { mode: 'interactive', userAction: 'Review AI corrections and edit flagged line items, then click "Accept and Send to Client"' },
    '2.5':  { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    '2.6':  { mode: 'interactive', userAction: 'Review notification digests' },
    // Flow 3: Punch List / Warranty Claims
    '3.1':  { mode: 'interactive', userAction: 'Review AI validation checklist, resolve flagged items, click "Validate & Continue"' },
    '3.2':  { mode: 'interactive', userAction: 'Review labor quote and business rules, approve or edit, click "Approve & Submit"' },
    '3.3':  { mode: 'auto', duration: 18, aiSummary: 'Assembling claim, forwarding evidence, tracking shipment' },
    '3.4':  { mode: 'interactive', userAction: 'Review punch list report on mobile, leave comments, then acknowledge' },
};

// ─── Component ────────────────────────────────────────────────────────────────
// Replaced by DemoAIIndicator — an inline, non-overlapping indicator rendered
// inside the main content area. This component now returns null to avoid
// the fixed-position overlay that caused visual overlap issues.

export default function DemoStepBanner() {
    return null;
}
