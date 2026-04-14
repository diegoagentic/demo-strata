// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Project Dossier Card
// Phase 4 of WRG Demo v6 implementation
// Aries parity: only Client Name + Postal/Region + Site Location
// ═══════════════════════════════════════════════════════════════════════════════

import { User, Search } from 'lucide-react'
import type { Customer } from './types'

interface EstimatorDossierCardProps {
    customer: Customer
    onCustomerChange: (customer: Customer) => void
    onRateLookup: () => void
    isSearchingRates?: boolean
}

export default function EstimatorDossierCard({
    customer,
    onCustomerChange,
    onRateLookup,
    isSearchingRates = false,
}: EstimatorDossierCardProps) {
    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm px-5 py-3">
            <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">

                {/* Title */}
                <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Project Dossier
                    </h2>
                </div>

                {/* Client Name */}
                <div className="flex-1 min-w-[160px] flex items-baseline gap-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                        Client
                    </label>
                    <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
                        placeholder="Client name…"
                        className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    />
                </div>

                {/* Postal / Region with lookup */}
                <div className="flex items-baseline gap-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                        ZIP
                    </label>
                    <input
                        type="text"
                        maxLength={5}
                        value={customer.zipCode}
                        onChange={(e) => onCustomerChange({ ...customer, zipCode: e.target.value })}
                        placeholder="00000"
                        className="w-16 bg-transparent text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    />
                    <button
                        onClick={onRateLookup}
                        disabled={isSearchingRates}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        title="Lookup labor rates for this ZIP"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Site Location */}
                <div className="flex-1 min-w-[200px] flex items-baseline gap-2">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                        Site
                    </label>
                    <input
                        type="text"
                        value={customer.address}
                        onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
                        placeholder="Address…"
                        className="flex-1 min-w-0 bg-transparent text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    />
                </div>
            </div>
        </div>
    )
}
