/**
 * COMPONENT: MBIOverviewPage
 * PURPOSE: Landing hub for the MBI demo. Shows the 4 AI flows as a chain
 *          (Design → Budget → Quotes → Accounting) with each card surfacing:
 *          protagonist, before/after, pain solved, and a jump CTA that routes
 *          the tour sidebar to the entry beat.
 *
 *          Also shows aggregate impact stats and the Phase 1 Pilot adoption
 *          note — the sequencing narrative (Kathy + Beth first, rest after)
 *          surfaces here too, not just inside each flow.
 *
 * USED BY: Navbar MBI → E2E Flow tab (default landing when the user clicks
 *          MBI without a demo tour active).
 */

import { useDemo } from '../../context/DemoContext'
import {
    Calculator, Receipt, FileText, Palette, ArrowRight, Sparkles,
    Clock, ShieldCheck, Award, Users, Building2, Network,
} from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { StatusBadge, type StatusTone } from '../shared'
import { MBI_TENANT } from '../../config/profiles/mbi-data'

interface FlowCard {
    number: number
    title: string
    persona: string
    personaRole: string
    personaInitials: string
    isPilot?: boolean
    pain: string
    outcome: string
    timeBefore: string
    timeAfter: string
    scenes: number
    entryStepId: string
    icon: React.ReactNode
    tint: 'ai' | 'primary' | 'success' | 'info'
}

const FLOWS: FlowCard[] = [
    {
        number: 1,
        title: 'Budget Builder',
        persona: 'Amanda Renshaw',
        personaRole: 'Account Manager',
        personaInitials: 'AR',
        pain: 'A week of manual SIF parsing + scenario building per opportunity',
        outcome: 'Parsed SIF, validated, Good/Better/Best ready, client PDF delivered',
        timeBefore: '1 week',
        timeAfter: '4 min',
        scenes: 6,
        entryStepId: 'm1.1',
        icon: <Calculator className="h-5 w-5" />,
        tint: 'primary',
    },
    {
        number: 2,
        title: 'Accounting AI',
        persona: 'Kathy Belleville',
        personaRole: 'Controller',
        personaInitials: 'KB',
        isPilot: true,
        pain: '4-hour morning reading every invoice, reconciling every PO, updating AR biweekly in Excel',
        outcome: '12 invoices pre-processed overnight, 2 exceptions reviewed, AR emails sent',
        timeBefore: '4 hours',
        timeAfter: '18 min',
        scenes: 4,
        entryStepId: 'm2.1',
        icon: <Receipt className="h-5 w-5" />,
        tint: 'ai',
    },
    {
        number: 3,
        title: 'Quotes AI',
        persona: 'Marcia Ludwig',
        personaRole: 'Director of PM · 3.5 PCs for 29 staff',
        personaInitials: 'ML',
        pain: '2 hours of manual SIF re-entry into CORE + 4 sequential audit loops per proposal',
        outcome: 'SIF auto-imported, audit loops collapsed to 1 AI + 1 human, proposal sent',
        timeBefore: '2 hours',
        timeAfter: '12 min',
        scenes: 4,
        entryStepId: 'm3.1',
        icon: <FileText className="h-5 w-5" />,
        tint: 'info',
    },
    {
        number: 4,
        title: 'Design AI',
        persona: 'Beth Gianino',
        personaRole: 'Designer · 8/10 trust',
        personaInitials: 'BG',
        isPilot: true,
        pain: '"Everything is blue, this one chair is green" — spec misses slip to the client',
        outcome: 'Scan 47 BOM items in 5 min · catch palette + finish + dimension + availability issues',
        timeBefore: 'manual · sometimes missed',
        timeAfter: '< 5 min',
        scenes: 3,
        entryStepId: 'm4.1',
        icon: <Palette className="h-5 w-5" />,
        tint: 'success',
    },
]

const TINT_MAP = {
    ai: { bg: 'bg-ai/10 dark:bg-ai/15', border: 'border-ai/30', icon: 'text-ai bg-ai/15', badge: 'bg-ai/15 text-ai' },
    primary: { bg: 'bg-primary/10 dark:bg-primary/15', border: 'border-primary/30', icon: 'text-zinc-900 dark:text-primary bg-primary/10', badge: 'bg-primary/15 text-zinc-900 dark:text-primary' },
    success: { bg: 'bg-success/10 dark:bg-success/15', border: 'border-success/30', icon: 'text-success bg-success/15', badge: 'bg-success/15 text-success' },
    info: { bg: 'bg-info/10 dark:bg-info/15', border: 'border-info/30', icon: 'text-info bg-info/15', badge: 'bg-info/15 text-info' },
}

export default function MBIOverviewPage() {
    const { steps, goToStep, isDemoActive } = useDemo()

    const jumpTo = (stepId: string) => {
        const idx = steps.findIndex(s => s.id === stepId)
        if (idx >= 0) goToStep(idx)
    }

    return (
        <MBIPageShell
            title="MBI · 4 AIs · one platform"
            subtitle={`${MBI_TENANT.name} · ${MBI_TENANT.hq} + ${MBI_TENANT.satellite} · ${MBI_TENANT.revenue} revenue · ${MBI_TENANT.manufacturerCount}+ manufacturers`}
            icon={<Network className="h-5 w-5" />}
            activeApp="mbi-overview"
        >
            {/* Pitch banner */}
            <div className="bg-gradient-to-br from-primary/5 to-ai/5 dark:from-primary/10 dark:to-ai/10 border border-primary/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/15 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        The thesis
                    </div>
                    <div className="text-base font-bold text-foreground mt-0.5">
                        4 AI modules, one chain · each step reduces the work of the next
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Downstream cleanup is expensive. MBI's AI story is <strong className="text-foreground">preventing work from piling up</strong>:
                        Design catches issues at the source · Budget formalizes the spec · Quotes converts without re-keying · Accounting processes what comes back. Every module feeds the next.
                    </div>
                </div>
            </div>

            {/* Aggregate impact stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ImpactStat icon={<Clock className="h-4 w-4" />} value="1 week → 4 min" sub="Amanda · budget turnaround" accent="text-success" />
                <ImpactStat icon={<ShieldCheck className="h-4 w-4" />} value="$18,560" sub="caught by AI · one deal" accent="text-success" />
                <ImpactStat icon={<Users className="h-4 w-4" />} value="2 pilots" sub="Phase 1 · Kathy + Beth" accent="text-ai" />
                <ImpactStat icon={<Award className="h-4 w-4" />} value="9.08/10" sub="Q10 spec check priority" accent="text-zinc-900 dark:text-primary" />
            </div>

            {/* Tour CTA when the demo is inactive */}
            {!isDemoActive && (
                <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Walk the whole story · 16 tour beats</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Start from Amanda's new opportunity, hand off to Kathy's morning, then the PC team, then close upstream with Beth's pilot.
                        </div>
                    </div>
                    <button
                        onClick={() => jumpTo('m1.1')}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start from Flow 1
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* 4-flow chain */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">The chain</div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[10px] text-muted-foreground">Design → Budget → Quotes → Accounting · the loop that closes</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FLOWS.map(flow => (
                        <FlowCardView key={flow.entryStepId} flow={flow} onLaunch={() => jumpTo(flow.entryStepId)} />
                    ))}
                </div>
            </div>

            {/* Adoption sequencing callout */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-ai uppercase tracking-wider">
                        Phase 1 · pilot before rollout
                    </div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                        Deploy to the 8/10, not the 1/10
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        MBI's AI-trust scores vary wildly (design team Q4 avg <strong className="text-foreground">3.3/10</strong>, Carrie at 1/10).
                        Rogers Diffusion says start with the early adopters — <strong className="text-foreground">Kathy Belleville</strong> (8/10, Controller) and
                        <strong className="text-foreground"> Beth Gianino</strong> (8/10, Designer). Their visible wins unlock team-wide adoption in Phase 2.
                    </div>
                </div>
            </div>
        </MBIPageShell>
    )
}

function FlowCardView({ flow, onLaunch }: { flow: FlowCard; onLaunch: () => void }) {
    const tint = TINT_MAP[flow.tint]
    return (
        <div className={`border rounded-2xl p-4 flex flex-col gap-3 ${tint.bg} ${tint.border}`}>
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tint.icon}`}>
                    {flow.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge label={`Flow ${flow.number}`} tone={flow.tint as StatusTone} size="xs" />
                        <span className="text-[9px] text-muted-foreground">{flow.scenes} scenes</span>
                    </div>
                    <div className="text-base font-bold text-foreground leading-tight mt-0.5">{flow.title}</div>
                </div>
            </div>

            {/* Persona row */}
            <div className="flex items-center gap-2.5 bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${tint.icon}`}>
                    {flow.personaInitials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">{flow.persona}</span>
                        {flow.isPilot && (
                            <StatusBadge
                                label="Phase 1 Pilot"
                                tone="ai"
                                size="xs"
                                icon={<Award className="h-2.5 w-2.5" />}
                            />
                        )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{flow.personaRole}</div>
                </div>
            </div>

            {/* Pain → Outcome */}
            <div className="space-y-1.5">
                <div className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Before</div>
                    <div className="text-[11px] text-foreground leading-snug">{flow.pain}</div>
                </div>
                <div className="bg-background/60 dark:bg-zinc-900/40 border border-border rounded-lg p-2.5">
                    <div className="text-[9px] font-bold text-success uppercase tracking-wider mb-0.5">With Strata</div>
                    <div className="text-[11px] text-foreground leading-snug">{flow.outcome}</div>
                </div>
            </div>

            {/* Time strip + CTA */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/10">
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground line-through">{flow.timeBefore}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-success font-bold">{flow.timeAfter}</span>
                </div>
                <button
                    onClick={onLaunch}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 shadow-sm ${tint.badge}`}
                >
                    Start Flow {flow.number}
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}

function ImpactStat({
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
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-3">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-base font-bold tabular-nums leading-none truncate">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}
