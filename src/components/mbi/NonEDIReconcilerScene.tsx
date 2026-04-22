/**
 * COMPONENT: NonEDIReconcilerScene
 * PURPOSE: Flow 2 · Scene 3 — Line-by-line reconciliation for non-EDI vendors.
 *          Shows the Herman Miller exception flagged in the morning queue
 *          (quantity mismatch: PO 6, invoice 5). Kathy approves each line,
 *          overrides with a reason, or flags for vendor contact.
 *
 *          Uses the same action grammar as ValidationStep: per-row Accept /
 *          Override, with MBIReasonModal for explicit override reasons.
 *
 * DS TOKENS: bg-card · info/success accents for diffs
 *
 * USED BY: MBIAccountingPage (wizard scene 2)
 */

import { useState } from 'react'
import {
    GitCompare, Check, X, Pencil, ArrowRight, CheckCircle2,
    AlertTriangle, Package, Mail, Sparkles,
} from 'lucide-react'
import { ReasonDialog as MBIReasonModal, StatusBadge } from '../shared'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'

interface LineRow {
    id: string
    line: string
    sku: string
    desc: string
    poQty: number
    invQty: number
    poUnitPrice: number
    invUnitPrice: number
    match: 'ok' | 'qty' | 'price'
}

const LINES: LineRow[] = [
    { id: 'L-01', line: 'L-01', sku: 'HM-AERON-A', desc: 'Aeron chair · graphite', poQty: 2, invQty: 2, poUnitPrice: 1420, invUnitPrice: 1420, match: 'ok' },
    { id: 'L-02', line: 'L-02', sku: 'HM-EMB-LNG', desc: 'Embody lounge', poQty: 1, invQty: 1, poUnitPrice: 2480, invUnitPrice: 2480, match: 'ok' },
    { id: 'L-03', line: 'L-03', sku: 'HM-JARVIS-DSK', desc: 'Jarvis desk 60×30', poQty: 6, invQty: 5, poUnitPrice: 1180, invUnitPrice: 1180, match: 'qty' },
    { id: 'L-04', line: 'L-04', sku: 'HM-FIN-OAK', desc: 'Oak veneer finish upcharge', poQty: 6, invQty: 5, poUnitPrice: 85, invUnitPrice: 95, match: 'price' },
    { id: 'L-05', line: 'L-05', sku: 'HM-FRT-INB', desc: 'Inbound freight', poQty: 1, invQty: 1, poUnitPrice: 420, invUnitPrice: 420, match: 'ok' },
]

const OVERRIDE_CATEGORIES = [
    { id: 'vendor-confirmed', label: 'Vendor confirmed change' },
    { id: 'partial-ship', label: 'Partial shipment — accept short' },
    { id: 'price-amendment', label: 'Pricing amendment approved' },
    { id: 'other', label: 'Other (describe below)' },
]

type RowStatus = 'pending' | 'accepted' | 'overridden' | 'flagged'

export default function NonEDIReconcilerScene() {
    const invoice = MBI_INVOICES.find(i => i.id === 'INV-0484')!  // Herman Miller exception
    const [statuses, setStatuses] = useState<Record<string, RowStatus>>({})
    const [metaById, setMetaById] = useState<Record<string, { reasonCategory?: string; notes?: string }>>({})
    const [modalRow, setModalRow] = useState<LineRow | null>(null)
    const [toast, setToast] = useState<{ id: string; message: string; tone: 'success' | 'info' | 'neutral' } | null>(null)

    const pushToast = (id: string, tone: 'success' | 'info' | 'neutral', message: string) => {
        setToast({ id, tone, message })
        setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 3500)
    }

    const setRowStatus = (row: LineRow, s: RowStatus) => setStatuses(prev => ({ ...prev, [row.id]: s }))

    const handleAccept = (row: LineRow) => {
        setRowStatus(row, 'accepted')
        const label = row.match === 'qty' ? 'Short-shipped accepted' : row.match === 'price' ? 'Price variance accepted' : 'Line confirmed'
        pushToast(row.id, 'success', `${row.line} · ${label}`)
    }

    const handleOverrideSubmit = (row: LineRow, payload: { reasonCategory: string; notes: string }) => {
        setRowStatus(row, 'overridden')
        setMetaById(prev => ({ ...prev, [row.id]: payload }))
        setModalRow(null)
        pushToast(row.id, 'info', `${row.line} · override logged`)
    }

    const totalPO = LINES.reduce((acc, r) => acc + r.poQty * r.poUnitPrice, 0)
    const totalInv = LINES.reduce((acc, r) => acc + r.invQty * r.invUnitPrice, 0)
    const diff = totalInv - totalPO

    const flaggedRows = LINES.filter(r => r.match !== 'ok')
    const allDecided = flaggedRows.every(r => (statuses[r.id] ?? 'pending') !== 'pending')

    return (
        <div className="space-y-4">
            {/* Intro strip */}
            <div className="bg-info/5 dark:bg-info/10 border border-info/30 rounded-xl p-3 flex items-start gap-2.5">
                <GitCompare className="h-4 w-4 text-info shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Non-EDI reconciliation · {invoice.vendor}</div>
                    <div className="text-muted-foreground mt-0.5">
                        {invoice.vendor} doesn't ship EDI — Strata OCR'd the paper invoice and matched it line-by-line to <span className="font-mono text-foreground">{invoice.poNumber}</span>. <strong className="text-foreground">{flaggedRows.length} lines</strong> differ. Approve what matches your delivery, override what doesn't.
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <SummaryTile label="PO total" value={`$${totalPO.toLocaleString()}`} accent="text-foreground" />
                <SummaryTile label="Invoice total" value={`$${totalInv.toLocaleString()}`} accent="text-foreground" />
                <SummaryTile
                    label="Delta"
                    value={`${diff >= 0 ? '+' : '−'}$${Math.abs(diff).toLocaleString()}`}
                    accent={diff < 0 ? 'text-success' : diff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}
                />
            </div>

            {/* Line-by-line diff table */}
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 dark:bg-zinc-900/40 grid grid-cols-[3rem_1fr_5rem_5rem_5rem_auto] gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider items-center">
                    <div>Line</div>
                    <div>Item</div>
                    <div className="text-right">PO</div>
                    <div className="text-right">Invoice</div>
                    <div className="text-right">Delta</div>
                    <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-border">
                    {LINES.map(row => {
                        const status = statuses[row.id] ?? 'pending'
                        const meta = metaById[row.id]
                        const poLine = row.poQty * row.poUnitPrice
                        const invLine = row.invQty * row.invUnitPrice
                        const lineDiff = invLine - poLine
                        return (
                            <div
                                key={row.id}
                                className={`
                                    grid grid-cols-[3rem_1fr_5rem_5rem_5rem_auto] gap-3 px-4 py-2.5 items-center text-xs transition-colors border-l-4
                                    ${status === 'accepted' ? 'border-l-success/60 bg-success/5 dark:bg-success/10' : ''}
                                    ${status === 'overridden' ? 'border-l-info/60 bg-info/5 dark:bg-info/10' : ''}
                                    ${status === 'pending' && row.match !== 'ok' ? 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-500/5' : ''}
                                    ${status === 'pending' && row.match === 'ok' ? 'border-l-transparent' : ''}
                                `}
                            >
                                <div className="font-mono text-muted-foreground">{row.line}</div>
                                <div className="min-w-0">
                                    <div className="text-foreground truncate">{row.desc}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono truncate">{row.sku}</div>
                                    {meta?.notes && (
                                        <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">"{meta.notes}"</div>
                                    )}
                                </div>
                                <div className="text-right tabular-nums text-muted-foreground">
                                    <div>{row.poQty} × ${row.poUnitPrice}</div>
                                    <div className="text-[10px]">${poLine.toLocaleString()}</div>
                                </div>
                                <div className={`text-right tabular-nums font-semibold ${row.match !== 'ok' ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
                                    <div>{row.invQty} × ${row.invUnitPrice}</div>
                                    <div className="text-[10px]">${invLine.toLocaleString()}</div>
                                </div>
                                <div className={`text-right tabular-nums font-bold ${lineDiff < 0 ? 'text-success' : lineDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                    {lineDiff === 0 ? '—' : `${lineDiff > 0 ? '+' : ''}$${lineDiff.toLocaleString()}`}
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                    {row.match === 'ok' && status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Match
                                        </span>
                                    )}
                                    {row.match !== 'ok' && status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => setModalRow(row)}
                                                title="Override with reason"
                                                className="px-2 py-1 text-[10px] font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted hover:border-info/40 transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleAccept(row)}
                                                title="Accept variance"
                                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-zinc-900 bg-primary rounded-md hover:opacity-90 transition-opacity shadow-sm"
                                            >
                                                <Check className="h-3 w-3" />
                                                Accept
                                            </button>
                                        </>
                                    )}
                                    {status === 'accepted' && (
                                        <StatusBadge label="Accepted" tone="success" size="sm" icon={<CheckCircle2 className="h-3 w-3" />} />
                                    )}
                                    {status === 'overridden' && (
                                        <StatusBadge label="Override" tone="info" size="sm" icon={<Pencil className="h-3 w-3" />} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Resolution banner + toast */}
            {allDecided && (
                <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Reconciliation complete</div>
                        <div className="text-muted-foreground">
                            {invoice.vendor} invoice posted · variance logged in audit trail · GL updated.
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                    ${toast.tone === 'success' ? 'bg-success/15 text-success border border-success/30' : ''}
                    ${toast.tone === 'info' ? 'bg-info/15 text-info border border-info/30' : ''}
                `}>
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>{toast.message}</span>
                </div>
            )}

            {/* AI learning footer */}
            <div className="flex items-center gap-2.5 bg-muted/30 dark:bg-zinc-800/40 border border-border rounded-xl p-3">
                <div className="h-8 w-8 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-[11px] text-muted-foreground flex-1">
                    <strong className="text-foreground">Every override trains the matcher.</strong> Strata learns your acceptable variance thresholds per vendor — next time Herman Miller ships 5-of-6 on Jarvis, it'll auto-approve without asking.
                </div>
            </div>

            {/* Override modal */}
            {modalRow && (
                <MBIReasonModal
                    isOpen
                    onClose={() => setModalRow(null)}
                    onSubmit={payload => handleOverrideSubmit(modalRow, { reasonCategory: payload.categoryId, notes: payload.notes })}
                    tone="info"
                    icon={<Pencil className="h-5 w-5" />}
                    title="Override line variance"
                    subtitle={`${modalRow.line} · ${modalRow.desc}`}
                    contextBanner={{
                        tone: 'info',
                        icon: <Package className="h-4 w-4" />,
                        title: `${modalRow.match === 'qty' ? 'Quantity' : 'Price'} differs from PO.`,
                        body: (
                            <>
                                PO says <span className="font-mono">{modalRow.poQty} × ${modalRow.poUnitPrice}</span>, invoice says <span className="font-mono">{modalRow.invQty} × ${modalRow.invUnitPrice}</span>. Your reason is logged to the vendor's audit trail and to Strata's matcher.
                            </>
                        ),
                    }}
                    categories={OVERRIDE_CATEGORIES}
                    defaultCategoryId="vendor-confirmed"
                    categoryPrompt="Why accept the variance?"
                    notesPlaceholder="e.g. Herman Miller emailed 04/17 confirming short ship on Jarvis — backorder coming on next PO."
                    notesRequiredForCategoryId="other"
                    confirmLabel="Post with override"
                />
            )}
        </div>
    )
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-xl p-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={`text-lg font-bold tabular-nums mt-0.5 ${accent}`}>{value}</div>
        </div>
    )
}
