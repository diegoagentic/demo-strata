/**
 * COMPONENT: MBIBudgetPage
 * PURPOSE: Budget Builder hero prototype — step-aware rendering of 4 sub-views
 *          driven by currentStep.id (m1.1 → m1.4). Between-demo (or outside of
 *          steps), shows the Queue view.
 *
 * STEP VIEWS:
 *   - m1.1 → IntakeView         : path selector stub (Design-Assisted vs Quick)
 *   - m1.2 → ParsingView        : SIF parsing + scenarios stub
 *   - m1.3 → ValidationView     : $18K hero moment stub
 *   - m1.4 → OutputView         : review + PDF delivery stub
 *   - other/none → QueueView    : 6 budget cards grid
 *
 * STATUS: Phase 0.D step-aware skeleton. Full wizard in Phase 2 (sub-phases 2.1-2.7).
 */

import { Calculator, Upload, Sparkles, AlertTriangle, FileCheck2, CheckCircle2, ArrowRight, Plus, Clock, DollarSign, TrendingUp } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import BudgetQueueKanban from './BudgetQueueKanban'
import { useDemo } from '../../context/DemoContext'
import {
    MBI_BUDGET_REQUESTS,
    getHeroBudget,
    HERO_VALIDATION,
    HERO_SCENARIOS,
    getSIFSample,
} from '../../config/profiles/mbi-data'

export default function MBIBudgetPage() {
    const { currentStep, isDemoActive } = useDemo()
    const stepId = isDemoActive ? currentStep?.id : null

    return (
        <MBIPageShell
            title="Budget Builder"
            subtitle="Hero prototype · 1 week → <24 hours · Amanda Renshaw (Account Manager)"
            icon={<Calculator className="h-5 w-5" />}
            activeApp="mbi-budget"
        >
            {stepId === 'm1.1' && <IntakeView />}
            {stepId === 'm1.2' && <ParsingView />}
            {stepId === 'm1.3' && <ValidationView />}
            {stepId === 'm1.4' && <OutputView />}
            {!['m1.1', 'm1.2', 'm1.3', 'm1.4'].includes(stepId ?? '') && <QueueView />}
        </MBIPageShell>
    )
}

// ─── Queue (default view) ─────────────────────────────────────────────────
function QueueView() {
    const approvedCount = MBI_BUDGET_REQUESTS.filter(b => b.status === 'approved').length
    const inFlightCount = MBI_BUDGET_REQUESTS.filter(b => b.status !== 'approved').length
    const totalValue = MBI_BUDGET_REQUESTS.reduce((sum, b) => sum + (b.total ?? b.budgetCeiling ?? 0), 0)
    const heroImpact = HERO_VALIDATION.estimatedImpact ?? 0

    return (
        <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    icon={<Clock className="h-4 w-4" />}
                    value={`${inFlightCount}`}
                    label="In flight"
                    accent="text-primary"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    value={`${approvedCount}`}
                    label="Approved"
                    accent="text-success"
                />
                <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    value={`$${(totalValue / 1_000_000).toFixed(2)}M`}
                    label="Total pipeline"
                    accent="text-foreground"
                />
                <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    value={`$${(heroImpact / 1000).toFixed(1)}K`}
                    label="Last error prevented"
                    accent="text-ai"
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                    Pipeline stages · Intake → AI Parsing → Validation → Review → Approved
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                    New Budget
                </button>
            </div>

            {/* Kanban */}
            <BudgetQueueKanban />

            <p className="text-xs text-muted-foreground italic text-center mt-4">
                Phase 2.1 · Queue complete. Launch the MBI demo tour to step through Amanda's 4-step Budget Builder flow.
            </p>
        </>
    )
}

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-2xl font-bold leading-none">{value}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">{label}</div>
        </div>
    )
}

// ─── Step m1.1 — Intake ───────────────────────────────────────────────────
function IntakeView() {
    const hero = getHeroBudget()
    return (
        <>
            <StepHeader id="m1.1" title="Intake — Design-Assisted path" icon={<Upload className="h-4 w-4" />} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border-2 border-primary ring-2 ring-primary/20 rounded-2xl p-6 space-y-3">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">✓ Selected</div>
                    <h3 className="text-base font-bold text-foreground">Design-Assisted</h3>
                    <p className="text-xs text-muted-foreground">Upload CET SIF export + CAP worksheet. Strata auto-parses structured data.</p>
                    <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                        <li>📎 EnterpriseHoldings_HQF12_SIF_v5.xml</li>
                        <li>📎 EnterpriseHoldings_CAP.xlsx</li>
                    </ul>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 space-y-3 opacity-50">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Budget</div>
                    <h3 className="text-base font-bold text-foreground">Salesperson-only path</h3>
                    <p className="text-xs text-muted-foreground">Manual form — space type, scope, contract, budget ceiling. No CET required.</p>
                </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-4 mt-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Intake summary</div>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><dt className="text-muted-foreground">Client</dt><dd className="font-bold text-foreground">{hero.client.name}</dd></div>
                    <div><dt className="text-muted-foreground">Project</dt><dd className="font-bold text-foreground">{hero.client.project}</dd></div>
                    <div><dt className="text-muted-foreground">Contract</dt><dd className="font-bold text-foreground">HNI Corporate · 55%</dd></div>
                    <div><dt className="text-muted-foreground">Budget ceiling</dt><dd className="font-bold text-foreground">${hero.budgetCeiling?.toLocaleString()}</dd></div>
                </dl>
            </div>
        </>
    )
}

// ─── Step m1.2 — Parsing + Scenarios ──────────────────────────────────────
function ParsingView() {
    const sif = getSIFSample('SIF-ENTERPRISE-001')
    return (
        <>
            <StepHeader id="m1.2" title="AI parsing + scenario generation" icon={<Sparkles className="h-4 w-4" />} />

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SIF parsed</div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{sif?.fileName}</span>
                    <span className="text-xs text-muted-foreground">{sif?.fieldCount} fields · {sif?.lineItems.length} line items</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {HERO_SCENARIOS.map(s => (
                    <div key={s.tier} className={`bg-card border rounded-2xl p-5 space-y-3 ${s.tier === 'better' ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.tier === 'good' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' : s.tier === 'better' ? 'bg-primary/20 text-primary' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                                {s.label}
                            </span>
                            {s.tier === 'better' && <span className="text-[10px] font-bold text-primary uppercase">⭐ Recommended</span>}
                        </div>
                        <div className="text-2xl font-bold text-foreground">${s.total.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{s.lineItemCount} items · markup {Math.round(s.markup * 100)}%</div>
                        {s.swaps.length > 0 && s.swaps[0].delta !== 0 && (
                            <div className="pt-2 border-t border-border space-y-1">
                                {s.swaps.slice(0, 2).map((swap, i) => (
                                    <div key={i} className="text-[11px] text-muted-foreground">
                                        <span>{swap.from}</span>
                                        <ArrowRight className="inline h-3 w-3 mx-1" />
                                        <span>{swap.to}</span>
                                        <span className={`ml-1 font-bold ${swap.delta < 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600'}`}>
                                            {swap.delta > 0 ? '+' : ''}${swap.delta.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}

// ─── Step m1.3 — AI Validation (⭐ $18K HERO MOMENT) ──────────────────────
function ValidationView() {
    return (
        <>
            <StepHeader id="m1.3" title="AI validation — $18K catch" icon={<AlertTriangle className="h-4 w-4" />} />

            <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-400 dark:border-red-500/50 rounded-2xl p-6 ring-4 ring-red-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20">
                                Critical
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                                AI confidence {HERO_VALIDATION.confidence}%
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground">{HERO_VALIDATION.field}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-card border border-border rounded-xl p-3">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Expected</div>
                                <div className="text-xs text-foreground">{HERO_VALIDATION.expected}</div>
                            </div>
                            <div className="bg-card border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Actual</div>
                                <div className="text-xs text-foreground">{HERO_VALIDATION.actual}</div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-3">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">AI suggestion</div>
                            <div className="text-xs text-foreground">{HERO_VALIDATION.aiSuggestion}</div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-red-200 dark:border-red-500/30">
                            <div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated impact prevented</div>
                                <div className="text-3xl font-bold text-red-600">
                                    +${HERO_VALIDATION.estimatedImpact?.toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                                    Override
                                </button>
                                <button className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                                    Accept swap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Step m1.4 — Review + Output ──────────────────────────────────────────
function OutputView() {
    const hero = getHeroBudget()
    const better = HERO_SCENARIOS.find(s => s.tier === 'better')!
    return (
        <>
            <StepHeader id="m1.4" title="Review + client delivery" icon={<FileCheck2 className="h-4 w-4" />} />

            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <div className="text-sm font-bold text-foreground">Budget approved — {hero.client.name}</div>
                    <div className="text-xs text-muted-foreground">Scenario: {better.label} · Total: ${better.total.toLocaleString()} · Markup: {Math.round(better.markup * 100)}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Excel breakdown</div>
                    <div className="aspect-[4/3] bg-muted/30 rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                        [ Excel preview mockup ]
                    </div>
                    <button className="w-full text-xs font-medium px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors">Download .xlsx</button>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Client summary PDF</div>
                    <div className="aspect-[4/3] bg-muted/30 rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                        [ MBI-branded PDF mockup ]
                    </div>
                    <button className="w-full text-xs font-bold px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">Send to Enterprise Holdings</button>
                </div>
            </div>

            <div className="text-center text-xs text-muted-foreground italic mt-4">
                Total time: ~4 minutes (was 1 week) · Handoff to Quotes AI ready
            </div>
        </>
    )
}

// ─── Shared step header ───────────────────────────────────────────────────
function StepHeader({ id, title, icon }: { id: string; title: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
            <span>Step {id}</span>
            <span>·</span>
            <span className="text-foreground normal-case">{title}</span>
        </div>
    )
}
