/**
 * COMPONENT: ARStatusBoard
 * PURPOSE: AR Status Taxonomy dashboard — structured status for every AR record
 *          (pending approval / no response / committed-to-pay / escalated) instead
 *          of today's Outlook-dependent tracking. Live live AR view replaces the
 *          bi-weekly manual process for Kathy.
 *
 * PROPS:
 *   - records: ARRecord[]
 *
 * STATES per card:
 *   - escalated — red accent
 *   - no-response — amber accent
 *   - pending-approval — info accent (blue)
 *   - committed-to-pay — success accent (green)
 *
 * DS TOKENS: bg-card · border-border · red/amber/info/success
 *
 * USED BY: MBIAccountingPage (Phase 3.C)
 */

import { User, Calendar, AlertTriangle, Clock, Check, TrendingUp } from 'lucide-react'
import type { ARRecord } from '../../config/profiles/mbi-data'

const STATUS_META = {
    'escalated': {
        label: 'Escalated',
        accent: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-500/10',
        border: 'border-red-300 dark:border-red-500/30',
        pillBg: 'bg-red-100 dark:bg-red-500/20',
        leftBar: 'border-l-red-500',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    'no-response': {
        label: 'No response',
        accent: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50/50 dark:bg-amber-500/5',
        border: 'border-amber-300 dark:border-amber-500/30',
        pillBg: 'bg-amber-100 dark:bg-amber-500/20',
        leftBar: 'border-l-amber-500',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    'pending-approval': {
        label: 'Pending approval',
        accent: 'text-info',
        bg: 'bg-info/5',
        border: 'border-info/20',
        pillBg: 'bg-info/10',
        leftBar: 'border-l-info/60',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    'committed-to-pay': {
        label: 'Committed to pay',
        accent: 'text-success',
        bg: 'bg-success/5',
        border: 'border-success/20',
        pillBg: 'bg-success/10',
        leftBar: 'border-l-success/60',
        icon: <Check className="h-3.5 w-3.5" />,
    },
} as const

interface ARStatusBoardProps {
    records: ARRecord[]
}

export default function ARStatusBoard({ records }: ARStatusBoardProps) {
    const grouped: Record<keyof typeof STATUS_META, ARRecord[]> = {
        'escalated': records.filter(r => r.status === 'escalated'),
        'no-response': records.filter(r => r.status === 'no-response'),
        'pending-approval': records.filter(r => r.status === 'pending-approval'),
        'committed-to-pay': records.filter(r => r.status === 'committed-to-pay'),
    }

    const totalAR = records.reduce((acc, r) => acc + r.amount, 0)
    const committedTotal = grouped['committed-to-pay'].reduce((acc, r) => acc + r.amount, 0)

    return (
        <div className="space-y-3">
            {/* Summary banner */}
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-foreground">AR Status Taxonomy</div>
                    <div className="text-[10px] text-muted-foreground">
                        Replaces Outlook-dependent tracking · live status across {records.length} open records
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total AR</div>
                    <div className="text-lg font-bold text-foreground tabular-nums">${totalAR.toLocaleString()}</div>
                    <div className="text-[10px] text-success">
                        <TrendingUp className="inline h-2.5 w-2.5 mr-0.5" />
                        ${committedTotal.toLocaleString()} committed
                    </div>
                </div>
            </div>

            {/* 4 status columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map(statusKey => {
                    const meta = STATUS_META[statusKey]
                    const items = grouped[statusKey]
                    return (
                        <div key={statusKey} className={`border rounded-2xl overflow-hidden ${meta.border}`}>
                            <div className={`px-3 py-2.5 ${meta.bg} border-b ${meta.border}`}>
                                <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${meta.accent}`}>
                                        {meta.icon}
                                        <span>{meta.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${meta.pillBg} ${meta.accent}`}>
                                        {items.length}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-card p-2 space-y-1.5 max-h-80 overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="text-center text-[10px] text-muted-foreground py-4">—</div>
                                ) : (
                                    items.map(r => (
                                        <div
                                            key={r.id}
                                            className={`bg-zinc-50/50 dark:bg-zinc-800/40 border border-border rounded-lg border-l-4 ${meta.leftBar} px-2.5 py-2 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors`}
                                        >
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-bold text-foreground truncate pr-2">{r.client}</span>
                                                <span className="font-bold text-foreground tabular-nums shrink-0">${(r.amount / 1000).toFixed(0)}K</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span className="font-mono truncate">{r.poNumber}</span>
                                                <span className="shrink-0 ml-1">{r.daysPastDue}d past due</span>
                                            </div>
                                            {r.salesperson && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                    <User className="h-2.5 w-2.5" />
                                                    <span className="truncate">{r.salesperson}</span>
                                                    {r.lastContact && (
                                                        <>
                                                            <Calendar className="h-2.5 w-2.5 ml-1" />
                                                            <span>{r.lastContact}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
