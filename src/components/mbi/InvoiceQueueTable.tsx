/**
 * COMPONENT: InvoiceQueueTable
 * PURPOSE: Kathy's morning inbox. Lists AP invoices pending processing,
 *          with OCR confidence, vendor, PO ref, amount, and visual flags
 *          for HealthTrust GPO (3% royalty) and exceptions requiring review.
 *
 * PROPS:
 *   - invoices: Invoice[]
 *   - selectedId?: string           — which row is selected (synced to detail panel)
 *   - onSelect: (id: string) => void
 *
 * STATES per row:
 *   - default — neutral
 *   - selected — primary border + muted bg
 *   - healthTrust — amber ribbon badge
 *   - exception — red left border + warning icon
 *
 * DS TOKENS: bg-card · border-border · text-foreground/muted · amber/red accents
 *
 * USED BY: MBIAccountingPage (Document AI section)
 */

import { AlertTriangle, Heart, FileText, Zap } from 'lucide-react'
import type { Invoice } from '../../config/profiles/mbi-data'

interface InvoiceQueueTableProps {
    invoices: Invoice[]
    selectedId?: string
    onSelect: (id: string) => void
}

export default function InvoiceQueueTable({ invoices, selectedId, onSelect }: InvoiceQueueTableProps) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header row */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-foreground">Morning invoice queue</div>
                        <div className="text-[10px] text-muted-foreground">
                            {invoices.length} invoices · AI extracted overnight · sorted by priority
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Legend color="bg-amber-500/20 text-amber-700 dark:text-amber-400" label="HealthTrust" />
                        <Legend color="bg-red-500/20 text-red-700 dark:text-red-400" label="Exception" />
                    </div>
                </div>
            </div>

            {/* Column header */}
            <div className="px-4 py-2 border-b border-border grid grid-cols-[minmax(120px,1.3fr)_1fr_0.8fr_0.8fr_0.9fr_0.6fr] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div>Vendor</div>
                <div>PO / Invoice</div>
                <div className="text-right">Amount</div>
                <div className="text-center">OCR</div>
                <div className="text-center">Flags</div>
                <div className="text-right">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
                {invoices.map(inv => {
                    const selected = inv.id === selectedId
                    return (
                        <button
                            key={inv.id}
                            onClick={() => onSelect(inv.id)}
                            className={`
                                w-full text-left grid grid-cols-[minmax(120px,1.3fr)_1fr_0.8fr_0.8fr_0.9fr_0.6fr] gap-3 px-4 py-2.5 items-center text-xs transition-colors
                                ${selected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30 border-l-2 border-l-transparent'}
                                ${inv.hasException ? 'border-l-red-500/60' : ''}
                            `}
                        >
                            {/* Vendor */}
                            <div className="min-w-0">
                                <div className="text-foreground font-semibold truncate">{inv.vendor}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{inv.id}</div>
                            </div>

                            {/* PO / Invoice */}
                            <div className="min-w-0">
                                <div className="text-foreground font-mono text-[11px] truncate">{inv.poNumber}</div>
                                <div className="text-[10px] text-muted-foreground">{new Date(inv.received).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>

                            {/* Amount */}
                            <div className="text-right font-bold text-foreground tabular-nums">${inv.amount.toLocaleString()}</div>

                            {/* OCR confidence */}
                            <div className="text-center">
                                <ConfidencePill value={inv.ocrConfidence} />
                            </div>

                            {/* Flags */}
                            <div className="flex items-center justify-center gap-1">
                                {inv.isEDI && (
                                    <span title="EDI" className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5">
                                        <Zap className="h-2.5 w-2.5" />
                                        EDI
                                    </span>
                                )}
                                {inv.isHealthTrust && (
                                    <span title="HealthTrust GPO · 3% royalty flagged" className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 inline-flex items-center gap-0.5">
                                        <Heart className="h-2.5 w-2.5" />
                                        HT
                                    </span>
                                )}
                                {inv.hasException && (
                                    <span title={inv.exceptionReason} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 inline-flex items-center gap-0.5">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        Fix
                                    </span>
                                )}
                            </div>

                            {/* Status */}
                            <div className="text-right">
                                {inv.hasException ? (
                                    <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Review</span>
                                ) : (
                                    <span className="text-[9px] font-bold text-success uppercase tracking-wider inline-flex items-center gap-0.5">
                                        <FileText className="h-2.5 w-2.5" />
                                        Auto
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${color}`}>{label}</span>
    )
}

function ConfidencePill({ value }: { value: number }) {
    const color = value >= 95 ? 'bg-success/10 text-success' : value >= 90 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${color}`}>{value}%</span>
    )
}
