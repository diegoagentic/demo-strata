// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Financial Summary Hero
// Phase 5 of WRG Demo v6 implementation
//
// Dark hero card: Final Quote Price (left) · 4 metrics (center) · Generate
// Proposal CTA (right). Numbers come from calculateInstall() — this component
// is a pure presenter.
// ═══════════════════════════════════════════════════════════════════════════════

import { ArrowRight, Receipt } from 'lucide-react'
import type { EstimateResult } from './types'

interface FinancialSummaryHeroProps {
    estimate: EstimateResult
    onGenerateProposal: () => void
}

function formatMoney(raw: string): string {
    const n = parseFloat(raw)
    if (Number.isNaN(n)) return '0'
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatHours(raw: string): string {
    const n = parseFloat(raw)
    if (Number.isNaN(n)) return '0'
    return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export default function FinancialSummaryHero({
    estimate,
    onGenerateProposal,
}: FinancialSummaryHeroProps) {
    const salesPrice = formatMoney(estimate.salesPrice)
    const baseCost = formatMoney(estimate.totalCost)
    const margin = formatMoney(estimate.grossMargin)
    const marginPct = (() => {
        const sp = parseFloat(estimate.salesPrice)
        const gm = parseFloat(estimate.grossMargin)
        if (!sp) return '0'
        return ((gm / sp) * 100).toFixed(0)
    })()

    return (
        <div className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl border-l-4 border-brand-500 shadow-lg p-6 text-white overflow-hidden">
            <div className="flex items-center gap-6">

                {/* Left: Final Quote Price */}
                <div className="shrink-0">
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">
                        Final Quote Price
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl text-zinc-400">$</span>
                        <span className="text-4xl font-bold tracking-tight text-white">
                            {salesPrice}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-16 bg-zinc-800 shrink-0" />

                {/* Center: 4 metrics */}
                <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Base Cost</p>
                        <p className="text-lg font-semibold text-white">
                            ${baseCost}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">
                            Margin ({marginPct}%)
                        </p>
                        <p className="text-lg font-semibold text-brand-400">
                            ${margin}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Total Hours</p>
                        <p className="text-lg font-semibold text-white">
                            {formatHours(estimate.totalHours)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">
                            Crew Requirement
                        </p>
                        <p className="text-lg font-semibold text-white">
                            {estimate.crewSize}
                            <span className="text-xs font-normal text-zinc-400 ml-1">
                                installers
                            </span>
                        </p>
                    </div>
                </div>

                {/* Right: Generate Proposal CTA */}
                <button
                    onClick={onGenerateProposal}
                    className="shrink-0 flex items-center gap-2 bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                    <Receipt className="w-4 h-4" />
                    Generate Proposal
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
