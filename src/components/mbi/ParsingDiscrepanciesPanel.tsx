/**
 * COMPONENT: ParsingDiscrepanciesPanel
 * PURPOSE: Compact summary of parse-time issues with a "Review" CTA that
 *          opens a side sheet containing the full discrepancy cards. Keeps
 *          the wizard surface focused on the hero (extracted items + CTA)
 *          while triage detail stays one click away.
 *
 *          Two discrepancies supported for the hero demo:
 *            1. FIELD — declared SIF ceiling vs CAP override total.
 *            2. INVENTORY — cheaper in-stock match for a vendor-new line.
 *
 * PROPS:
 *   - discrepancies: ParsingDiscrepancy[]
 *   - statusById: Record<id, DiscrepancyStatus>
 *   - onStatusChange: (id, status) => void
 *
 * USED BY: ParsingStep (wizard step 1)
 */

import { useState } from 'react'
import {
    AlertTriangle, Sparkles, CheckCircle2, Check, X, PackageSearch,
    Eye, Scale, TrendingDown, TrendingUp, ChevronRight,
} from 'lucide-react'
import MBIDetailSheet from './MBIDetailSheet'

export type DiscrepancyStatus = 'pending' | 'accepted' | 'dismissed'

export interface ParsingDiscrepancy {
    id: string
    kind: 'field' | 'inventory'
    title: string
    context: string
    confidence: number
    current: { label: string; value: string }
    suggestion: { label: string; value: string }
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
        reviewLabel: 'Open reconciler',
    },
    {
        id: 'inventory-knoll-propeller',
        kind: 'inventory',
        title: 'Cheaper match in inventory',
        context: 'Knoll Propeller 84" is in Strata warehouse at a lower price.',
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
    const [sheetOpen, setSheetOpen] = useState(false)

    const total = discrepancies.length
    const resolved = discrepancies.filter(d => (statusById[d.id] ?? 'pending') !== 'pending').length
    const pending = total - resolved
    const savings = discrepancies
        .filter(d => statusById[d.id] === 'accepted' && d.impact?.tone === 'positive')
        .reduce((acc, d) => acc + (d.impact?.amount ?? 0), 0)
    const deviation = discrepancies
        .filter(d => (statusById[d.id] ?? 'pending') === 'pending' && d.impact?.tone === 'negative')
        .reduce((acc, d) => acc + (d.impact?.amount ?? 0), 0)

    const fieldCount = discrepancies.filter(d => d.kind === 'field').length
    const inventoryCount = discrepancies.filter(d => d.kind === 'inventory').length

    return (
        <>
            {/* Compact summary strip */}
            <div
                className={`
                    bg-card dark:bg-zinc-800/40 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3
                    ${pending > 0 ? 'border-amber-300 dark:border-amber-500/30' : 'border-success/30'}
                `}
            >
                <div className="flex items-start gap-3 min-w-0">
                    <div
                        className={`
                            h-9 w-9 rounded-xl flex items-center justify-center shrink-0
                            ${pending > 0
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-success/15 text-success'
                            }
                        `}
                    >
                        {pending > 0 ? <Scale className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground">
                            {pending > 0
                                ? `${pending} item${pending !== 1 ? 's' : ''} to review before scenarios`
                                : 'All discrepancies resolved'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {fieldCount} field mismatch · {inventoryCount} inventory suggestion · neither blocks advancement
                        </div>
                        {(savings > 0 || deviation > 0) && (
                            <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                                {deviation > 0 && (
                                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                        <TrendingUp className="h-3 w-3" />
                                        +${deviation.toLocaleString()} pending
                                    </span>
                                )}
                                {savings > 0 && (
                                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                                        <TrendingDown className="h-3 w-3" />
                                        −${savings.toLocaleString()} saved
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                        <div className="flex items-baseline gap-0.5 justify-end">
                            <span className="text-xl font-bold text-foreground tabular-nums">{resolved}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">/ {total}</span>
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">resolved</div>
                    </div>
                    <button
                        onClick={() => setSheetOpen(true)}
                        className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors
                            ${pending > 0
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                                : 'bg-background dark:bg-zinc-800 text-foreground border border-border hover:bg-muted'
                            }
                        `}
                    >
                        {pending > 0 ? 'Review items' : 'View details'}
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Sheet with the discrepancy cards */}
            <MBIDetailSheet
                isOpen={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Parse discrepancies"
                subtitle={`${pending} of ${total} pending · neither blocks advancement`}
                icon={<Scale className="h-4 w-4" />}
                width="md"
            >
                <div className="space-y-3">
                    {discrepancies.map(d => (
                        <DiscrepancyCard
                            key={d.id}
                            discrepancy={d}
                            status={statusById[d.id] ?? 'pending'}
                            onChange={s => onStatusChange(d.id, s)}
                        />
                    ))}
                </div>
            </MBIDetailSheet>
        </>
    )
}

// ─── Single discrepancy card (compact) ───────────────────────────────────────
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
                icon: <CheckCircle2 className="h-4 w-4" />,
                label: 'Applied',
                labelClass: 'bg-success/15 text-success',
            }
        }
        if (status === 'dismissed') {
            return {
                border: 'border-border',
                bg: 'bg-muted/30 dark:bg-zinc-800/40',
                leftBar: 'border-l-muted-foreground/40',
                iconBg: 'bg-muted text-muted-foreground',
                icon: <X className="h-4 w-4" />,
                label: 'Dismissed',
                labelClass: 'bg-muted text-muted-foreground',
            }
        }
        if (isField) {
            return {
                border: 'border-amber-300 dark:border-amber-500/40',
                bg: 'bg-amber-50/70 dark:bg-amber-500/10',
                leftBar: 'border-l-amber-500',
                iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
                icon: <AlertTriangle className="h-4 w-4" />,
                label: 'Field mismatch',
                labelClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
            }
        }
        return {
            border: 'border-info/40',
            bg: 'bg-info/5 dark:bg-info/10',
            leftBar: 'border-l-info',
            iconBg: 'bg-info/15 text-info',
            icon: <PackageSearch className="h-4 w-4" />,
            label: 'Inventory suggestion',
            labelClass: 'bg-info/15 text-info',
        }
    })()

    const innerPanel = 'bg-zinc-50/70 dark:bg-zinc-800/60 border border-border rounded-lg p-2.5 min-w-0'

    return (
        <div className={`border border-l-4 rounded-xl p-3 ${theme.border} ${theme.bg} ${theme.leftBar}`}>
            {/* Header */}
            <div className="flex items-start gap-2.5 mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                    {theme.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${theme.labelClass}`}>
                            {theme.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground">AI {discrepancy.confidence}%</span>
                    </div>
                    <div className="text-sm font-bold text-foreground leading-tight mt-0.5">{discrepancy.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{discrepancy.context}</div>
                </div>
                {discrepancy.impact && (
                    <div className="text-right shrink-0">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {discrepancy.impact.label}
                        </div>
                        <div
                            className={`text-lg font-bold tabular-nums leading-none mt-0.5 ${
                                discrepancy.impact.tone === 'positive' ? 'text-success'
                                : discrepancy.impact.tone === 'negative' ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                            }`}
                        >
                            {discrepancy.impact.tone === 'positive' ? '−' : discrepancy.impact.tone === 'negative' ? '+' : ''}
                            ${discrepancy.impact.amount.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Current | Suggested — side-by-side for width efficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={innerPanel}>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{discrepancy.current.label}</div>
                    <div className="text-xs text-foreground">{discrepancy.current.value}</div>
                </div>
                <div className={`${innerPanel} ${isField ? 'border-amber-200 dark:border-amber-500/30' : 'border-info/30'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                        <Sparkles className={`h-2.5 w-2.5 ${isField ? 'text-amber-600 dark:text-amber-400' : 'text-info'}`} />
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${isField ? 'text-amber-700 dark:text-amber-400' : 'text-info'}`}>
                            {discrepancy.suggestion.label}
                        </div>
                    </div>
                    <div className="text-xs text-foreground">{discrepancy.suggestion.value}</div>
                </div>
            </div>

            {/* Actions */}
            {status === 'pending' ? (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <button
                        onClick={() => onChange('dismissed')}
                        className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={() => onChange('dismissed')}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                        <Eye className="h-3 w-3" />
                        {discrepancy.reviewLabel ?? 'Review'}
                    </button>
                    <button
                        onClick={() => onChange('accepted')}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-md hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Check className="h-3 w-3" />
                        {discrepancy.actionLabel}
                    </button>
                </div>
            ) : (
                <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                        {status === 'accepted' ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                <span className="truncate">{isField ? 'CAP total adopted' : 'Swap applied'}</span>
                            </>
                        ) : (
                            <>
                                <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
