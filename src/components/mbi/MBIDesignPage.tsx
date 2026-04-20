/**
 * COMPONENT: MBIDesignPage
 * PURPOSE: Phase 4 — Design AI · Spec Check Engine + adoption strategy.
 *          Phase 0.D stub — full implementation in Phase 5.
 */

import { Palette, BadgeCheck } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { MBI_DESIGN_PROJECTS, MBI_SPEC_CHECKS, MBI_STAKEHOLDERS } from '../../config/profiles/mbi-data'

export default function MBIDesignPage() {
    const beth = MBI_STAKEHOLDERS.find(s => s.id === 'beth-gianino')
    const flaggedChecks = MBI_SPEC_CHECKS.filter(c => c.status === 'needs-review').length
    return (
        <MBIPageShell
            title="Design AI"
            subtitle={`Phase 4 · Pilot with ${beth?.name} (Q4 trust ${beth?.q4Trust}/10 · Early Adopter)`}
            icon={<Palette className="h-5 w-5" />}
            activeApp="mbi-design"
        >
            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-foreground">{beth?.name} · {beth?.role}</div>
                        <div className="text-xs text-muted-foreground">Confirmed Early Adopter — pilot for Spec Check Engine</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-foreground">{MBI_DESIGN_PROJECTS.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Active design projects</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-amber-600">{flaggedChecks}</div>
                    <div className="text-xs text-muted-foreground mt-1">Spec checks need review</div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="text-2xl font-bold text-primary">9.08/10</div>
                    <div className="text-xs text-muted-foreground mt-1">Q10 priority (team's #1)</div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground italic text-center mt-6">
                Phase 0.D placeholder · Full Adoption Strategy + Designer Capacity Board + Spec Check Report ships in Phase 5.
            </p>
        </MBIPageShell>
    )
}
