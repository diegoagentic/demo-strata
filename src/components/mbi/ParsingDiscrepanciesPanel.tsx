/**
 * COMPONENT: ParsingDiscrepanciesPanel
 * PURPOSE: Surfaces parse-time issues that the user must triage before
 *          scenarios are generated. Two discrepancies supported for the hero
 *          demo:
 *
 *            1. FIELD — a declared SIF field doesn't match the CAP worksheet
 *               (e.g. Budget ceiling mismatch). Severity: warning.
 *            2. INVENTORY — an item in the SIF has a cheaper in-stock match
 *               in Strata's inventory DB (savings suggestion). Severity: info.
 *
 *          Uses the same Accept / Review / Dismiss grammar as ValidationStep
 *          so the demo feels consistent, but tuned to pre-scenario triage
 *          (less impact, suggestions not blockers).
 *
 * PROPS:
 *   - discrepancies: ParsingDiscrepancy[]
 *   - statusById: Record<id, DiscrepancyStatus>
 *   - onStatusChange: (id, status) => void
 *
 * DS TOKENS: bg-card · border-border · amber/info severity accents
 *
 * USED BY: ParsingStep
 */

import { AlertTriangle, Sparkles, CheckCircle2, Check, X, ArrowRight, PackageSearch, Eye, Scale, TrendingDown } from 'lucide-react'

export type DiscrepancyStatus = 'pending' | 'accepted' | 'dismissed'

export interface ParsingDiscrepancy {
    id: string
    kind: 'field' | 'inventory'
    title: string
    context: string
    confidence: number
    current: { label: string; value: string }
    suggestion: { label: string; value: string }
    /** Savings or risk surface (for inventory, this is the savings amount; for field, the deviation). */
    impact?: { label: string; amount: number; tone: 'positive' | 'neutral' | 'negative' }
    actionLabel: string
    reviewLabel?: string
}

export const DEFAULT_PARSING_DISCREPANCIES: ParsingDiscrepancy[] = [
    {
        id: 'field-budget-ceiling',
        kind: 'field',
        title: 'Budget ceiling mismatch',
        context: 'CAP worksheet total is $7,450 above the declared ceiling in the SIF header.',
        confidence: 96,
        current: { label: 'SIF header (declared)', value: '$385,000 · budget ceiling' },
        suggestion: { label: 'CAP worksheet (derived)', value: '$392,450 · sum of overrides' },
        impact: { label: 'Deviation', amount: 7450, tone: 'negative' },
        actionLabel: 'Use CAP total',
        reviewLabel: 'Open in reconciler',
    },
    {
        id: 'inventory-knoll-propeller',
        kind: 'inventory',
        title: 'Cheaper match in inventory',
        context: 'The Knoll Propeller conference table 84" is available in Strata warehouse at a lower price.',
        confidence: 92,
        current: { label: 'SIF line (KNOLL-PROP-84)', value: '2 × $8,400 · new from vendor' },
        suggestion: { label: 'Strata inventory match', value: '2 × $6,900 · in-stock · Birmingham DC' },
        impact: { label: 'Potential savings', amount: 3000, tone: 'positive' },
        actionLabel: 'Apply swap',
        reviewLabel: 'Compare inventory',
    },
]

interface ParsingDiscrepanciesPanelProps {
    discrepancies: ParsingDiscrepancy[]
    statusById: Record<string, DiscrepancyStatus>
    onStatusChange: (id: string, status: DiscrepancyStatus) => void
}

export default function ParsingDiscrepanciesPanel({
    discrepancies,
    statusById,
    onStatusChange,
}: ParsingDiscrepanciesPanelProps) {
    const total = discrepancies.length
    const resolved = discrepancies.filter(d => (statusById[d.id] ?? 'pending') !== 'pending').length
    const savings = discrepancies
        .filter(d => statusById[d.id] === 'accepted' && d.kind === 'inventory' && d.impact?.tone === 'positive')
        .reduce((acc, d) => acc + (d.impact?.amount ?? 0), 0)

    return (
        <div className="space-y-3">
            {/* Summary header */}
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                            <Scale className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground">
                                {total} item{total !== 1 ? 's' : ''} to review before scenarios
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Parse pass flagged 1 field mismatch and 1 inventory suggestion · neither blocks advancement.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                        <span className="text-2xl font-bold text-foreground tabular-nums">{resolved}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">/ {total}</span>
                        <span className="text-xs text-muted-foreground ml-1">resolved</span>
                    </div>
                </div>
                {savings > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <TrendingDown className="h-3.5 w-3.5 text-success" />
                            <span>Savings applied from inventory</span>
                        </div>
                        <span className="text-lg font-bold text-success tabular-nums">
                            −${savings.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Two-card grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
                {discrepancies.map(d => (
                    <DiscrepancyCard
                        key={d.id}
                        discrepancy={d}
                        status={statusById[d.id] ?? 'pending'}
                        onChange={s => onStatusChange(d.id, s)}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Single discrepancy card ─────────────────────────────────────────────────
function DiscrepancyCard({
    discrepancy,
    status,
    onChange,
}: {
    discrepancy: ParsingDiscrepancy
    status: DiscrepancyStatus
    onChange: (s: DiscrepancyStatus) => void
}) {
    const isField = discrepancy.kind === 'field'
    const theme = (() => {
        if (status === 'accepted') {
            return {
                border: 'border-success/40',
                bg: 'bg-success/5 dark:bg-success/10',
                leftBar: 'border-l-success',
                iconBg: 'bg-success/15 text-success',
                icon: <CheckCircle2 className="h-5 w-5" />,
                label: 'Applied',
                labelClass: 'bg-success/15 text-success',
            }
        }
        if (status === 'dismissed') {
            return {
                border: 'border-border',
                bg: 'bg-muted/30 dark:bg-zinc-800/40',
                leftBar: 'border-l-muted-foreground/30',
                iconBg: 'bg-muted text-muted-foreground',
                icon: <X className="h-5 w-5" />,
                label: 'Dismissed',
                labelClass: 'bg-muted text-muted-foreground',
            }
        }
        // pending
        if (isField) {
            return {
                border: 'border-amber-300 dark:border-amber-500/40',
                bg: 'bg-amber-50/70 dark:bg-amber-500/10',
                leftBar: 'border-l-amber-500',
                iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
                icon: <AlertTriangle className="h-5 w-5" />,
                label: 'Field mismatch',
                labelClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
            }
        }
        return {
            border: 'border-info/40',
            bg: 'bg-info/5 dark:bg-info/10',
            leftBar: 'border-l-info',
            iconBg: 'bg-info/15 text-info',
            icon: <PackageSearch className="h-5 w-5" />,
            label: 'Inventory suggestion',
            labelClass: 'bg-info/15 text-info',
        }
    })()

    const innerPanel = 'bg-zinc-50/70 dark:bg-zinc-800/60 border border-border rounded-xl p-3'

    return (
        <div
            className={`
                border-2 border-l-4 rounded-2xl p-4 transition-all duration-300 flex flex-col
                ${theme.border} ${theme.bg} ${theme.leftBar}
            `}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                    {theme.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.labelClass}`}>
                            {theme.label}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                            AI confidence {discrepancy.confidence}%
                        </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{discrepancy.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{discrepancy.context}</p>
                </div>
            </div>

            {/* Current → Suggested */}
            <div className="flex-1 space-y-2">
                <div className={innerPanel}>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{discrepancy.current.label}</div>
                    <div className="text-xs text-foreground">{discrepancy.current.value}</div>
                </div>
                <div className="flex items-center justify-center">
                    <ArrowRight className={`h-3.5 w-3.5 ${isField ? 'text-amber-600 dark:text-amber-400' : 'text-info'}`} />
                </div>
                <div className={`${innerPanel} ${isField ? 'border-amber-200 dark:border-amber-500/30' : 'border-info/30'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className={`h-3 w-3 ${isField ? 'text-amber-600 dark:text-amber-400' : 'text-info'}`} />
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isField ? 'text-amber-700 dark:text-amber-400' : 'text-info'}`}>
                            {discrepancy.suggestion.label}
                        </div>
                    </div>
                    <div className="text-xs text-foreground">{discrepancy.suggestion.value}</div>
                </div>
            </div>

            {/* Impact */}
            {discrepancy.impact && (
                <div className="mt-3 pt-3 border-t border-current/10 flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {discrepancy.impact.label}
                    </span>
                    <span
                        className={`text-xl font-bold tabular-nums ${
                            discrepancy.impact.tone === 'positive' ? 'text-success'
                            : discrepancy.impact.tone === 'negative' ? 'text-amber-600 dark:text-amber-400'
                            : 'text-foreground'
                        }`}
                    >
                        {discrepancy.impact.tone === 'positive' ? '−' : discrepancy.impact.tone === 'negative' ? '+' : ''}
                        ${discrepancy.impact.amount.toLocaleString()}
                    </span>
                </div>
            )}

            {/* Actions */}
            {status === 'pending' ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                        onClick={() => onChange('dismissed')}
                        className="px-2 py-2 text-xs font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={() => onChange('dismissed')}
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        {discrepancy.reviewLabel ?? 'Review'}
                    </button>
                    <button
                        onClick={() => onChange('accepted')}
                        className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Check className="h-3.5 w-3.5" />
                        {discrepancy.actionLabel}
                    </button>
                </div>
            ) : (
                <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                        {status === 'accepted' ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                <span className="truncate">
                                    {isField ? 'CAP total adopted' : 'Swap applied to budget'}
                                </span>
                            </>
                        ) : (
                            <>
                                <X className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">Dismissed · kept as parsed</span>
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
