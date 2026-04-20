/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Phase 2 quick wins — Document AI, Reconciliation, AR, Forecast.
 *          Phase 0.D stub — full implementation in Phase 3.
 */

import { Receipt } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { MBI_INVOICES, MBI_AR_RECORDS, FORECAST_ACCURACY } from '../../config/profiles/mbi-data'

export default function MBIAccountingPage() {
    const exceptionCount = MBI_INVOICES.filter(i => i.hasException).length
    const healthTrustCount = MBI_INVOICES.filter(i => i.isHealthTrust).length
    const escalatedAR = MBI_AR_RECORDS.filter(a => a.status === 'escalated').length
    return (
        <MBIPageShell
            title="Accounting AI"
            subtitle={`Phase 2 quick wins · Champion: Kathy Belleville (Controller)`}
            icon={<Receipt className="h-5 w-5" />}
            activeApp="mbi-accounting"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-foreground">{MBI_INVOICES.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Invoices in queue</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-amber-600">{exceptionCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Exceptions for Kathy</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-primary">{healthTrustCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">HealthTrust w/ 3% royalty</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-red-600">{escalatedAR}</div>
                    <div className="text-xs text-muted-foreground mt-1">AR escalated</div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 mt-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Forecast accuracy</div>
                <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted-foreground line-through">{FORECAST_ACCURACY.legacy}</span>
                    <span className="text-2xl font-bold text-primary">{FORECAST_ACCURACY.strata}</span>
                </div>
            </div>
            <p className="text-xs text-muted-foreground italic text-center mt-6">
                Phase 0.D placeholder · Full Document AI + reconciliation + AR Board + Live Forecast ships in Phase 3.
            </p>
        </MBIPageShell>
    )
}
