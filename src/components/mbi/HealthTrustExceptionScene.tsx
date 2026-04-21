/**
 * COMPONENT: HealthTrustExceptionScene
 * PURPOSE: Flow 2 · Scene 2 — the HealthTrust GPO 3% royalty moment. Strata
 *          detects a healthcare invoice against an MBI HealthTrust contract
 *          and auto-calculates the royalty line. Kathy approves, overrides,
 *          or escalates to Lynda Alexander (Director of Healthcare).
 *
 *          Reuses the ValidationCard grammar: Expected vs Actual (with AI
 *          suggestion), Accept / Override / Flag actions wired through
 *          MBIReasonModal. Approving posts the voucher; override requires
 *          a reason; flag escalates to Lynda with a Teams ping simulation.
 *
 * DS TOKENS: bg-amber-50 (HealthTrust signal) · success / info / danger
 *
 * USED BY: MBIAccountingPage (wizard scene 1)
 */

import { useState } from 'react'
import {
    Heart, Sparkles, CheckCircle2, Check, X, Pencil, Send, Brain,
    AlertTriangle, Building2, FileText, UserCheck, Flag,
} from 'lucide-react'
import { ReasonDialog as MBIReasonModal, StatusBadge } from '../shared'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'

type ExceptionStatus = 'pending' | 'approved' | 'overridden' | 'escalated'

const OVERRIDE_CATEGORIES = [
    { id: 'contract-ambiguous', label: 'GPO contract clause ambiguous' },
    { id: 'different-rate', label: 'Different royalty rate applies' },
    { id: 'exempt-line', label: 'Line items are exempt from royalty' },
    { id: 'other', label: 'Other (describe below)' },
]

const ESCALATE_CATEGORIES = [
    { id: 'lynda-review', label: 'Needs Lynda\'s GPO expertise' },
    { id: 'client-dispute', label: 'Client disputing royalty' },
    { id: 'audit-trigger', label: 'Potential audit trigger' },
    { id: 'other', label: 'Other (describe below)' },
]

export default function HealthTrustExceptionScene() {
    const invoice = MBI_INVOICES.find(i => i.id === 'INV-0486')!  // Mercy HealthTrust hero
    const royalty = Math.round(invoice.amount * 0.03)
    const totalDue = invoice.amount + royalty

    const [status, setStatus] = useState<ExceptionStatus>('pending')
    const [meta, setMeta] = useState<{ reasonCategory?: string; notes?: string; notifyAI?: boolean } | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [modalKind, setModalKind] = useState<'override' | 'escalate' | null>(null)

    const pushToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 4200)
    }

    const handleApprove = () => {
        setStatus('approved')
        setMeta(null)
        pushToast(`Royalty approved · $${royalty.toLocaleString()} posted to voucher in CORE`)
    }

    const handleOverrideSubmit = (payload: { reasonCategory: string; notes: string }) => {
        setStatus('overridden')
        setMeta({ ...payload, notifyAI: false })
        setModalKind(null)
        pushToast(`Royalty overridden · reason logged to audit trail`)
    }

    const handleEscalateSubmit = (payload: { reasonCategory: string; notes: string; notifyAI: boolean }) => {
        setStatus('escalated')
        setMeta(payload)
        setModalKind(null)
        pushToast(`Escalated to Lynda Alexander · Teams ping sent to #healthcare-gpo`)
    }

    const handleReopen = () => {
        setStatus('pending')
        setMeta(null)
    }

    return (
        <div className="space-y-4">
            {/* Intro strip — what Strata detected */}
            <div className="bg-amber-50/70 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                <Heart className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">HealthTrust GPO contract triggered</div>
                    <div className="text-muted-foreground mt-0.5">
                        Mercy is a HealthTrust GPO member. Per MBI's master agreement, a 3% royalty line auto-appends to every healthcare invoice and posts to the GPO payable account.
                    </div>
                </div>
            </div>

            {/* Hero card — reuses the discrepancy grammar */}
            <div className={`
                border-2 border-l-4 rounded-2xl p-4 transition-all
                ${status === 'approved' ? 'border-success/40 bg-success/5 dark:bg-success/10 border-l-success' : ''}
                ${status === 'overridden' ? 'border-info/40 bg-info/5 dark:bg-info/10 border-l-info' : ''}
                ${status === 'escalated' ? 'border-red-300 dark:border-red-500/40 bg-red-50/70 dark:bg-red-500/10 border-l-red-500' : ''}
                ${status === 'pending' ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/60 dark:bg-amber-500/10 border-l-amber-500' : ''}
            `}>
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center shrink-0
                        ${status === 'approved' ? 'bg-success/15 text-success' : ''}
                        ${status === 'overridden' ? 'bg-info/15 text-info' : ''}
                        ${status === 'escalated' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : ''}
                        ${status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''}
                    `}>
                        {status === 'approved' && <CheckCircle2 className="h-5 w-5" />}
                        {status === 'overridden' && <Pencil className="h-5 w-5" />}
                        {status === 'escalated' && <Flag className="h-5 w-5" />}
                        {status === 'pending' && <Heart className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge label="HealthTrust GPO" tone="warning" size="sm" />
                            <span className="text-[10px] text-muted-foreground">AI 97% · auto-calculated</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground leading-tight mt-1">
                            3% royalty <span className="text-muted-foreground font-normal text-sm">on {invoice.vendor}</span>
                        </h3>
                        <div className="text-[11px] text-muted-foreground">
                            <span className="font-mono text-foreground">{invoice.id}</span> · {invoice.poNumber} · contract: HealthTrust Master (signed 2024)
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Royalty amount</div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">+${royalty.toLocaleString()}</div>
                    </div>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-zinc-50/70 dark:bg-zinc-800/60 border border-border rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 dark:bg-zinc-800/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Calculation
                    </div>
                    <div className="divide-y divide-border text-xs">
                        <div className="px-3 py-2 flex justify-between">
                            <span className="text-muted-foreground">Invoice subtotal</span>
                            <span className="text-foreground tabular-nums">${invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="px-3 py-2 flex justify-between items-center bg-amber-50/40 dark:bg-amber-500/5">
                            <span className="text-amber-700 dark:text-amber-400 font-semibold inline-flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" />
                                3% GPO royalty (auto-applied)
                            </span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">+${royalty.toLocaleString()}</span>
                        </div>
                        <div className="px-3 py-2 flex justify-between bg-muted/20 dark:bg-zinc-900/40">
                            <span className="font-bold text-foreground">Total due</span>
                            <span className="text-foreground font-bold tabular-nums">${totalDue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer — actions or resolved state */}
                {status === 'pending' ? (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setModalKind('escalate')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-400 bg-background dark:bg-zinc-800 border border-red-300 dark:border-red-500/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <Flag className="h-3.5 w-3.5" />
                            Flag for Lynda
                        </button>
                        <button
                            onClick={() => setModalKind('override')}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-info/40 transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Override
                        </button>
                        <button
                            onClick={handleApprove}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Approve & post
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 pt-3 border-t border-current/10 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 text-xs min-w-0">
                                {status === 'approved' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                {status === 'overridden' && <Pencil className="h-4 w-4 text-info shrink-0 mt-0.5" />}
                                {status === 'escalated' && <Flag className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                                <div className="min-w-0">
                                    <div className="text-foreground font-semibold">
                                        {status === 'approved' && <>Royalty posted · <span className="text-success tabular-nums">${royalty.toLocaleString()}</span> to GPO payable</>}
                                        {status === 'overridden' && <>Royalty overridden · audit trail logged</>}
                                        {status === 'escalated' && <>Escalated to Lynda Alexander · awaiting GPO review</>}
                                    </div>
                                    {meta?.reasonCategory && (
                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                            Reason: <span className="text-foreground font-medium">
                                                {(status === 'overridden' ? OVERRIDE_CATEGORIES : ESCALATE_CATEGORIES)
                                                    .find(c => c.id === meta.reasonCategory)?.label ?? meta.reasonCategory}
                                            </span>
                                        </div>
                                    )}
                                    {meta?.notes && (
                                        <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-2">"{meta.notes}"</div>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleReopen} className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0">
                                Reopen
                            </button>
                        </div>
                        {toast && (
                            <div className={`
                                flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                                ${status === 'approved' ? 'bg-success/15 text-success border border-success/30' : ''}
                                ${status === 'overridden' ? 'bg-info/15 text-info border border-info/30' : ''}
                                ${status === 'escalated' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30' : ''}
                            `}>
                                {status === 'escalated' ? <Send className="h-3.5 w-3.5 shrink-0" /> : <Check className="h-3.5 w-3.5 shrink-0" />}
                                <span className="truncate">{toast}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Context cards — who is Lynda, what contract */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-info/15 text-info flex items-center justify-center shrink-0">
                        <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">Lynda Alexander</div>
                        <div className="text-[10px] text-muted-foreground">Director of Healthcare · owns HealthTrust contract</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Teams · #healthcare-gpo · responds ~1h</div>
                    </div>
                </div>
                <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-xs min-w-0">
                        <div className="font-bold text-foreground">HealthTrust Master Agreement</div>
                        <div className="text-[10px] text-muted-foreground">Signed Feb 2024 · 3% royalty on all GPO member orders</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Covers Mercy, BJC, 14 other hospitals</div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MBIReasonModal
                isOpen={modalKind === 'override'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleOverrideSubmit({ reasonCategory: payload.categoryId, notes: payload.notes })}
                tone="info"
                icon={<Pencil className="h-5 w-5" />}
                title="Override the 3% royalty"
                subtitle={`${invoice.vendor} · ${invoice.id}`}
                contextBanner={{
                    tone: 'warning',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    title: 'Royalty won\'t be applied to this invoice.',
                    body: (
                        <>
                            The <strong className="tabular-nums">${royalty.toLocaleString()}</strong> stays off the GPO payable. Audit trail captures your reason so finance can trace it later.
                        </>
                    ),
                }}
                categories={OVERRIDE_CATEGORIES}
                defaultCategoryId="contract-ambiguous"
                categoryPrompt="Why override the royalty?"
                notesPlaceholder="e.g. Per HealthTrust amendment dated 03/04, this line item is exempt from royalty..."
                notesRequiredForCategoryId="other"
                confirmLabel="Skip royalty · log override"
            />
            <MBIReasonModal
                isOpen={modalKind === 'escalate'}
                onClose={() => setModalKind(null)}
                onSubmit={payload => handleEscalateSubmit({
                    reasonCategory: payload.categoryId,
                    notes: payload.notes,
                    notifyAI: payload.notifyAI,
                })}
                tone="danger"
                icon={<Flag className="h-5 w-5" />}
                title="Flag for Lynda Alexander"
                subtitle={`Healthcare director · owns GPO contracts`}
                contextBanner={{
                    tone: 'info',
                    icon: <UserCheck className="h-4 w-4" />,
                    title: 'Lynda will see this in Teams within the hour.',
                    body: 'Pings her in #healthcare-gpo with invoice context + your reason. The royalty stays on hold until she responds.',
                }}
                categories={ESCALATE_CATEGORIES}
                defaultCategoryId="lynda-review"
                categoryPrompt="Why escalate?"
                notesPlaceholder="e.g. Mercy CFO emailed questioning the 3% — need Lynda to confirm whether the May addendum changes it."
                notesRequiredForCategoryId="other"
                notifyToggle={{
                    defaultOn: true,
                    title: 'Also ping Strata AI',
                    description: 'Escalation pattern trains the router · helps Strata catch this class of issue earlier next time.',
                }}
                confirmLabel="Escalate to Lynda"
                confirmLabelWhenNotifying="Escalate & notify AI"
            />
        </div>
    )
}
