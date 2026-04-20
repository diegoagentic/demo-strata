/**
 * COMPONENT: MBIBudgetPage
 * PURPOSE: Budget Builder hero prototype — Queue + 6-step wizard.
 *          Phase 0.D stub — full implementation in Phase 2 (sub-phases 2.1-2.8).
 *
 * STATUS: stub · Phase 0.D placeholder
 */

import { Calculator } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { MBI_BUDGET_REQUESTS, getHeroBudget } from '../../config/profiles/mbi-data'

export default function MBIBudgetPage() {
    const hero = getHeroBudget()
    return (
        <MBIPageShell
            title="Budget Builder"
            subtitle="Hero prototype · 1 week → <24 hours"
            icon={<Calculator className="h-5 w-5" />}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MBI_BUDGET_REQUESTS.map(b => (
                    <div key={b.id} className={`bg-card border rounded-2xl p-4 space-y-2 ${b.isHero ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{b.id}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{b.status}</span>
                        </div>
                        <h3 className="text-sm font-bold text-foreground">{b.client.name}</h3>
                        <p className="text-xs text-muted-foreground">{b.client.project}</p>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{b.path}</span>
                            <span className="font-bold text-foreground">${(b.total ?? b.budgetCeiling ?? 0).toLocaleString()}</span>
                        </div>
                        {b.isHero && (
                            <div className="mt-2 text-[10px] font-bold text-primary uppercase tracking-wider">⭐ Hero scenario</div>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground italic text-center mt-6">
                Phase 0.D placeholder · Hero is BDG-2026-002 (Enterprise Holdings · ${hero.total?.toLocaleString()}). Full wizard ships in Phase 2.
            </p>
        </MBIPageShell>
    )
}
