// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Pricing Waterfall
// Phase 13 + Refinement Phase 3 of WRG Demo v6 implementation
//
// Modal that animates the final-proposal price breakdown one row at a time:
//   Product List → JPS Contract -x% → Product Net → Labor → Freight → Total
// Numbers are derived from the live estimate + contract constants instead
// of being hard-coded, so the user can see w2.1 edits ripple through.
//
// After the total lands, a dealer selector + 'Send for Review' CTA is
// revealed. Picking a dealer and clicking Send calls onSendForReview(id).
// ═══════════════════════════════════════════════════════════════════════════════

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
    TransitionChild,
} from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Receipt, X } from 'lucide-react'
import { clsx } from 'clsx'
import type { DealerOption } from './mockData'

interface PricingWaterfallProps {
    isOpen: boolean
    onClose: () => void
    onSendForReview: (dealerId: string) => void
    productList: number
    discount: number
    labor: number
    freight: number
    dealers: DealerOption[]
}

type RowType = 'base' | 'discount' | 'subtotal' | 'addon' | 'total'

interface WaterfallRow {
    label: string
    value: number
    display: string
    type: RowType
}

const ROW_STEP_MS = 700

const ROW_STYLES: Record<RowType, string> = {
    base:     'bg-muted/40',
    discount: 'bg-green-500/5 dark:bg-green-500/10 border border-green-500/20',
    subtotal: 'bg-green-500/10 dark:bg-green-500/15 border border-green-500/30',
    addon:    'bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20',
    total:    'bg-primary/5 dark:bg-primary/10 border-2 border-primary/40',
}

const TEXT_STYLES: Record<RowType, string> = {
    base:     'text-foreground',
    discount: 'text-green-700 dark:text-green-400',
    subtotal: 'text-green-700 dark:text-green-400',
    addon:    'text-blue-700 dark:text-blue-400',
    total:    'text-foreground',
}

function formatMoney(n: number, { signed = false } = {}): string {
    const abs = Math.abs(Math.round(n))
    const body = abs.toLocaleString('en-US')
    if (signed && n < 0) return `-$${body}`
    if (signed && n > 0) return `+$${body}`
    return `$${body}`
}

export default function PricingWaterfall({
    isOpen,
    onClose,
    onSendForReview,
    productList,
    discount,
    labor,
    freight,
    dealers,
}: PricingWaterfallProps) {
    const [visibleRows, setVisibleRows] = useState(0)
    const [selectedDealerId, setSelectedDealerId] = useState<string>(
        dealers[0]?.id ?? ''
    )

    // Derived waterfall rows (live from props)
    const discountAmount = productList * discount
    const productNet = productList - discountAmount
    const total = productNet + labor + freight
    const discountPct = Math.round(discount * 100)

    const rows: WaterfallRow[] = [
        { label: 'Product List',          value: productList,        display: formatMoney(productList),                       type: 'base' },
        { label: `JPS Contract -${discountPct}%`, value: -discountAmount,    display: formatMoney(-discountAmount, { signed: true }), type: 'discount' },
        { label: 'Product Net',           value: productNet,         display: formatMoney(productNet),                        type: 'subtotal' },
        { label: 'Labor',                 value: labor,              display: formatMoney(labor, { signed: true }),           type: 'addon' },
        { label: 'Freight',               value: freight,            display: formatMoney(freight, { signed: true }),         type: 'addon' },
        { label: 'Total Proposal',        value: total,              display: formatMoney(total),                             type: 'total' },
    ]

    // Replay the animation every time the modal opens
    useEffect(() => {
        if (!isOpen) {
            setVisibleRows(0)
            setSelectedDealerId(dealers[0]?.id ?? '')
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        for (let i = 0; i < rows.length; i++) {
            timers.push(setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_STEP_MS))
        }
        return () => timers.forEach(clearTimeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const done = visibleRows >= rows.length
    const selectedDealer =
        dealers.find((d) => d.id === selectedDealerId) ?? dealers[0]

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
                                        MillerKnoll quote · JPS contract discount · labor · freight
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
                                {rows.map((row, i) => {
                                    const visible = i < visibleRows
                                    const isTotal = row.type === 'total'
                                    return (
                                        <div
                                            key={row.label}
                                            className={clsx(
                                                ROW_STYLES[row.type],
                                                'flex items-center justify-between rounded-xl transition-all duration-500',
                                                isTotal ? 'px-5 py-4 mt-3' : 'px-4 py-3',
                                                visible
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-2'
                                            )}
                                        >
                                            <span
                                                className={clsx(
                                                    TEXT_STYLES[row.type],
                                                    isTotal
                                                        ? 'text-xs font-bold uppercase tracking-wider'
                                                        : 'text-xs font-medium'
                                                )}
                                            >
                                                {row.label}
                                            </span>
                                            <span
                                                className={clsx(
                                                    TEXT_STYLES[row.type],
                                                    isTotal
                                                        ? 'text-2xl font-black tabular-nums'
                                                        : 'text-sm font-bold tabular-nums'
                                                )}
                                            >
                                                {row.display}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer — dealer picker + Send CTA (revealed after the total lands) */}
                            <div
                                className={clsx(
                                    'flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20 transition-all duration-500',
                                    done
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-2 pointer-events-none'
                                )}
                            >
                                {/* Dealer picker */}
                                <Listbox
                                    value={selectedDealerId}
                                    onChange={setSelectedDealerId}
                                    disabled={!done}
                                >
                                    <div className="relative flex-1 min-w-0">
                                        <ListboxButton className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card dark:bg-zinc-900 border border-border hover:border-primary/60 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary">
                                            {selectedDealer && (
                                                <>
                                                    <img
                                                        src={selectedDealer.photo}
                                                        alt={selectedDealer.name}
                                                        className="w-7 h-7 rounded-full object-cover shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                            {selectedDealer.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                            {selectedDealer.role}
                                                        </p>
                                                    </div>
                                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
                                                </>
                                            )}
                                        </ListboxButton>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-150"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <ListboxOptions className="absolute bottom-full left-0 right-0 mb-2 z-20 overflow-hidden rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 focus:outline-none">
                                                {dealers.map((dealer) => (
                                                    <ListboxOption
                                                        key={dealer.id}
                                                        value={dealer.id}
                                                        className={({ focus }) =>
                                                            clsx(
                                                                'relative cursor-pointer select-none px-3 py-2 transition-colors flex items-center gap-2',
                                                                focus && 'bg-zinc-100 dark:bg-zinc-900'
                                                            )
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <img
                                                                    src={dealer.photo}
                                                                    alt={dealer.name}
                                                                    className="w-7 h-7 rounded-full object-cover shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                                                        {dealer.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                                                        {dealer.role}
                                                                    </p>
                                                                </div>
                                                                {dealer.badge && !selected && (
                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                                                                        {dealer.badge}
                                                                    </span>
                                                                )}
                                                                {selected && (
                                                                    <Check className="w-3.5 h-3.5 text-foreground dark:text-primary shrink-0" aria-hidden />
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Transition>
                                    </div>
                                </Listbox>

                                {/* Send CTA */}
                                <button
                                    onClick={() => onSendForReview(selectedDealerId)}
                                    disabled={!done || !selectedDealerId}
                                    className="shrink-0 flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Send for Review
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
