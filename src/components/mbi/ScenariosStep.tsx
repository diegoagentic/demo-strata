/**
 * COMPONENT: ScenariosStep
 * PURPOSE: Full interactive view for wizard step 3 (Scenarios). Composes
 *          ScenarioComparisonCards + MarkupSlider + live PricingBreakdown.
 *
 *          When the user selects a scenario + tweaks markup, the pricing
 *          breakdown (subtotal/freight/install/contingency/total) recomputes
 *          in real time.
 *
 * PROPS:
 *   - scenarios: Scenario[]
 *   - selectedTier: ScenarioTier | null
 *   - onSelectTier: (tier) => void
 *   - markupOverrides: Record<ScenarioTier, number>
 *   - onMarkupChange: (tier, v) => void
 *
 * STATES: controlled
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl
 *
 * USED BY: MBIBudgetPage (standalone for wizard step 2, or embedded after
 *          ParsingView completes in m1.2).
 */

import { DollarSign } from 'lucide-react'
import ScenarioComparisonCards from './ScenarioComparisonCards'
import MarkupSlider from './MarkupSlider'
import type { Scenario, ScenarioTier } from '../../config/profiles/mbi-data'

interface ScenariosStepProps {
    scenarios: Scenario[]
    selectedTier: ScenarioTier | null
    onSelectTier: (tier: ScenarioTier) => void
    markupOverrides: Partial<Record<ScenarioTier, number>>
    onMarkupChange: (tier: ScenarioTier, v: number) => void
}

export default function ScenariosStep({
    scenarios,
    selectedTier,
    onSelectTier,
    markupOverrides,
    onMarkupChange,
}: ScenariosStepProps) {
    const selected = scenarios.find(s => s.tier === selectedTier) ?? null
    const markupValue = selected ? markupOverrides[selected.tier] ?? selected.markup : 0.35

    return (
        <div className="space-y-5">
            {/* Intro */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-3">
                <div className="text-ai">🤖</div>
                <span>
                    Strata generated 3 scenarios automatically from the parsed SIF. Select one and fine-tune the markup before handing off.
                </span>
            </div>

            {/* 3-card comparison */}
            <ScenarioComparisonCards
                scenarios={scenarios}
                selected={selectedTier}
                onSelect={onSelectTier}
                markupAdjustment={markupOverrides}
            />

            {/* Markup + breakdown (visible when a scenario is selected) */}
            {selected && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="lg:col-span-2">
                        <MarkupSlider
                            value={markupValue}
                            onChange={v => onMarkupChange(selected.tier, v)}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <PricingBreakdown scenario={selected} markup={markupValue} />
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Internal: Pricing Breakdown ──────────────────────────────────────────
function PricingBreakdown({ scenario, markup }: { scenario: Scenario; markup: number }) {
    // Proportional recalc: scale total by markup ratio
    const markupFactor = (1 + markup) / (1 + scenario.markup)
    const subtotal = Math.round(scenario.subtotal * markupFactor)
    const freight = Math.round(scenario.freight * markupFactor)
    const install = Math.round(scenario.install * markupFactor)
    const contingency = Math.round(scenario.contingency * markupFactor)
    const total = subtotal + freight + install + contingency

    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">
                            Pricing breakdown — {scenario.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Live · updates as you tune markup
                        </div>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Budget-grade
                </span>
            </div>

            <dl className="space-y-1.5 text-sm">
                <Row label="Subtotal (incl. markup)" value={subtotal} />
                <Row label="Freight (10% of net)" value={freight} muted />
                <Row label="Install (12% non-union)" value={install} muted />
                <Row label="Contingency buffer" value={contingency} muted />
                <div className="pt-2 mt-2 border-t border-border">
                    <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-bold text-foreground tabular-nums">
                            ${total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </dl>
        </div>
    )
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className={`text-xs ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</dt>
            <dd className={`text-sm font-semibold tabular-nums ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
                ${value.toLocaleString()}
            </dd>
        </div>
    )
}
