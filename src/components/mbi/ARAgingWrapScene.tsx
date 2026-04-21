/**
 * COMPONENT: ARAgingWrapScene
 * PURPOSE: Flow 2 · Scene 4 — Kathy's morning wraps with AR aging review +
 *          one-click collection emails. Shows the live billing forecast
 *          (replaces bi-weekly Excel) and AR status taxonomy, then surfaces
 *          the FlowHandoff to Flow 3 (Quotes AI).
 *
 *          Three zones:
 *            1. AR status taxonomy board (existing component)
 *            2. Collection emails (existing AIEmailDraftsPanel)
 *            3. FlowHandoff → Quotes AI
 *
 * DS TOKENS: bg-card · AR severity accents · brand-300 CTA in handoff
 *
 * USED BY: MBIAccountingPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    TrendingDown, CheckCircle2, Clock, Mail, FileSignature,
    Receipt, Package, FileText, Calculator, Palette, Sparkles,
} from 'lucide-react'
import ARStatusBoard from './ARStatusBoard'
import AIEmailDraftsPanel from './AIEmailDraftsPanel'
import FlowHandoff from './FlowHandoff'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'

export default function ARAgingWrapScene() {
    const [morningClosed, setMorningClosed] = useState(false)

    const totalAR = MBI_AR_RECORDS.reduce((acc, r) => acc + r.amount, 0)
    const escalated = MBI_AR_RECORDS.filter(r => r.status === 'escalated').length
    const committed = MBI_AR_RECORDS
        .filter(r => r.status === 'committed-to-pay')
        .reduce((acc, r) => acc + r.amount, 0)

    return (
        <div className="space-y-4">
            {/* Wrap intro */}
            <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                <TrendingDown className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Morning wrap · AR aging stays live</div>
                    <div className="text-muted-foreground mt-0.5">
                        Exceptions cleared, vouchers posted. Before you log off: review AR aging and send the auto-drafted collection emails so nothing ages past 60 days.
                    </div>
                </div>
            </div>

            {/* AR status board (existing component, already renders taxonomy) */}
            <ARStatusBoard records={MBI_AR_RECORDS} />

            {/* AI email drafts */}
            <AIEmailDraftsPanel />

            {/* Close morning CTA · gates FlowHandoff */}
            {!morningClosed ? (
                <div className="bg-card dark:bg-zinc-800/40 border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Ready to close the morning?</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Vouchers posted · reconciliations logged · collection emails sent · forecast refreshed. Everything's in leadership's live dashboard.
                        </div>
                    </div>
                    <button
                        onClick={() => setMorningClosed(true)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Close morning queue
                    </button>
                </div>
            ) : (
                <FlowHandoff
                    eyebrow="Flow 2 complete"
                    recapHeading="Kathy's morning · done in 18 minutes"
                    recapSubheading="Vouchers posted, reconciliations cleared, AR emails out — everything Strata couldn't auto-handle routed through your eyes only."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '18 min', sub: 'vs 4h before', accent: 'text-success' },
                        { icon: <Sparkles className="h-4 w-4" />, value: '10 / 12', sub: 'invoices auto-posted', accent: 'text-success' },
                        { icon: <Mail className="h-4 w-4" />, value: '3', sub: 'collection emails sent' },
                        { icon: <TrendingDown className="h-4 w-4" />, value: `$${(committed / 1000).toFixed(0)}K`, sub: 'committed to pay', accent: 'text-success' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Morning queue', caption: '12 invoices triaged', flow: 'Flow 2 · Accounting AI' },
                        { status: 'done', icon: <Receipt className="h-3.5 w-3.5" />, label: 'HealthTrust posted', caption: '3% royalty applied', flow: '—' },
                        { status: 'done', icon: <Package className="h-3.5 w-3.5" />, label: 'Non-EDI cleared', caption: 'Herman Miller reconciled', flow: '—' },
                        { status: 'next', icon: <Mail className="h-3.5 w-3.5" />, label: 'AR emails out', caption: `${escalated} escalated · ${MBI_AR_RECORDS.length - escalated} routine`, flow: '—' },
                        { status: 'future', icon: <FileSignature className="h-3.5 w-3.5" />, label: 'Next Enterprise PO', caption: 'PC team picks up', flow: 'Flow 3 · Quotes AI', highlight: true },
                    ]}
                    narrative={{
                        eyebrow: 'Meanwhile · upstream',
                        icon: <FileSignature className="h-5 w-5" />,
                        title: `A new client just signed the budget Amanda sent last week. The PC team has work to do.`,
                        body: (
                            <>
                                Marcia's team runs <strong className="text-foreground">3.5 PCs for 29 staff</strong> — the biggest bottleneck at MBI. Every approved budget used to trigger hours of manual SIF re-entry into CORE plus 4 audit loops. That's where <strong className="text-foreground">Quotes AI</strong> collapses the work.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Continue to Quotes AI · PC team's queue",
                        icon: <FileText className="h-4 w-4" />,
                        targetStepId: 'm3.1',
                    }}
                    secondaryCTAs={[
                        { label: 'Design AI', icon: <Palette className="h-3 w-3" />, targetStepId: 'm4.1' },
                        { label: 'Restart Flow 1', icon: <Calculator className="h-3 w-3" />, targetStepId: 'm1.1' },
                    ]}
                />
            )}

            {/* Static stats footer for context */}
            {!morningClosed && (
                <div className="grid grid-cols-3 gap-3">
                    <SummaryTile label="Total AR" value={`$${totalAR.toLocaleString()}`} accent="text-foreground" />
                    <SummaryTile label="Escalated" value={`${escalated}`} accent="text-red-600 dark:text-red-400" />
                    <SummaryTile label="Committed" value={`$${committed.toLocaleString()}`} accent="text-success" />
                </div>
            )}
        </div>
    )
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-xl p-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={`text-lg font-bold tabular-nums mt-0.5 ${accent}`}>{value}</div>
        </div>
    )
}
