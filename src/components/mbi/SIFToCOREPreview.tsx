/**
 * COMPONENT: SIFToCOREPreview
 * PURPOSE: 3-column visualization of the auto-import that eliminates MBI's
 *          largest manual step — SIF re-entry into CORE by the PC team.
 *          Left: SIF source · Middle: AI extraction · Right: CORE proposal draft.
 *
 *          Shows arrows flowing left-to-right, 'AI auto-import' badge in middle.
 *
 * PROPS: none — uses hero SIF + proposal data from mock
 *
 * DS TOKENS: bg-card · border-border · ai (AI column) · primary (CORE output)
 *
 * USED BY: MBIQuotesPage
 */

import { FileCode2, Sparkles, FileText, ArrowRight, Check } from 'lucide-react'
import { getSIFSample, MBI_PROPOSALS } from '../../config/profiles/mbi-data'

export default function SIFToCOREPreview() {
    const sif = getSIFSample('SIF-ENTERPRISE-001')
    const proposal = MBI_PROPOSALS.find(p => p.budgetId === 'BDG-2026-002') ?? MBI_PROPOSALS[0]

    if (!sif) return null

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">SIF → CORE auto-import</div>
                        <div className="text-[10px] text-muted-foreground">
                            Eliminates largest manual step · PC shifts from builder to reviewer
                        </div>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-success uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Auto-built
                </span>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
                    {/* Column 1: SIF source */}
                    <div className="bg-muted/20 border border-border rounded-xl p-3 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SIF source</span>
                        </div>
                        <div className="text-xs font-bold text-foreground truncate">{sif.fileName}</div>
                        <div className="text-[10px] text-muted-foreground">CET v{sif.cetVersion}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{sif.fieldCount} fields · {sif.lineItems.length} line items</div>
                        <div className="mt-auto pt-2 border-t border-border text-[10px]">
                            <div className="font-semibold text-foreground">Gross value</div>
                            <div className="text-sm font-bold text-foreground tabular-nums">${sif.totals.grossValue.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="h-4 w-4 text-ai" />
                            <span className="text-[9px] font-bold text-ai uppercase tracking-wider">Auto</span>
                        </div>
                    </div>

                    {/* Column 2: AI extraction */}
                    <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-ai" />
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wider">AI extraction</span>
                        </div>
                        <div className="space-y-1">
                            <ExtractionRow label="Schema parsed" done />
                            <ExtractionRow label="Contract matched" done />
                            <ExtractionRow label="Customer context added" done />
                            <ExtractionRow label="Shipping params applied" done />
                            <ExtractionRow label="Line items mapped" done />
                        </div>
                        <div className="mt-auto pt-2 border-t border-ai/20 text-[10px]">
                            <div className="font-semibold text-foreground">Confidence</div>
                            <div className="text-sm font-bold text-ai tabular-nums">96%</div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary" />
                            <span className="text-[9px] font-bold text-zinc-900 dark:text-primary uppercase tracking-wider">Build</span>
                        </div>
                    </div>

                    {/* Column 3: CORE output */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileText className="h-3.5 w-3.5 text-zinc-900 dark:text-primary" />
                            <span className="text-[10px] font-bold text-zinc-900 dark:text-primary uppercase tracking-wider">CORE proposal</span>
                        </div>
                        <div className="text-xs font-bold text-foreground font-mono">{proposal.id}</div>
                        <div className="text-[10px] text-muted-foreground">Pending PC review</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {proposal.lineItemCount} line items · {proposal.manufacturers.length} vendors
                        </div>
                        <div className="mt-auto pt-2 border-t border-primary/20 text-[10px]">
                            <div className="font-semibold text-foreground">Ready for review</div>
                            <div className="text-[10px] text-muted-foreground">
                                Was: manual re-entry · Now: 1 click
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ExtractionRow({ label, done }: { label: string; done?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 text-[11px]">
            {done ? <Check className="h-3 w-3 text-ai" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground" />}
            <span className="text-foreground">{label}</span>
        </div>
    )
}
