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
 * USED BY: MBIBudgetPage (m1.3 step view)
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

    return (
        <div className="space-y-4">
            {/* Summary header */}
            <ValidationSummary total={total} resolved={resolved} preventedImpact={preventedImpact} />

            {/* Cards */}
            <div className="space-y-4">
                {sorted.map((v, i) => (
                    <ValidationCard
                        key={v.id}
                        validation={v}
                        status={statusById[v.id] ?? 'pending'}
                        onChange={s => onStatusChange(v.id, s)}
                        delayMs={i * 400}
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
function ValidationSummary({ total, resolved, preventedImpact }: { total: number; resolved: number; preventedImpact: number }) {
    const pct = Math.round((resolved / total) * 100)
    return (
        <div className="bg-muted/20 border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Pre-delivery validation</div>
                        <div className="text-[10px] text-muted-foreground">
                            Strata reviewed every line item against CET config + contract pricing + inventory
                        </div>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground tabular-nums">{resolved}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">/ {total}</span>
                    <span className="text-xs text-muted-foreground ml-1">resolved</span>
                </div>
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
}: {
    validation: Validation
    status: ValidationStatus
    onChange: (s: ValidationStatus) => void
    delayMs: number
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

    const severityTheme = (() => {
        if (status === 'accepted') return {
            border: 'border-success/30',
            bg: 'bg-success/5',
            ring: '',
            iconBg: 'bg-success/10',
            iconColor: 'text-success',
            icon: <CheckCircle2 className="h-5 w-5" />,
            label: 'Accepted',
            labelClass: 'bg-success/10 text-success',
        }
        if (status === 'overridden') return {
            border: 'border-info/30',
            bg: 'bg-info/5',
            ring: '',
            iconBg: 'bg-info/10',
            iconColor: 'text-info',
            icon: <Pencil className="h-5 w-5" />,
            label: 'Manually kept',
            labelClass: 'bg-info/10 text-info',
        }
        if (status === 'rejected') return {
            border: 'border-muted',
            bg: 'bg-muted/20',
            ring: '',
            iconBg: 'bg-muted',
            iconColor: 'text-muted-foreground',
            icon: <X className="h-5 w-5" />,
            label: 'Rejected',
            labelClass: 'bg-muted text-muted-foreground',
        }
        // pending
        if (validation.severity === 'critical') return {
            border: 'border-red-400 dark:border-red-500/50',
            bg: 'bg-red-50 dark:bg-red-500/10',
            ring: pulseActive ? 'ring-4 ring-red-500/20 animate-pulse' : 'ring-2 ring-red-500/10',
            iconBg: 'bg-red-100 dark:bg-red-500/20',
            iconColor: 'text-red-600',
            icon: <AlertCircle className="h-5 w-5" />,
            label: 'Critical',
            labelClass: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
        }
        return {
            border: 'border-amber-300 dark:border-amber-500/40',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            ring: '',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            iconColor: 'text-amber-600',
            icon: <AlertTriangle className="h-5 w-5" />,
            label: 'Warning',
            labelClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
        }
    })()

    return (
        <div
            style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' }}
            className={`
                border-2 rounded-2xl p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-500
                ${severityTheme.border} ${severityTheme.bg} ${severityTheme.ring}
            `}
        >
            <div className="flex items-start gap-4">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${severityTheme.iconBg} ${severityTheme.iconColor}`}>
                    {severityTheme.icon}
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                    {/* Badge row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${severityTheme.labelClass}`}>
                            {severityTheme.label}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                            AI confidence {validation.confidence}%
                        </span>
                        {isCritical && status === 'pending' && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                Blocks approval
                            </span>
                        )}
                    </div>

                    {/* Field name */}
                    <h3 className={`font-bold leading-tight ${isCritical ? 'text-lg' : 'text-base'} text-foreground`}>
                        {validation.field}
                    </h3>

                    {/* Expected vs Actual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-background border border-border rounded-xl p-3">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Expected</div>
                            <div className="text-xs text-foreground">{validation.expected}</div>
                        </div>
                        <div className={`bg-background border rounded-xl p-3 ${isCritical && status === 'pending' ? 'border-red-200 dark:border-red-500/30' : 'border-border'}`}>
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCritical && status === 'pending' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>Actual</div>
                            <div className="text-xs text-foreground">{validation.actual}</div>
                        </div>
                    </div>

                    {/* AI suggestion */}
                    <div className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="h-3 w-3 text-ai" />
                            <div className="text-[10px] font-bold text-ai uppercase tracking-wider">AI suggestion</div>
                        </div>
                        <div className="text-xs text-foreground leading-relaxed">{validation.aiSuggestion}</div>
                    </div>

                    {/* Actions row */}
                    {status === 'pending' ? (
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                            {validation.estimatedImpact && (
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {isCritical ? 'Estimated impact prevented' : 'Estimated impact'}
                                    </div>
                                    <div className={`${isCritical ? 'text-3xl' : 'text-xl'} font-bold tabular-nums ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                        +${validation.estimatedImpact.toLocaleString()}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={() => onChange('rejected')}
                                    className="px-3 py-2 text-xs font-bold text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => onChange('overridden')}
                                    className="px-3 py-2 text-xs font-bold text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                                >
                                    Override
                                </button>
                                <button
                                    onClick={() => onChange('accepted')}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Accept swap
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {status === 'accepted' && (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span>AI suggestion accepted{validation.estimatedImpact && ` · $${validation.estimatedImpact.toLocaleString()} prevented`}</span>
                                    </>
                                )}
                                {status === 'overridden' && (
                                    <>
                                        <Pencil className="h-4 w-4 text-info" />
                                        <span>Kept current value · manual override logged</span>
                                    </>
                                )}
                                {status === 'rejected' && (
                                    <>
                                        <X className="h-4 w-4 text-muted-foreground" />
                                        <span>Flag rejected · not included in summary</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => onChange('pending')}
                                className="text-[10px] text-muted-foreground hover:text-foreground underline"
                            >
                                Reopen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
