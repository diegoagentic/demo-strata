// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Pricing Waterfall
// Phase 13 of WRG Demo v6 implementation
//
// Modal that animates the final-proposal price breakdown one row at a time:
//   Product List → JPS Contract -38% → Product Net → Labor → Freight → Total
// When the animation lands on Total, a "Select Dealer" CTA appears so the
// expert (w2.3) can send the proposal to Sara for review (w2.4).
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { ArrowRight, Receipt, X } from 'lucide-react'

interface PricingWaterfallProps {
    isOpen: boolean
    onClose: () => void
    onSendForReview: () => void
}

type RowType = 'base' | 'discount' | 'subtotal' | 'addon' | 'total'

interface WaterfallRow {
    label: string
    value: string
    type: RowType
}

const ROWS: WaterfallRow[] = [
    { label: 'Product List',        value: '$287,450', type: 'base' },
    { label: 'JPS Contract -38%',   value: '-$109,231', type: 'discount' },
    { label: 'Product Net',         value: '$178,219', type: 'subtotal' },
    { label: 'Labor (15% margin)',  value: '$17,685',  type: 'addon' },
    { label: 'Freight',             value: '$6,234',   type: 'addon' },
    { label: 'Total Proposal',      value: '$202,138', type: 'total' },
]

const ROW_STEP_MS = 700

const ROW_STYLES: Record<RowType, string> = {
    base:     'bg-card border border-border',
    discount: 'bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20',
    subtotal: 'bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30',
    addon:    'bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20',
    total:    'bg-brand-50 dark:bg-brand-500/5 border-2 border-brand-400 dark:border-brand-500/40',
}

const TEXT_STYLES: Record<RowType, string> = {
    base:     'text-foreground',
    discount: 'text-green-700 dark:text-green-400',
    subtotal: 'text-green-700 dark:text-green-400',
    addon:    'text-blue-700 dark:text-blue-400',
    total:    'text-foreground',
}

export default function PricingWaterfall({
    isOpen,
    onClose,
    onSendForReview,
}: PricingWaterfallProps) {
    const [visibleRows, setVisibleRows] = useState(0)

    // Replay the animation every time the modal opens
    useEffect(() => {
        if (!isOpen) {
            setVisibleRows(0)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        for (let i = 0; i < ROWS.length; i++) {
            timers.push(setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_STEP_MS))
        }
        return () => timers.forEach(clearTimeout)
    }, [isOpen])

    const done = visibleRows >= ROWS.length

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-xl bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Quote Assembly
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        MillerKnoll product quote · JPS contract discount · labor · freight
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Waterfall rows */}
                            <div className="p-6 space-y-2">
                                {ROWS.map((row, i) => {
                                    const visible = i < visibleRows
                                    const isTotal = row.type === 'total'
                                    return (
                                        <div
                                            key={row.label}
                                            className={[
                                                ROW_STYLES[row.type],
                                                'flex items-center justify-between rounded-xl transition-all duration-500',
                                                isTotal ? 'px-5 py-4 mt-3' : 'px-4 py-3',
                                                visible
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-2',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={[
                                                    TEXT_STYLES[row.type],
                                                    isTotal
                                                        ? 'text-xs font-bold uppercase tracking-wider'
                                                        : 'text-xs font-medium',
                                                ].join(' ')}
                                            >
                                                {row.label}
                                            </span>
                                            <span
                                                className={[
                                                    TEXT_STYLES[row.type],
                                                    isTotal
                                                        ? 'text-2xl font-black tabular-nums'
                                                        : 'text-sm font-bold tabular-nums',
                                                ].join(' ')}
                                            >
                                                {row.value}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer CTA (appears once the waterfall lands on Total) */}
                            <div
                                className={[
                                    'flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 transition-opacity duration-500',
                                    done ? 'opacity-100' : 'opacity-0 pointer-events-none',
                                ].join(' ')}
                            >
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onSendForReview}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    Select Dealer
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
