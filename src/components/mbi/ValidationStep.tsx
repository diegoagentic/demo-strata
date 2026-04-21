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

import { useEffect, useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle2, Shield, Sparkles, Check, X, Pencil, TrendingDown } from 'lucide-react'
import type { Validation, ValidationStatus } from '../../config/profiles/mbi-data'

interface ValidationStepProps {
    validations: Validation[]
    statusById: Record<string, ValidationStatus>
    onStatusChange: (id: string, status: ValidationStatus) => void
}

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

            {/* Section intro — explains the side-by-side layout */}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 dark:bg-zinc-800/50 border border-border rounded-xl px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                <span>
                    <strong className="text-foreground">One card per finding</strong> · shown side-by-side so you can compare
                    both in one pass. For each, compare <strong className="text-foreground">Expected</strong> vs <strong className="text-foreground">Actual</strong>, then{' '}
                    <strong className="text-foreground">Accept</strong> the AI swap, <strong className="text-foreground">Override</strong> to keep the current value, or{' '}
                    <strong className="text-foreground">Reject</strong> the flag.
                </span>
            </div>

            {/* Cards — side-by-side grid for at-a-glance comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {sorted.map((v, i) => (
                    <ValidationCard
                        key={v.id}
                        validation={v}
                        status={statusById[v.id] ?? 'pending'}
                        onChange={s => onStatusChange(v.id, s)}
                        delayMs={i * 200}
                        position={i + 1}
                        total={total}
                    />
                ))}
            </div>

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
    onChange,
    delayMs,
    position,
    total,
}: {
    validation: Validation
    status: ValidationStatus
    onChange: (s: ValidationStatus) => void
    delayMs: number
    position: number
    total: number
}) {
    const isCritical = validation.severity === 'critical'
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
                    {/* Top row: Finding N of X · Severity · AI confidence · Blocks? */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
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
                    </div>
                    {/* Second row: status badge (only after resolution) */}
                    {statusBadge && (
                        <div className="mb-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge.className}`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                            </span>
                        </div>
                    )}
                    {/* Blocks approval signal — only when critical AND pending */}
                    {isCritical && status === 'pending' && (
                        <div className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            {severityBadge.blocksHint}
                        </div>
                    )}
                    <h3 className="font-bold leading-tight text-base text-foreground">
                        {validation.field}
                    </h3>
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
                            onClick={() => onChange('rejected')}
                            className="px-2 py-2 text-xs font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => onChange('overridden')}
                            className="px-2 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Override
                        </button>
                        <button
                            onClick={() => onChange('accepted')}
                            className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                        {status === 'accepted' && (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                <span className="truncate">AI accepted{validation.estimatedImpact && ` · $${validation.estimatedImpact.toLocaleString()} prevented`}</span>
                            </>
                        )}
                        {status === 'overridden' && (
                            <>
                                <Pencil className="h-4 w-4 text-info shrink-0" />
                                <span className="truncate">Kept current · override logged</span>
                            </>
                        )}
                        {status === 'rejected' && (
                            <>
                                <X className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">Flag rejected</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => onChange('pending')}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline shrink-0"
                    >
                        Reopen
                    </button>
                </div>
            )}
        </div>
    )
}
