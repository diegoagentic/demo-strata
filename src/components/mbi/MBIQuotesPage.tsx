/**
 * COMPONENT: MBIQuotesPage
 * PURPOSE: Phase 4 — Quotes AI · PC bottleneck resolution.
 *          Phase 0.D stub — full implementation in Phase 4.
 */

import { FileSearch } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { MBI_PROPOSALS } from '../../config/profiles/mbi-data'

export default function MBIQuotesPage() {
    return (
        <MBIPageShell
            title="Quotes AI"
            subtitle="Phase 4 · SIF → CORE auto-import · 4 audit loops → 1"
            icon={<FileSearch className="h-5 w-5" />}
        >
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Recent CORE proposals</h2>
                <ul className="divide-y divide-border">
                    {MBI_PROPOSALS.map(p => (
                        <li key={p.id} className="py-3 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-foreground">{p.id}</div>
                                <div className="text-xs text-muted-foreground">{p.lineItemCount} line items · {p.manufacturers.join(' · ')}</div>
                            </div>
                            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize">{p.coreStatus.replace('-', ' ')}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-foreground">3.5 / 29</div>
                    <div className="text-xs text-muted-foreground mt-1">PCs / staff (bottleneck)</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-primary">4 → 1</div>
                    <div className="text-xs text-muted-foreground mt-1">Audit loops</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-foreground">9.08/10</div>
                    <div className="text-xs text-muted-foreground mt-1">Spec Check priority (Q10)</div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground italic text-center mt-6">
                Phase 0.D placeholder · Full Quote Readiness Gate + SIF→CORE preview + Audit Loop Diagram ships in Phase 4.
            </p>
        </MBIPageShell>
    )
}
