/**
 * COMPONENT: AccountingMorningQueue
 * PURPOSE: Flow 2 · Scene 1 — Kathy opens Strata and sees the morning queue
 *          already pre-processed overnight. Exception-centric: highlights that
 *          10/12 invoices were auto-posted and only 2 need her review.
 *
 *          Hero surface = invoice queue + detail panel. Footer cue invites
 *          Kathy to review the HealthTrust royalty exception first.
 *
 * DS TOKENS: bg-card · bg-ai/5 · success / amber accents
 *
 * USED BY: MBIAccountingPage (wizard scene 0)
 */

import { useState } from 'react'
import { Moon, Zap, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import InvoiceQueueTable from './InvoiceQueueTable'
import InvoiceDetailPanel from './InvoiceDetailPanel'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'

export default function AccountingMorningQueue() {
    const total = MBI_INVOICES.length
    const exceptions = MBI_INVOICES.filter(i => i.hasException).length
    const healthTrust = MBI_INVOICES.filter(i => i.isHealthTrust).length
    const autoPosted = total - exceptions

    // Default select the HealthTrust hero so Kathy sees the 3% royalty right away
    const defaultId = MBI_INVOICES.find(i => i.isHealthTrust)?.id ?? MBI_INVOICES[0].id
    const [selectedId, setSelectedId] = useState(defaultId)
    const selected = MBI_INVOICES.find(i => i.id === selectedId) ?? MBI_INVOICES[0]

    return (
        <div className="space-y-4">
            {/* Overnight work summary */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Moon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground">Strata worked overnight</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Read <strong className="text-foreground">{total} vendor invoices</strong> ·
                        extracted fields with Document AI · matched to open POs in CORE ·
                        applied HealthTrust 3% royalty logic on <strong className="text-foreground">{healthTrust} GPO invoices</strong>.
                        Only <strong className="text-foreground">{exceptions}</strong> need your eyes.
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                            <Zap className="h-3 w-3" />
                            {autoPosted} auto-posted
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            {exceptions} exceptions
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                            <CheckCircle2 className="h-3 w-3 text-zinc-900 dark:text-primary" />
                            {healthTrust} HealthTrust flagged
                        </span>
                    </div>
                </div>
            </div>

            {/* Queue + detail */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <InvoiceQueueTable
                        invoices={MBI_INVOICES}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>
                <div className="lg:col-span-2">
                    <InvoiceDetailPanel invoice={selected} />
                </div>
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    First up: the HealthTrust Mercy invoice · Strata auto-calculated the <strong>3% royalty</strong> per MBI's GPO contract — needs your approval to post.
                </span>
            </div>
        </div>
    )
}
