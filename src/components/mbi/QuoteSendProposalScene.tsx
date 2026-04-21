/**
 * COMPONENT: QuoteSendProposalScene
 * PURPOSE: Flow 3 · Scene 3 — PC human review + send. Proposal summary card
 *          + OrderExecutionPanel (how the order routes to each manufacturer).
 *          Send CTA flips into FlowHandoff that bridges to Flow 4 (Design AI).
 *
 *          Narrative role: closes the PC loop, then pivots the story
 *          upstream — "we caught the $18K in Flow 1, but the real leverage
 *          is preventing those spec issues at the source, inside the
 *          designer's CET".
 *
 * USED BY: MBIQuotesPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    Send, CheckCircle2, FileText, Clock, Package, Truck, Palette,
    Receipt, Calculator, Zap, Sparkles,
} from 'lucide-react'
import OrderExecutionPanel from './OrderExecutionPanel'
import FlowHandoff from './FlowHandoff'

export default function QuoteSendProposalScene() {
    const [sent, setSent] = useState(false)
    const [sentAt, setSentAt] = useState<Date | null>(null)

    const handleSend = () => {
        setSent(true)
        setSentAt(new Date())
    }

    return (
        <div className="space-y-4">
            {/* Proposal summary card */}
            <div className={`
                border rounded-2xl p-5 flex items-start gap-4 transition-colors
                ${sent ? 'bg-success/10 dark:bg-success/15 border-success/40' : 'bg-success/5 border-success/30'}
            `}>
                <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground">
                        {sent
                            ? 'Proposal delivered to Enterprise Holdings'
                            : 'CORE proposal PROP-2026-003 · ready to send'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        Enterprise Holdings · New HQ Floor 12 · 7 line items · $372,500 · HNI Corporate contract
                    </div>
                    {sent && sentAt && (
                        <div className="text-[11px] text-success font-semibold mt-1 inline-flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · copy to Amanda + sales rep · routed to each manufacturer
                        </div>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PC effort</div>
                    <div className="text-xl font-bold text-success">~12 min</div>
                    <div className="text-[10px] text-muted-foreground">was 2h per proposal</div>
                </div>
            </div>

            {/* Send CTA — pre-delivery */}
            {!sent && (
                <div className="bg-card dark:bg-zinc-800/40 border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Approve + send proposal</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Sending routes PO drafts to each manufacturer (EDI or non-EDI), logs the handoff in CORE, and pings Amanda.
                        </div>
                    </div>
                    <button
                        onClick={handleSend}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Send className="h-4 w-4" />
                        Send proposal to Enterprise
                    </button>
                </div>
            )}

            {/* Order execution — existing component, shows EDI + non-EDI + Compass */}
            <OrderExecutionPanel />

            {/* Post-send FlowHandoff to Flow 4 */}
            {sent && (
                <FlowHandoff
                    eyebrow="Flow 3 complete"
                    recapHeading="PC bottleneck · collapsed"
                    recapSubheading="4 audit loops → 1 AI pass + 1 human review. What used to take 2 hours per proposal takes 12 minutes."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '12 min', sub: 'vs 2h per proposal', accent: 'text-success' },
                        { icon: <Sparkles className="h-4 w-4" />, value: '4 → 1+1', sub: 'audit loops collapsed', accent: 'text-success' },
                        { icon: <Zap className="h-4 w-4" />, value: '5', sub: 'EDI POs auto-transmitted' },
                        { icon: <Package className="h-4 w-4" />, value: '0', sub: 'manual re-keying', accent: 'text-success' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <FileText className="h-3.5 w-3.5" />, label: 'Budget → PC queue', caption: 'signed last week', flow: 'Flow 3 · Quotes AI' },
                        { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'SIF → CORE auto-import', caption: '87 seconds, 0 keystrokes', flow: '—' },
                        { status: 'done', icon: <Send className="h-3.5 w-3.5" />, label: 'Proposal sent', caption: 'just now', flow: '—' },
                        { status: 'next', icon: <Truck className="h-3.5 w-3.5" />, label: 'Orders route to mfrs', caption: '5 EDI · 2 non-EDI', flow: '—' },
                        { status: 'future', icon: <Palette className="h-3.5 w-3.5" />, label: 'Upstream: Design AI', caption: 'catch issues at source', flow: 'Flow 4 · Design AI', highlight: true },
                    ]}
                    narrative={{
                        eyebrow: 'Go upstream · root cause',
                        icon: <Palette className="h-5 w-5" />,
                        title: "The $18K worksurface catch was downstream. What if we caught it earlier?",
                        body: (
                            <>
                                Strata caught it in Flow 1's validation. But the real leverage is upstream —
                                inside the designer's tool, before the SIF ever reaches Amanda. That's where
                                <strong className="text-foreground"> Beth Gianino</strong> (Phase 1 Pilot · design
                                early adopter) runs <strong className="text-foreground">Spec Check</strong> on the
                                CET BOM and finds the same class of issue in 5 minutes, not a week later.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Continue to Design AI · Beth's spec check",
                        icon: <Palette className="h-4 w-4" />,
                        targetStepId: 'm4.1',
                    }}
                    secondaryCTAs={[
                        { label: 'Restart Flow 1', icon: <Calculator className="h-3 w-3" />, targetStepId: 'm1.1' },
                        { label: 'Accounting AI', icon: <Receipt className="h-3 w-3" />, targetStepId: 'm2.1' },
                    ]}
                />
            )}
        </div>
    )
}
