/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Phase 2 Accounting AI — Document AI, Reconciliation, AR, Forecast.
 *          Step-aware: m2.1 shows Document AI (Invoice ingestion + HealthTrust logic);
 *          m2.2 reserved for Phase 3.B Non-EDI reconciliation + AR (Phase 3.C).
 *
 *          Without an active demo step, shows a compact overview with all sections.
 */

import { useState } from 'react'
import { Receipt, Heart, Sparkles } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import InvoiceQueueTable from './InvoiceQueueTable'
import InvoiceDetailPanel from './InvoiceDetailPanel'
import { useDemo } from '../../context/DemoContext'
import {
    MBI_INVOICES,
    MBI_AR_RECORDS,
    FORECAST_ACCURACY,
} from '../../config/profiles/mbi-data'

export default function MBIAccountingPage() {
    const { currentStep, isDemoActive } = useDemo()
    const stepId = isDemoActive ? currentStep?.id : null

    // Document AI: default selected = hero HealthTrust invoice (INV-0486 BJC-style)
    const defaultSelectedId = MBI_INVOICES.find(i => i.isHealthTrust)?.id ?? MBI_INVOICES[0].id
    const [selectedId, setSelectedId] = useState<string>(defaultSelectedId)

    const selected = MBI_INVOICES.find(i => i.id === selectedId) ?? MBI_INVOICES[0]
    const exceptionCount = MBI_INVOICES.filter(i => i.hasException).length
    const healthTrustCount = MBI_INVOICES.filter(i => i.isHealthTrust).length
    const escalatedAR = MBI_AR_RECORDS.filter(a => a.status === 'escalated').length

    return (
        <MBIPageShell
            title="Accounting AI"
            subtitle="Phase 2 quick wins · Champion: Kathy Belleville (Controller)"
            icon={<Receipt className="h-5 w-5" />}
            activeApp="mbi-accounting"
        >
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard value={`${MBI_INVOICES.length}`} label="Invoices in queue" accent="text-foreground" />
                <StatCard value={`${exceptionCount}`} label="Exceptions for Kathy" accent="text-amber-600 dark:text-amber-400" />
                <StatCard value={`${healthTrustCount}`} label="HealthTrust · 3% royalty" accent="text-primary" />
                <StatCard value={`${escalatedAR}`} label="AR escalated" accent="text-red-600 dark:text-red-400" />
            </div>

            {/* Section — Document AI (m2.1 story) */}
            {(stepId === 'm2.1' || !stepId) && (
                <section className="space-y-3 mt-2">
                    <SectionHeader
                        icon={<Sparkles className="h-3.5 w-3.5" />}
                        label="Document AI — Invoice ingestion"
                        hint="Overnight auto-extraction · HealthTrust 3% royalty logic · exception-only review for Kathy"
                        accent="ai"
                    />
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

                    {selected.isHealthTrust && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/5 border border-amber-300/30 dark:border-amber-500/20 rounded-xl p-3">
                            <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>
                                Strata detected this as a HealthTrust GPO invoice. The 3% royalty line is auto-calculated and flagged for Kathy's final approval per the MBI GPO contract.
                            </span>
                        </div>
                    )}
                </section>
            )}

            {/* Placeholder sections for Phase 3.B / 3.C / 3.D (coming next) */}
            {stepId === 'm2.2' && (
                <section className="mt-2">
                    <SectionHeader
                        icon={<Sparkles className="h-3.5 w-3.5" />}
                        label="Non-EDI reconciliation + AR aging"
                        hint="Phase 3.B + 3.C · next phase"
                        accent="ai"
                    />
                    <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
                        Phase 3.B (Reconciliation agents) + Phase 3.C (AR Management + Live Billing Forecast) ship next.
                        <div className="mt-2 text-xs">
                            Forecast accuracy target: {FORECAST_ACCURACY.legacy} → {FORECAST_ACCURACY.strata}
                        </div>
                    </div>
                </section>
            )}
        </MBIPageShell>
    )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-4">
            <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
        </div>
    )
}

function SectionHeader({
    icon,
    label,
    hint,
    accent,
}: {
    icon: React.ReactNode
    label: string
    hint: string
    accent: 'ai' | 'primary'
}) {
    const color = accent === 'ai' ? 'text-ai' : 'text-primary'
    return (
        <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color}`}>
                {icon}
                <span>{label}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">{hint}</div>
        </div>
    )
}
