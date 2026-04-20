/**
 * COMPONENT: OutputStep
 * PURPOSE: Wizard step 6 — Output / Client Delivery. Shown after user approves
 *          the budget in Review step. Displays the generated artifacts (Excel
 *          breakdown + MBI-branded client PDF) with send/download CTAs, plus
 *          a downstream handoff badge (to Quotes AI Phase 4).
 *
 * PROPS:
 *   - client: { name, project }
 *   - scenarioLabel: string
 *   - total: number
 *   - markup: number
 *   - preventedImpact: number
 *
 * STATES:
 *   - default — artifacts visible, CTAs interactive
 *
 * MICROINTERACTIONS:
 *   - Mount animation: success banner slides down, previews fade in staggered
 *   - Click Download → toast (parent handles); click Send → slide-over (parent)
 *
 * DS TOKENS: bg-card · bg-success/5 · border-success/30 · border-primary/30
 *
 * USED BY: MBIBudgetPage (m1.4 second half after approval)
 */

import { CheckCircle2, Download, Send, FileSpreadsheet, FileText, ArrowRight, Sparkles } from 'lucide-react'

interface OutputStepProps {
    client: { name: string; project: string }
    scenarioLabel: string
    total: number
    markup: number
    preventedImpact: number
}

export default function OutputStep({ client, scenarioLabel, total, markup, preventedImpact }: OutputStepProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success banner */}
            <div className="bg-success/5 border border-success/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <div className="text-base font-bold text-foreground">
                        Budget approved · artifacts ready for client delivery
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {client.name} · {client.project} · Scenario: <span className="font-semibold text-foreground">{scenarioLabel}</span> · Total: <span className="font-bold text-foreground tabular-nums">${total.toLocaleString()}</span> · Markup <span className="font-bold text-foreground tabular-nums">{Math.round(markup * 100)}%</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total time</div>
                    <div className="text-xl font-bold text-success">~4 min</div>
                    <div className="text-[10px] text-muted-foreground">was 1 week</div>
                </div>
            </div>

            {/* Artifact previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ArtifactCard
                    icon={<FileSpreadsheet className="h-5 w-5" />}
                    label="Excel breakdown"
                    filename={`Budget_${client.name.replace(/\s+/g, '')}_v1.xlsx`}
                    description="Line-item detail with markup, freight, install, contingency. Internal audit log attached."
                    ctaLabel="Download .xlsx"
                    ctaIcon={<Download className="h-4 w-4" />}
                    mockStyle="excel"
                />
                <ArtifactCard
                    icon={<FileText className="h-5 w-5" />}
                    label="Client summary PDF"
                    filename={`${client.name}_BudgetSummary.pdf`}
                    description="MBI-branded executive summary. Good/Better/Best scenarios · selected tier highlighted · locked for client."
                    ctaLabel={`Send to ${client.name}`}
                    ctaIcon={<Send className="h-4 w-4" />}
                    ctaPrimary
                    mockStyle="pdf"
                />
            </div>

            {/* Error prevented reminder */}
            {preventedImpact > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-xs">
                        <div className="font-semibold text-foreground">Error prevention captured in audit log</div>
                        <div className="text-muted-foreground">
                            Strata caught and prevented <span className="font-bold text-success tabular-nums">${preventedImpact.toLocaleString()}</span> in potential errors before client delivery. Logged in SharePoint version trail.
                        </div>
                    </div>
                </div>
            )}

            {/* Handoff to Quotes */}
            <div className="bg-card border border-primary/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowRight className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                    <div className="font-semibold text-foreground">Ready to hand off to Quotes AI</div>
                    <div className="text-muted-foreground">
                        Approved budget is staged. When the client signs, a PC can convert it into a CORE proposal with the Quotes AI module — no manual SIF re-entry required.
                    </div>
                </div>
                <button className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors">
                    Handoff
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── Artifact preview card (internal) ────────────────────────────────────────
function ArtifactCard({
    icon,
    label,
    filename,
    description,
    ctaLabel,
    ctaIcon,
    ctaPrimary,
    mockStyle,
}: {
    icon: React.ReactNode
    label: string
    filename: string
    description: string
    ctaLabel: string
    ctaIcon: React.ReactNode
    ctaPrimary?: boolean
    mockStyle: 'excel' | 'pdf'
}) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${mockStyle === 'excel' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{filename}</div>
                </div>
            </div>

            {/* Mock preview */}
            <div className={`aspect-[4/3] m-3 rounded-xl border border-border overflow-hidden ${mockStyle === 'excel' ? 'bg-muted/40' : 'bg-white dark:bg-zinc-900'}`}>
                {mockStyle === 'excel' ? <ExcelMockup /> : <PDFMockup />}
            </div>

            {/* Description + CTA */}
            <div className="px-4 pb-4 space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
                <button
                    className={`
                        w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors
                        ${ctaPrimary
                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                            : 'bg-background border border-border text-foreground hover:bg-muted'
                        }
                    `}
                >
                    {ctaIcon}
                    {ctaLabel}
                </button>
            </div>
        </div>
    )
}

// ─── Mini Excel grid mockup ──────────────────────────────────────────────────
function ExcelMockup() {
    const rows = [
        { sku: 'ALS-FUR-PNL-60', qty: 45, price: '$920', total: '$41,400' },
        { sku: 'ALS-FUR-DSK-60', qty: 25, price: '$1,180', total: '$29,500' },
        { sku: 'ALS-SHA-DSK-72', qty: 20, price: '$1,485', total: '$29,700' },
        { sku: 'HON-IGN-TASK', qty: 42, price: '$425', total: '$17,850' },
        { sku: 'KNOLL-PROP-84', qty: 2, price: '$4,200', total: '$8,400' },
    ]
    return (
        <div className="h-full w-full text-[8px] font-mono p-2 overflow-hidden">
            <div className="grid grid-cols-[1fr_30px_40px_50px] gap-0 bg-success/20 text-foreground font-bold px-1 py-0.5 border-b border-success/40">
                <div>SKU</div><div className="text-right">Qty</div><div className="text-right">$/ea</div><div className="text-right">Total</div>
            </div>
            {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_30px_40px_50px] gap-0 px-1 py-0.5 border-b border-border/30 text-muted-foreground">
                    <div className="truncate">{r.sku}</div>
                    <div className="text-right tabular-nums">{r.qty}</div>
                    <div className="text-right tabular-nums">{r.price}</div>
                    <div className="text-right tabular-nums font-bold text-foreground">{r.total}</div>
                </div>
            ))}
            <div className="grid grid-cols-[1fr_80px_50px] gap-0 px-1 py-0.5 mt-1 border-t-2 border-border font-bold text-foreground">
                <div>Total</div><div></div><div className="text-right tabular-nums">$372,500</div>
            </div>
        </div>
    )
}

// ─── Mini PDF mockup ─────────────────────────────────────────────────────────
function PDFMockup() {
    return (
        <div className="h-full w-full p-3 text-[8px] text-zinc-900 dark:text-zinc-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-1">
                <div className="font-bold text-[9px]">MBI · Budget Summary</div>
                <div className="text-zinc-400">v1.0</div>
            </div>
            <div className="mt-2">
                <div className="font-bold text-[10px]">Enterprise Holdings</div>
                <div className="text-zinc-500 text-[7px]">New HQ Floor 12 · Corporate</div>
            </div>
            <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                    <span className="text-zinc-400">Good</span>
                    <span className="tabular-nums">$322K</span>
                </div>
                <div className="flex justify-between bg-primary/10 text-primary font-bold px-1 rounded">
                    <span>⭐ Mid-Range</span>
                    <span className="tabular-nums">$372K</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Premium</span>
                    <span className="tabular-nums">$418K</span>
                </div>
            </div>
            <div className="mt-auto text-[7px] text-zinc-400 italic">
                Prepared by Strata for MBI
            </div>
        </div>
    )
}
