import { useEffect, useState, useRef } from 'react';
import { Loader2, MousePointerClick, Sparkles } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

// ─── Step behavior metadata ───────────────────────────────────────────────────
// Defines whether each step is AI-driven (auto) or requires user interaction.

export interface StepBehavior {
    mode: 'auto' | 'interactive';
    duration?: number;     // approximate seconds for auto steps
    aiSummary?: string;    // what AI is doing (auto steps)
    userAction?: string;   // what user should do (interactive steps)
}

export const STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Flow 1: RFQ to PO Processing
    '1.1':  { mode: 'auto', duration: 25, aiSummary: 'Ingesting dealer email — extracting RFQ attachments' },
    '1.2':  { mode: 'auto', duration: 15, aiSummary: 'AI agents parsed and extracted 200 line items' },
    '1.3':  { mode: 'interactive', userAction: 'Click "Continue to Quote Draft" when ready' },
    '1.4':  { mode: 'interactive', userAction: 'Click "Route to Expert Hub" to escalate' },
    '1.5':  { mode: 'interactive', userAction: 'Review AI corrections, then click "Approve & Create Quote"' },
    '1.6':  { mode: 'auto', duration: 9, aiSummary: 'Policy engine and approval chain running automatically' },
    '1.7':  { mode: 'interactive', userAction: 'Review quote details, then click "Approve Quote"' },
    '1.8':  { mode: 'auto', duration: 22, aiSummary: 'Generating PO and running automated order approval chain' },
    '1.9':  { mode: 'interactive', userAction: 'Review smart notifications' },
    '1.10': { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    // Flow 2: PO & ACK Comparison
    '2.1':  { mode: 'auto', duration: 6, aiSummary: 'Two ACKs arriving in pipeline — AIS and HAT' },
    '2.2':  { mode: 'auto', duration: 14, aiSummary: 'Normalizing ACK data and running smart comparison' },
    '2.3':  { mode: 'interactive', userAction: 'Review delta results, click "Generate Backorder"' },
    '2.4':  { mode: 'auto', duration: 8, aiSummary: 'Expert reviewing 50 line items with AI corrections' },
    '2.5':  { mode: 'auto', duration: 18, aiSummary: 'Creating backorder and running 3-approver chain' },
    '2.6':  { mode: 'interactive', userAction: 'Review pipeline resolution, click "Send Notifications"' },
    '2.7':  { mode: 'interactive', userAction: 'Review notification digests' },
    // Flow 3: Punch List
    '3.1':  { mode: 'interactive', userAction: 'Watch AI classify document, then click "Route to 3-Way Match"' },
    '3.2':  { mode: 'interactive', userAction: 'Review 3-way match results' },
    '3.3':  { mode: 'interactive', userAction: 'Review shipment timeline' },
    '3.4':  { mode: 'interactive', userAction: 'Review service center plan' },
    '3.5':  { mode: 'interactive', userAction: 'Review warranty claim package' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoStepBanner() {
    const { currentStep, isDemoActive, isPaused, isSidebarCollapsed } = useDemo();
    const [elapsed, setElapsed] = useState(0);
    const [visible, setVisible] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();
    const isPausedRef = useRef(isPaused);

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    const behavior = STEP_BEHAVIOR[currentStep.id];

    // Animate in with slight delay so the page renders first
    useEffect(() => {
        if (!isDemoActive) { setVisible(false); return; }
        setElapsed(0);
        setVisible(false);
        const showTimer = setTimeout(() => setVisible(true), 400);
        return () => { clearTimeout(showTimer); setVisible(false); };
    }, [isDemoActive, currentStep.id]);

    // Progress timer for auto steps
    useEffect(() => {
        if (!isDemoActive || !behavior || behavior.mode !== 'auto' || !behavior.duration) return;
        setElapsed(0);

        intervalRef.current = setInterval(() => {
            if (!isPausedRef.current) {
                setElapsed(prev => Math.min(prev + 0.1, behavior.duration!));
            }
        }, 100);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isDemoActive, currentStep.id, behavior]);

    if (!isDemoActive || !behavior || !visible) return null;

    const isAuto = behavior.mode === 'auto';
    const progress = isAuto && behavior.duration ? (elapsed / behavior.duration) * 100 : 0;
    const hideNavbar = currentStep.app === 'email-marketplace';

    return (
        <div
            className={`fixed z-[105] right-0 transition-all duration-300 animate-in slide-in-from-top-2 fade-in duration-500 ${
                hideNavbar ? 'top-0' : 'top-16'
            } ${
                isSidebarCollapsed ? 'left-0' : 'left-80'
            } ${
                isAuto
                    ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 dark:from-indigo-500/15 dark:via-purple-500/8 dark:to-indigo-500/15 border-l-4 border-l-indigo-500'
                    : 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-500/15 dark:via-orange-500/8 dark:to-amber-500/15 border-l-4 border-l-amber-500'
            }`}
        >
            <div className="flex items-center justify-between px-5 py-2.5">
                {/* Left: Icon + message */}
                <div className="flex items-center gap-3 min-w-0">
                    {isAuto ? (
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" />
                                <Loader2 size={10} className="absolute -bottom-0.5 -right-0.5 animate-spin text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider whitespace-nowrap">
                                AI Processing
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0">
                            <MousePointerClick size={16} className="text-amber-500 dark:text-amber-400" />
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap">
                                Action Required
                            </span>
                        </div>
                    )}
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                        {isAuto ? behavior.aiSummary : behavior.userAction}
                    </span>
                </div>

                {/* Right: Mode badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ml-3 ${
                    isAuto
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 animate-pulse'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isAuto ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} />
                    {isAuto ? 'AUTO' : 'CLICK'}
                </div>
            </div>

            {/* Progress bar for auto steps */}
            {isAuto && behavior.duration && (
                <div className="h-0.5 w-full bg-indigo-500/10">
                    <div
                        className="h-full bg-indigo-500/60 transition-all duration-100 ease-linear"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
