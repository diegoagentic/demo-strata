/**
 * COMPONENT: MBIDesignPage
 * PURPOSE: Phase 5 — Design AI · careful sequenced rollout starting with
 *          Beth Gianino. 3 sections matching the implementation plan:
 *          A. Adoption + Intake (capacity board + adoption strategy)
 *          B. AI Analysis Layer (Spec Check · Non-Catalog · CET Helper · Live Budget)
 *          C. File Management (auto-numbering · folder template · versioning · Teams bot)
 */

import { Palette, BadgeCheck, Sparkles, FolderTree, Users } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import AdoptionProgressStrip from './AdoptionProgressStrip'
import DesignerCapacityBoard from './DesignerCapacityBoard'
import SpecCheckReport from './SpecCheckReport'
import NonCatalogValidatorTable from './NonCatalogValidatorTable'
import CETConfigHelperPanel from './CETConfigHelperPanel'
import LiveBudgetProgressBar from './LiveBudgetProgressBar'
import FileManagementPanel from './FileManagementPanel'
import { MBI_STAKEHOLDERS, MBI_DESIGN_PROJECTS, MBI_SPEC_CHECKS } from '../../config/profiles/mbi-data'

export default function MBIDesignPage() {
    const beth = MBI_STAKEHOLDERS.find(s => s.id === 'beth-gianino')
    const flaggedChecks = MBI_SPEC_CHECKS.filter(c => c.status === 'needs-review').length
    const designTeam = MBI_STAKEHOLDERS.filter(s => s.team === 'design')
    const avgTrust = (designTeam.reduce((acc, s) => acc + (s.q4Trust ?? 0), 0) / designTeam.length).toFixed(1)

    return (
        <MBIPageShell
            title="Design AI"
            subtitle={`Phase 4 · Pilot with ${beth?.name ?? 'Early Adopter'} · Q4 trust avg ${avgTrust}/10`}
            icon={<Palette className="h-5 w-5" />}
            activeApp="mbi-design"
        >
            {/* Beth pilot persona card */}
            {beth && (
                <div className="bg-card border border-primary/30 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-foreground">{beth.name} · {beth.role}</div>
                        <div className="text-xs text-muted-foreground">
                            Q4 trust <span className="font-bold tabular-nums">{beth.q4Trust}/10</span> ·
                            Confirmed Early Adopter ·
                            Pilot for Spec Check Engine
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-zinc-900 dark:text-primary uppercase tracking-wider">Endorsement</div>
                        <div className="text-xs text-foreground italic max-w-xs">
                            "Caught a finish mismatch I would have missed."
                        </div>
                    </div>
                </div>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard value={`${MBI_DESIGN_PROJECTS.length}`} label="Active design projects" accent="text-foreground" />
                <StatCard value={`${flaggedChecks}`} label="Spec checks need review" accent="text-amber-600 dark:text-amber-400" />
                <StatCard value="9.08/10" label="Q10 spec check priority" accent="text-zinc-900 dark:text-primary" />
                <StatCard value="< 5 min" label="Spec check turnaround" accent="text-success" />
            </div>

            {/* Section A — Adoption + Intake */}
            <section className="space-y-3 mt-2">
                <SectionHeader
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="A · Adoption + Intake"
                    hint="Rogers Diffusion-based rollout · capacity board with hybrids"
                    accent="primary"
                />
                <AdoptionProgressStrip />
                <DesignerCapacityBoard />
            </section>

            {/* Section B — AI Analysis */}
            <section className="space-y-3 mt-6">
                <SectionHeader
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    label="B · AI Analysis Layer"
                    hint="Spec Check (Q10 #1) · Non-Catalog · CET Helper · Live Budget"
                    accent="ai"
                />
                <SpecCheckReport reportId="SC-001" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CETConfigHelperPanel />
                    <LiveBudgetProgressBar />
                </div>
                <NonCatalogValidatorTable />
            </section>

            {/* Section C — File Management */}
            <section className="space-y-3 mt-6">
                <SectionHeader
                    icon={<FolderTree className="h-3.5 w-3.5" />}
                    label="C · File management (Phase 1 prereqs)"
                    hint="Auto-numbering · SharePoint templates · version control · Teams bot"
                    accent="primary"
                />
                <FileManagementPanel />
            </section>
        </MBIPageShell>
    )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4">
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
    const color = accent === 'ai' ? 'text-ai' : 'text-zinc-900 dark:text-primary'
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
