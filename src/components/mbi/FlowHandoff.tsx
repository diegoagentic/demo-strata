/**
 * COMPONENT: FlowHandoff
 * PURPOSE: Narrative bridge from Flow 1 (Budget Builder, Amanda) to Flow 2
 *          (Accounting AI, Kathy). Renders after the user clicks "Send to
 *          client" in the final OutputStep — converts the emotional peak of
 *          successful delivery into a continuity cue: the AI platform keeps
 *          working even when Amanda's job is done.
 *
 *          Three blocks, in order:
 *            1. Recap stats — time saved, errors prevented, artifacts
 *            2. Downstream timeline — 5 nodes showing how the budget moves
 *               through all 4 MBI AI modules over the next 3 weeks
 *            3. Time-skip + invitation to Flow 2, with secondary jumps to
 *               Quotes AI (m3.1) and Design AI (m4.1)
 *
 * PROPS:
 *   - clientName: string            — e.g. "Enterprise Holdings"
 *   - preventedImpact: number       — aggregated $ prevented from validations
 *
 * DS TOKENS: bg-card · bg-success/5 · border-primary/30 · brand-300/500
 *
 * USED BY: OutputStep (after delivered === true)
 */

import { useDemo } from '../../context/DemoContext'
import {
    CheckCircle2, Clock, ShieldCheck, FileText, ArrowRight, Send,
    FileSignature, Package, Receipt, Palette, Calculator, Sparkles,
} from 'lucide-react'

interface FlowHandoffProps {
    clientName: string
    preventedImpact: number
}

export default function FlowHandoff({ clientName, preventedImpact }: FlowHandoffProps) {
    const { steps, goToStep, isDemoActive } = useDemo()

    const goToFlow = (stepId: string) => {
        const idx = steps.findIndex(s => s.id === stepId)
        if (idx >= 0) goToStep(idx)
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Success recap */}
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-base font-bold text-foreground">
                            Amanda's work here is done
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Budget delivered to {clientName}. Here's what Strata did for her on this deal.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <RecapStat
                        icon={<Clock className="h-4 w-4" />}
                        value="4 min"
                        sub="vs 1 week before"
                        accent="text-success"
                    />
                    <RecapStat
                        icon={<ShieldCheck className="h-4 w-4" />}
                        value={preventedImpact > 0 ? `$${preventedImpact.toLocaleString()}` : '—'}
                        sub="caught by AI"
                        accent="text-success"
                    />
                    <RecapStat
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        value="2"
                        sub="artifacts delivered"
                        accent="text-foreground"
                    />
                    <RecapStat
                        icon={<FileText className="h-4 w-4" />}
                        value="v1.0"
                        sub="logged in SharePoint"
                        accent="text-foreground"
                    />
                </div>
            </div>

            {/* 2. Downstream timeline */}
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">What happens next</div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[10px] text-muted-foreground">4 AI modules · one chain</div>
                </div>

                <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <TimelineNode
                        status="done"
                        icon={<Send className="h-3.5 w-3.5" />}
                        label="Budget sent"
                        caption="just now"
                        flow="Flow 1 · Budget Builder"
                    />
                    <TimelineNode
                        status="next"
                        icon={<FileSignature className="h-3.5 w-3.5" />}
                        label="Client approves"
                        caption="1–2 weeks"
                        flow="—"
                    />
                    <TimelineNode
                        status="future"
                        icon={<FileText className="h-3.5 w-3.5" />}
                        label="PO cut in CORE"
                        caption="Quotes AI auto-builds"
                        flow="Flow 3 · Quotes AI"
                    />
                    <TimelineNode
                        status="future"
                        icon={<Package className="h-3.5 w-3.5" />}
                        label="Orders placed"
                        caption="weeks of execution"
                        flow="—"
                    />
                    <TimelineNode
                        status="future"
                        icon={<Receipt className="h-3.5 w-3.5" />}
                        label="Invoices arrive"
                        caption="Kathy takes over"
                        flow="Flow 2 · Accounting AI"
                        highlight
                    />
                </ol>
            </div>

            {/* 3. Time skip + next-flow CTA */}
            <div className="bg-gradient-to-br from-primary/5 to-ai/5 dark:from-primary/10 dark:to-ai/10 border border-primary/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Fast forward · 3 weeks later
                        </div>
                        <div className="text-sm font-bold text-foreground leading-snug">
                            Construction is underway at {clientName}. Vendor invoices start flowing in.
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            HealthTrust contracts trigger royalty logic, non-EDI manufacturers need line-by-line reconciliation, and the AR aging report needs to stay live for leadership. That's where <strong className="text-foreground">Kathy Belleville</strong>, MBI's Controller, takes over.
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => goToFlow('m2.1')}
                        disabled={!isDemoActive}
                        title={isDemoActive ? undefined : 'Start the demo tour to enable flow navigation'}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Receipt className="h-4 w-4" />
                        <span>Continue to Accounting AI · Kathy's queue</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Or jump to</span>
                    <button
                        onClick={() => goToFlow('m3.1')}
                        disabled={!isDemoActive}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Calculator className="h-3 w-3" />
                        Quotes AI
                    </button>
                    <button
                        onClick={() => goToFlow('m4.1')}
                        disabled={!isDemoActive}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:border-primary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Palette className="h-3 w-3" />
                        Design AI
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Recap stat tile ─────────────────────────────────────────────────────────
function RecapStat({
    icon,
    value,
    sub,
    accent,
}: {
    icon: React.ReactNode
    value: string
    sub: string
    accent: string
}) {
    return (
        <div className="bg-zinc-50/60 dark:bg-zinc-800/60 border border-border rounded-xl p-3">
            <div className={`flex items-center gap-1.5 ${accent}`}>
                {icon}
                <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{sub}</div>
        </div>
    )
}

// ─── Timeline node ───────────────────────────────────────────────────────────
function TimelineNode({
    status,
    icon,
    label,
    caption,
    flow,
    highlight,
}: {
    status: 'done' | 'next' | 'future'
    icon: React.ReactNode
    label: string
    caption: string
    flow: string
    highlight?: boolean
}) {
    const isAIStep = flow !== '—'
    const theme = (() => {
        if (status === 'done') return {
            bg: 'bg-success/10 dark:bg-success/15 border-success/30',
            dotBg: 'bg-success text-white',
            labelColor: 'text-foreground',
        }
        if (highlight) return {
            bg: 'bg-ai/10 dark:bg-ai/15 border-ai/40 ring-2 ring-ai/20',
            dotBg: 'bg-ai text-white',
            labelColor: 'text-foreground',
        }
        if (status === 'next') return {
            bg: 'bg-muted/30 dark:bg-zinc-800/50 border-border',
            dotBg: 'bg-muted-foreground/30 text-muted-foreground',
            labelColor: 'text-foreground',
        }
        return {
            bg: 'bg-muted/20 dark:bg-zinc-800/30 border-border',
            dotBg: 'bg-muted text-muted-foreground',
            labelColor: 'text-muted-foreground',
        }
    })()

    return (
        <li className={`rounded-xl border p-3 flex flex-col gap-1.5 ${theme.bg}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${theme.dotBg}`}>
                {icon}
            </div>
            <div className={`text-xs font-bold leading-tight ${theme.labelColor}`}>{label}</div>
            <div className="text-[10px] text-muted-foreground">{caption}</div>
            {isAIStep && (
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${status === 'done' || highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {flow}
                </div>
            )}
        </li>
    )
}
