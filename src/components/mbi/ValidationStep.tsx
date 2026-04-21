/**
 * COMPONENT: ValidationStep
 * PURPOSE: ⭐ HERO MOMENT of the entire demo. Shows AI-detected validations
 *          that the Budget Builder catches BEFORE the budget reaches the client.
 *          Primary: the $18,240 Allsteel Further worksurface mismatch — the story
 *          Mark Kielhafner cited during the MBI AI Readiness assessment.
 *
 *          Secondary: a warning-level finish inconsistency ($320 impact).
 *
 *          Each validation offers 3 actions: Accept (AI suggestion) / Override
 *          (human-curated) / Reject (keep as-is). State is lifted so the
 *          Review and Output steps can reflect decisions.
 *
 * PROPS:
 *   - validations: Validation[]
 *   - statusById: Record<id, ValidationStatus>
 *   - onStatusChange: (id, status) => void
 *
 * STATES per card:
 *   - pending     — full severity ring + action buttons
 *   - accepted    — green check + "AI swap accepted" badge
 *   - overridden  — blue + "Manually kept" badge
 *   - rejected    — muted + strikethrough
 *
 * MICROINTERACTIONS:
 *   - Hero card: pulsing red ring for first 2s after mount (trust moment)
 *   - Entry stagger: hero at 0ms, secondary at 400ms
 *   - Resolution: card fades border + swaps action bar for state badge (200ms)
 *   - Summary banner: slides up when all resolved
 *
 * DS TOKENS: bg-red-500/10 (critical) · bg-amber-500/10 (warning) ·
 *            bg-success/5 (accepted) · DS tokens throughout
 *
 * USED BY: MBIBudgetPage (wizard step 3 · demo tour m1.4)
 */

import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { AlertTriangle, AlertCircle, CheckCircle2, Shield, Sparkles, Check, X, Pencil, TrendingDown, Send, Brain } from 'lucide-react'
import type { Validation, ValidationStatus } from '../../config/profiles/mbi-data'

interface ValidationStepProps {
    validations: Validation[]
    statusById: Record<string, ValidationStatus>
    onStatusChange: (id: string, status: ValidationStatus) => void
}

// Reason metadata captured by Override / Reject modals.
interface ValidationMeta {
    reasonCategory?: string
    notes?: string
    notifyAI?: boolean
    appliedAt: Date
}

type PendingAction =
    | { kind: 'override'; validation: Validation }
    | { kind: 'reject'; validation: Validation }
    | null

const OVERRIDE_CATEGORIES = [
    { id: 'client-confirmed', label: 'Client confirmed the current spec' },
    { id: 'custom-requirement', label: 'Custom requirement · intentional' },
    { id: 'accepting-risk', label: 'Accepting the risk · logged' },
    { id: 'other', label: 'Other (describe below)' },
]

const REJECT_CATEGORIES = [
    { id: 'false-positive', label: 'False positive · Strata misread the SIF' },
    { id: 'already-addressed', label: 'Already addressed outside the budget' },
    { id: 'not-applicable', label: 'Not applicable to this project' },
    { id: 'other', label: 'Other (describe below)' },
]

export default function ValidationStep({ validations, statusById, onStatusChange }: ValidationStepProps) {
    const total = validations.length
    const resolvedIds = Object.entries(statusById).filter(([_, s]) => s !== 'pending').map(([id]) => id)
    const resolved = resolvedIds.length
    const allResolved = resolved === total

    // Aggregate prevented impact from accepted validations
    const preventedImpact = validations
        .filter(v => statusById[v.id] === 'accepted' && v.estimatedImpact)
        .reduce((acc, v) => acc + (v.estimatedImpact ?? 0), 0)

    // Sort: critical first, then by severity
    const sorted = [...validations].sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 }
        return order[a.severity] - order[b.severity]
    })

    const criticalCount = sorted.filter(v => v.severity === 'critical').length
    const warningCount = sorted.filter(v => v.severity === 'warning').length

    // Modal + per-validation metadata
    const [pendingAction, setPendingAction] = useState<PendingAction>(null)
    const [metaById, setMetaById] = useState<Record<string, ValidationMeta>>({})
    const [toast, setToast] = useState<{ id: string; kind: ValidationStatus; message: string } | null>(null)

    const pushToast = (id: string, kind: ValidationStatus, message: string) => {
        setToast({ id, kind, message })
        setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 4200)
    }

    // Accept — one click, captures AI swap + pushes success toast
    const handleAccept = (v: Validation) => {
        onStatusChange(v.id, 'accepted')
        setMetaById(prev => ({ ...prev, [v.id]: { appliedAt: new Date() } }))
        const savings = v.estimatedImpact ? ` · $${v.estimatedImpact.toLocaleString()} prevented` : ''
        pushToast(v.id, 'accepted', `AI swap applied${savings}`)
    }

    // Override / Reject open a modal first; the modal submits through these.
    const handleOverrideSubmit = (v: Validation, payload: { reasonCategory: string; notes: string }) => {
        onStatusChange(v.id, 'overridden')
        setMetaById(prev => ({ ...prev, [v.id]: { ...payload, appliedAt: new Date() } }))
        setPendingAction(null)
        pushToast(v.id, 'overridden', `Current value kept · $${(v.estimatedImpact ?? 0).toLocaleString()} stays in budget`)
    }

    const handleRejectSubmit = (v: Validation, payload: { reasonCategory: string; notes: string; notifyAI: boolean }) => {
        onStatusChange(v.id, 'rejected')
        setMetaById(prev => ({ ...prev, [v.id]: { ...payload, appliedAt: new Date() } }))
        setPendingAction(null)
        const suffix = payload.notifyAI ? ' · feedback sent to Strata AI' : ' · logged locally'
        pushToast(v.id, 'rejected', `Flag rejected${suffix}`)
    }

    // Re-opening a resolved card clears its meta + any active toast
    const handleReopen = (v: Validation) => {
        onStatusChange(v.id, 'pending')
        setMetaById(prev => { const { [v.id]: _, ...rest } = prev; return rest })
        if (toast?.id === v.id) setToast(null)
    }

    return (
        <div className="space-y-4">
            {/* Summary header */}
            <ValidationSummary
                total={total}
                resolved={resolved}
                preventedImpact={preventedImpact}
                criticalCount={criticalCount}
                warningCount={warningCount}
            />

            {/* Section intro — explains what the cards are and how to act */}
            <div className="flex items-start gap-2.5 text-[11px] text-muted-foreground bg-muted/30 dark:bg-zinc-800/50 border border-border rounded-xl px-3 py-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="text-foreground font-bold text-xs mb-0.5">
                        {total} independent findings — decide on each below
                    </div>
                    <div>
                        Each card is one SIF line item Strata flagged. Compare{' '}
                        <strong className="text-foreground">Expected</strong> (what should be there) with{' '}
                        <strong className="text-foreground">Actual</strong> (what's in your SIF), then choose:{' '}
                        <strong className="text-success">Accept</strong> applies the AI swap ·{' '}
                        <strong className="text-info">Override</strong> keeps your value ·{' '}
                        <strong className="text-muted-foreground">Reject</strong> dismisses the flag.
                    </div>
                </div>
            </div>

            {/* Cards — side-by-side grid for at-a-glance comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {sorted.map((v, i) => (
                    <ValidationCard
                        key={v.id}
                        validation={v}
                        status={statusById[v.id] ?? 'pending'}
                        meta={metaById[v.id]}
                        activeToast={toast?.id === v.id ? toast : null}
                        onAccept={() => handleAccept(v)}
                        onOverride={() => setPendingAction({ kind: 'override', validation: v })}
                        onReject={() => setPendingAction({ kind: 'reject', validation: v })}
                        onReopen={() => handleReopen(v)}
                        delayMs={i * 200}
                        position={i + 1}
                        total={total}
                    />
                ))}
            </div>

            {/* Override / Reject modals */}
            {pendingAction?.kind === 'override' && (
                <OverrideModal
                    validation={pendingAction.validation}
                    onClose={() => setPendingAction(null)}
                    onSubmit={payload => handleOverrideSubmit(pendingAction.validation, payload)}
                />
            )}
            {pendingAction?.kind === 'reject' && (
                <RejectModal
                    validation={pendingAction.validation}
                    onClose={() => setPendingAction(null)}
                    onSubmit={payload => handleRejectSubmit(pendingAction.validation, payload)}
                />
            )}

            {/* All-resolved success banner */}
            {allResolved && (
                <div className="bg-success/5 border border-success/30 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="text-base font-bold text-foreground mb-1">All validations resolved · budget ready for review</div>
                        <div className="text-xs text-muted-foreground">
                            Strata caught {total} issue{total !== 1 ? 's' : ''} before this budget reached the client.
                            {preventedImpact > 0 && (
                                <>
                                    {' '}
                                    Estimated impact prevented: <span className="font-bold text-success tabular-nums">${preventedImpact.toLocaleString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Summary header ──────────────────────────────────────────────────────────
function ValidationSummary({
    total,
    resolved,
    preventedImpact,
    criticalCount,
    warningCount,
}: {
    total: number
    resolved: number
    preventedImpact: number
    criticalCount: number
    warningCount: number
}) {
    const pct = Math.round((resolved / total) * 100)
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground">Pre-delivery validation</div>
                        <div className="text-[10px] text-muted-foreground">
                            Strata compared every SIF line against CET config, contract pricing, and inventory — {total} issue{total !== 1 ? 's' : ''} need your decision.
                        </div>
                    </div>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-2xl font-bold text-foreground tabular-nums">{resolved}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">/ {total}</span>
                    <span className="text-xs text-muted-foreground ml-1">resolved</span>
                </div>
            </div>

            {/* Severity breakdown chips */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                {criticalCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {criticalCount} critical · blocks approval
                    </span>
                )}
                {warningCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        {warningCount} warning · advisory
                    </span>
                )}
            </div>

            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${resolved === total ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {preventedImpact > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingDown className="h-3.5 w-3.5 text-success" />
                        <span>Cumulative impact prevented</span>
                    </div>
                    <span className="text-lg font-bold text-success tabular-nums">
                        ${preventedImpact.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    )
}

// ─── Single validation card ──────────────────────────────────────────────────
function ValidationCard({
    validation,
    status,
    meta,
    activeToast,
    onAccept,
    onOverride,
    onReject,
    onReopen,
    delayMs,
    position,
    total,
}: {
    validation: Validation
    status: ValidationStatus
    meta?: ValidationMeta
    activeToast: { id: string; kind: ValidationStatus; message: string } | null
    onAccept: () => void
    onOverride: () => void
    onReject: () => void
    onReopen: () => void
    delayMs: number
    position: number
    total: number
}) {
    const isCritical = validation.severity === 'critical'
    const parsed = parseValidationField(validation.field)
    const [pulseActive, setPulseActive] = useState(isCritical && status === 'pending')

    // Stop the pulsing ring after 2s — the hero card draws attention, then settles
    useEffect(() => {
        if (!pulseActive) return
        const t = setTimeout(() => setPulseActive(false), 2200)
        return () => clearTimeout(t)
    }, [pulseActive])

    // Stop pulsing if user resolves
    useEffect(() => {
        if (status !== 'pending') setPulseActive(false)
    }, [status])

    // Severity badge — keeps its original flavor even after resolution
    const severityBadge = isCritical
        ? {
            label: 'Critical',
            className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
            icon: <AlertCircle className="h-3 w-3" />,
            blocksHint: 'Blocks approval',
        }
        : {
            label: 'Warning',
            className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
            icon: <AlertTriangle className="h-3 w-3" />,
            blocksHint: 'Advisory · does not block',
        }

    // Status badge — shown alongside severity after resolution
    const statusBadge = (() => {
        if (status === 'accepted') return { label: 'AI swap accepted', className: 'bg-success/15 text-success', icon: <CheckCircle2 className="h-3 w-3" /> }
        if (status === 'overridden') return { label: 'Manually kept', className: 'bg-info/15 text-info', icon: <Pencil className="h-3 w-3" /> }
        if (status === 'rejected') return { label: 'Flag rejected', className: 'bg-muted text-muted-foreground', icon: <X className="h-3 w-3" /> }
        return null
    })()

    // Card outer theme — signals resolution state (overrides severity bg when resolved)
    const severityTheme = (() => {
        if (status === 'accepted') return {
            border: 'border-success/30',
            bg: 'bg-success/5',
            ring: '',
            iconBg: 'bg-success/10',
            iconColor: 'text-success',
            icon: <CheckCircle2 className="h-5 w-5" />,
        }
        if (status === 'overridden') return {
            border: 'border-info/30',
            bg: 'bg-info/5',
            ring: '',
            iconBg: 'bg-info/10',
            iconColor: 'text-info',
            icon: <Pencil className="h-5 w-5" />,
        }
        if (status === 'rejected') return {
            border: 'border-muted',
            bg: 'bg-muted/20',
            ring: '',
            iconBg: 'bg-muted',
            iconColor: 'text-muted-foreground',
            icon: <X className="h-5 w-5" />,
        }
        // pending — uses severity color
        if (isCritical) return {
            border: 'border-red-400 dark:border-red-500/50',
            bg: 'bg-red-50 dark:bg-red-500/10',
            ring: pulseActive ? 'ring-4 ring-red-500/20 animate-pulse' : 'ring-2 ring-red-500/10',
            iconBg: 'bg-red-100 dark:bg-red-500/20',
            iconColor: 'text-red-600',
            icon: <AlertCircle className="h-5 w-5" />,
        }
        return {
            border: 'border-amber-300 dark:border-amber-500/40',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            ring: '',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600',
            icon: <AlertTriangle className="h-5 w-5" />,
        }
    })()

    const innerPanel = 'bg-zinc-50/70 dark:bg-zinc-800/60 border border-border rounded-xl p-3'

    return (
        <div
            style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' }}
            className={`
                border-2 rounded-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col
                ${severityTheme.border} ${severityTheme.bg} ${severityTheme.ring}
            `}
        >
            {/* Header — icon + persistent severity + position + status */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${severityTheme.iconBg} ${severityTheme.iconColor}`}>
                    {severityTheme.icon}
                </div>
                <div className="min-w-0 flex-1">
                    {/* Top row: Finding N of X · Severity · AI confidence */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Finding {position} of {total}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${severityBadge.className}`}>
                            {severityBadge.icon}
                            {severityBadge.label}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                            AI {validation.confidence}%
                        </span>
                        {statusBadge && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge.className}`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                            </span>
                        )}
                    </div>

                    {/* Big title — the attribute in conflict · eye-level readable */}
                    <h3 className="font-bold leading-tight text-lg text-foreground">
                        {parsed.attribute}{' '}
                        <span className="text-muted-foreground font-normal text-sm">mismatch</span>
                    </h3>

                    {/* Subtitle — line reference + product */}
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-mono font-semibold text-foreground">{parsed.lineRef}</span>
                        {parsed.product && (
                            <>
                                <span className="mx-1">·</span>
                                <span>{parsed.product}</span>
                            </>
                        )}
                        <span className="mx-1">·</span>
                        <span>in this SIF</span>
                    </div>

                    {/* Blocks approval signal — only when critical AND pending */}
                    {isCritical && status === 'pending' && (
                        <div className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mt-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            {severityBadge.blocksHint}
                        </div>
                    )}
                </div>
            </div>

            {/* Body — Expected / Actual stacked + AI suggestion */}
            <div className="space-y-2 flex-1">
                <div className={innerPanel}>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Expected</div>
                    <div className="text-xs text-foreground">{validation.expected}</div>
                </div>
                <div className={`${innerPanel} ${isCritical && status === 'pending' ? 'border-red-200 dark:border-red-500/30' : ''}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCritical && status === 'pending' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>Actual</div>
                    <div className="text-xs text-foreground">{validation.actual}</div>
                </div>
                <div className={innerPanel}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-ai" />
                        <div className="text-[10px] font-bold text-ai uppercase tracking-wider">AI suggestion</div>
                    </div>
                    <div className="text-xs text-foreground leading-relaxed">{validation.aiSuggestion}</div>
                </div>
            </div>

            {/* Footer — impact + actions */}
            {status === 'pending' ? (
                <div className="mt-3 pt-3 border-t border-current/10 space-y-3">
                    {validation.estimatedImpact && (
                        <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {isCritical ? 'Impact prevented' : 'Estimated impact'}
                            </span>
                            <span className={`text-2xl font-bold tabular-nums ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                +${validation.estimatedImpact.toLocaleString()}
                            </span>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={onReject}
                            className="px-2 py-2 text-xs font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-muted-foreground/40 transition-colors"
                            title="Dismiss the flag · send feedback to Strata AI"
                        >
                            Reject
                        </button>
                        <button
                            onClick={onOverride}
                            className="px-2 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted hover:border-info/40 transition-colors"
                            title="Keep the current value · impact stays in budget"
                        >
                            Override
                        </button>
                        <button
                            onClick={onAccept}
                            className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                            title="Apply the AI swap"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
                    {/* Primary resolved row */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 text-xs min-w-0">
                            {status === 'accepted' && <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                            {status === 'overridden' && <Pencil className="h-4 w-4 text-info shrink-0 mt-0.5" />}
                            {status === 'rejected' && <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                            <div className="min-w-0">
                                <div className="text-foreground font-semibold">
                                    {status === 'accepted' && (
                                        <>AI swap applied{validation.estimatedImpact && <> · <span className="text-success tabular-nums">${validation.estimatedImpact.toLocaleString()} prevented</span></>}</>
                                    )}
                                    {status === 'overridden' && (
                                        <>Current value kept{validation.estimatedImpact && <> · <span className="text-info tabular-nums">${validation.estimatedImpact.toLocaleString()} stays in budget</span></>}</>
                                    )}
                                    {status === 'rejected' && <>Flag rejected{meta?.notifyAI ? ' · AI notified' : ' · logged locally'}</>}
                                </div>
                                {meta?.reasonCategory && (
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        Reason: <span className="text-foreground font-medium">
                                            {(status === 'overridden' ? OVERRIDE_CATEGORIES : REJECT_CATEGORIES).find(c => c.id === meta.reasonCategory)?.label ?? meta.reasonCategory}
                                        </span>
                                    </div>
                                )}
                                {meta?.notes && (
                                    <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-2">
                                        "{meta.notes}"
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onReopen}
                            className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0"
                        >
                            Reopen
                        </button>
                    </div>

                    {/* Transient toast-style confirmation (auto-dismisses) */}
                    {activeToast && (
                        <div
                            className={`
                                flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                                ${activeToast.kind === 'accepted' ? 'bg-success/15 text-success border border-success/30' : ''}
                                ${activeToast.kind === 'overridden' ? 'bg-info/15 text-info border border-info/30' : ''}
                                ${activeToast.kind === 'rejected' ? 'bg-muted text-foreground border border-border' : ''}
                            `}
                        >
                            {activeToast.kind === 'rejected' && meta?.notifyAI
                                ? <Brain className="h-3.5 w-3.5 shrink-0" />
                                : <Send className="h-3.5 w-3.5 shrink-0" />}
                            <span className="truncate">{activeToast.message}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Override modal ──────────────────────────────────────────────────────────
function OverrideModal({
    validation,
    onClose,
    onSubmit,
}: {
    validation: Validation
    onClose: () => void
    onSubmit: (payload: { reasonCategory: string; notes: string }) => void
}) {
    const [reasonCategory, setReasonCategory] = useState('client-confirmed')
    const [notes, setNotes] = useState('')
    const canSubmit = reasonCategory !== 'other' || notes.trim().length > 0

    return (
        <Transition show={true} as={Fragment} appear>
            <Dialog onClose={onClose} className="relative z-[100]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl">
                                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-info/15 text-info flex items-center justify-center shrink-0">
                                            <Pencil className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-bold text-foreground">Override — keep current value</DialogTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5">{validation.field}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Impact warning */}
                                    {validation.estimatedImpact && (
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">
                                                    Your value won't trigger the AI swap.
                                                </div>
                                                <div className="text-muted-foreground mt-0.5">
                                                    The <strong className="text-amber-700 dark:text-amber-400 tabular-nums">${validation.estimatedImpact.toLocaleString()}</strong> impact stays in the budget. Make sure this is intentional — your reason is logged.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Why are you keeping the current value?</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {OVERRIDE_CATEGORIES.map(c => {
                                                const active = reasonCategory === c.id
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setReasonCategory(c.id)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors
                                                            ${active
                                                                ? 'bg-info/10 border-info/40 text-info'
                                                                : 'bg-background dark:bg-zinc-800 border-border text-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-info' : 'bg-muted-foreground/40'}`} />
                                                        {c.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Notes {reasonCategory === 'other' && <span className="text-info ml-1">· required</span>}
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows={3}
                                            placeholder="e.g. Client reviewed the floor plan on 04/18 and signed off on the 72×36 worksurface despite the panel constraint."
                                            className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-info resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="px-5 py-3 border-t border-border bg-muted/20 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
                                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => canSubmit && onSubmit({ reasonCategory, notes: notes.trim() })}
                                        disabled={!canSubmit}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-info hover:opacity-90 rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Keep current value
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Reject modal ────────────────────────────────────────────────────────────
function RejectModal({
    validation,
    onClose,
    onSubmit,
}: {
    validation: Validation
    onClose: () => void
    onSubmit: (payload: { reasonCategory: string; notes: string; notifyAI: boolean }) => void
}) {
    const [reasonCategory, setReasonCategory] = useState('false-positive')
    const [notes, setNotes] = useState('')
    const [notifyAI, setNotifyAI] = useState(true)
    const canSubmit = reasonCategory !== 'other' || notes.trim().length > 0

    return (
        <Transition show={true} as={Fragment} appear>
            <Dialog onClose={onClose} className="relative z-[100]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-900 border border-border rounded-2xl shadow-2xl">
                                <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                                            <X className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-bold text-foreground">Reject flag — Strata was wrong?</DialogTitle>
                                            <p className="text-xs text-muted-foreground mt-0.5">{validation.field}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* AI learning context */}
                                    <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                                        <Brain className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                                        <div className="text-xs">
                                            <div className="font-bold text-foreground">Your feedback trains the model.</div>
                                            <div className="text-muted-foreground mt-0.5">
                                                Tell Strata why this flag was wrong so it stops raising the same issue on future budgets.
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Why reject?</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {REJECT_CATEGORIES.map(c => {
                                                const active = reasonCategory === c.id
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setReasonCategory(c.id)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors
                                                            ${active
                                                                ? 'bg-muted border-muted-foreground/40 text-foreground'
                                                                : 'bg-background dark:bg-zinc-800 border-border text-foreground hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-muted-foreground' : 'bg-muted-foreground/30'}`} />
                                                        {c.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Notes for Strata {reasonCategory === 'other' && <span className="text-red-600 dark:text-red-400 ml-1">· required</span>}
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows={3}
                                            placeholder="e.g. The 72×36 is valid — we verified with Allsteel that this config ships with a reinforced panel mount."
                                            className="w-full bg-background dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                                        />
                                    </div>

                                    <label className="flex items-start gap-3 bg-muted/30 dark:bg-zinc-800/60 border border-border rounded-lg p-3 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <input type="checkbox" checked={notifyAI} onChange={e => setNotifyAI(e.target.checked)} className="h-4 w-4 mt-0.5 accent-primary" />
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-foreground">Send feedback to Strata AI</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Your rejection + reason is logged to the model-improvement pipeline. No client data shared.
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="px-5 py-3 border-t border-border bg-muted/20 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
                                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => canSubmit && onSubmit({ reasonCategory, notes: notes.trim(), notifyAI })}
                                        disabled={!canSubmit}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {notifyAI ? <Brain className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                        {notifyAI ? 'Reject & notify AI' : 'Reject flag'}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Splits a field like "Line 5: Allsteel Further — Worksurface Size" into
// { lineRef: "Line 5", product: "Allsteel Further", attribute: "Worksurface Size" }.
// Falls back gracefully when the expected delimiters aren't present.
function parseValidationField(field: string): { lineRef: string; product: string; attribute: string } {
    const [left, right] = field.split(':').map(s => s.trim())
    if (!right) return { lineRef: '', product: '', attribute: field }
    const [product, attribute] = right.split('—').map(s => s.trim())
    return {
        lineRef: left,
        product: product ?? '',
        attribute: attribute ?? product ?? field,
    }
}
