/**
 * COMPONENT: QuoteIncomingBudget
 * PURPOSE: Flow 3 · Scene 0 — The approved Enterprise Holdings budget from
 *          Flow 1 lands in the PC team's queue. This is the narrative bridge
 *          that shows downstream continuity: Amanda's output = Marcia's input.
 *
 *          Hero = budget handoff card with Amanda→PC context + the Quote
 *          Readiness Gate (all 4 checks ✓ so PC can actually pick it up).
 *
 * DS TOKENS: bg-card · success/primary accents
 *
 * USED BY: MBIQuotesPage (wizard scene 0)
 */

import {
    FileSignature, ArrowRight, CheckCircle2, Clock, DollarSign,
    Building2, Layers, ShieldCheck,
} from 'lucide-react'
import QuoteReadinessGate from './QuoteReadinessGate'

export default function QuoteIncomingBudget() {
    return (
        <div className="space-y-4">
            {/* Handoff card — continuity with Flow 1 output */}
            <div className="bg-gradient-to-br from-success/5 to-primary/5 dark:from-success/10 dark:to-primary/10 border border-success/30 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                        <FileSignature className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-success uppercase tracking-wider">
                            Signed by client · ready for PC conversion
                        </div>
                        <div className="text-base font-bold text-foreground mt-0.5">
                            Enterprise Holdings · New HQ Floor 12
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Budget BDG-2026-002 · approved by Amanda Renshaw · signed by client last week
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <HandoffStat icon={<DollarSign className="h-4 w-4" />} value="$372.5K" sub="mid-range scenario · 35% markup" />
                    <HandoffStat icon={<Layers className="h-4 w-4" />} value="7" sub="line items from SIF" />
                    <HandoffStat icon={<ShieldCheck className="h-4 w-4" />} value="$18.5K" sub="prevented by validation" accent="text-success" />
                    <HandoffStat icon={<Clock className="h-4 w-4" />} value="4 min" sub="Amanda → signed delivery" />
                </div>
            </div>

            {/* Why this matters intro */}
            <div className="bg-muted/30 dark:bg-zinc-800 border border-border rounded-xl p-3 flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs">
                    <div className="font-bold text-foreground">
                        The biggest bottleneck at MBI: 3.5 PCs for 29 staff
                    </div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Every approved budget used to hit a wall here. A PC had to manually re-enter 24 fields into CORE,
                        run it through 4 sequential audit loops (internal → vendor → manager → client), and handle every
                        spec check by eye. That's ~2 hours per proposal. Strata collapses that.
                    </div>
                </div>
            </div>

            {/* Readiness gate — existing component, all checks pass */}
            <QuoteReadinessGate />

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    All 4 readiness checks passed. Next: watch Strata auto-import the SIF into CORE — <strong>zero keystrokes, 2 hours saved.</strong>
                </span>
            </div>
        </div>
    )
}

function HandoffStat({
    icon,
    value,
    sub,
    accent = 'text-foreground',
}: {
    icon: React.ReactNode
    value: string
    sub: string
    accent?: string
}) {
    return (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-border rounded-xl p-3">
            <div className={`flex items-center gap-1.5 ${accent}`}>
                {icon}
                <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}
