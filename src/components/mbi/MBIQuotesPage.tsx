/**
 * COMPONENT: MBIQuotesPage
 * PURPOSE: Phase 4 — Quotes AI · PC bottleneck resolution.
 *          4 sections matching the implementation plan:
 *          A. Handoff Gate + SIF→CORE auto-import
 *          B. AI Validation Layer (SpecCheck + Non-Catalog + COM)
 *          C. Order Execution (EDI + non-EDI + Compass)
 *          ⭐ Audit Loop Diagram (4→1) — hero visual
 *
 *          Step-aware: m3.1 shows the full flow; without a step shows
 *          everything as the default reference.
 */

import { FileSearch, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import QuoteReadinessGate from './QuoteReadinessGate'
import SIFToCOREPreview from './SIFToCOREPreview'
import AuditLoopDiagram from './AuditLoopDiagram'
import SpecCheckReport from './SpecCheckReport'
import NonCatalogValidatorTable from './NonCatalogValidatorTable'
import COMWorkflowTimeline from './COMWorkflowTimeline'
import OrderExecutionPanel from './OrderExecutionPanel'

export default function MBIQuotesPage() {
    return (
        <MBIPageShell
            title="Quotes AI"
            subtitle="Phase 4 · PC bottleneck (3.5 PCs / 29 staff) → reviewers, not builders"
            icon={<FileSearch className="h-5 w-5" />}
            activeApp="mbi-quotes"
        >
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard value="3.5 / 29" label="PCs / staff (bottleneck)" accent="text-foreground" />
                <StatCard value="4 → 1" label="Audit loops" accent="text-success" />
                <StatCard value="9.08/10" label="Spec Check Q10 priority" accent="text-primary" />
                <StatCard value="80-90%" label="Non-catalog items today" accent="text-amber-600 dark:text-amber-400" />
            </div>

            {/* Section A — Handoff + SIF → CORE */}
            <section className="space-y-3 mt-2">
                <SectionHeader
                    icon={<ShieldCheck className="h-3.5 w-3.5" />}
                    label="A · Handoff gate + SIF → CORE"
                    hint="Eliminates PC's largest manual step · enforced via Teams"
                    accent="primary"
                />
                <QuoteReadinessGate />
                <SIFToCOREPreview />
            </section>

            {/* Hero — Audit loop diagram */}
            <section className="space-y-3 mt-6">
                <SectionHeader
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    label="⭐ Audit loop collapse"
                    hint="The 4-loop reality vs. Strata's 1 + 1 model"
                    accent="ai"
                />
                <AuditLoopDiagram />
            </section>

            {/* Section B — AI Validation Layer */}
            <section className="space-y-3 mt-6">
                <SectionHeader
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    label="B · AI validation layer"
                    hint="Spec Check (Q10 #1) · Non-Catalog Validator · COM workflow"
                    accent="ai"
                />
                <SpecCheckReport />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <NonCatalogValidatorTable />
                    <COMWorkflowTimeline />
                </div>
            </section>

            {/* Section C — Order Execution */}
            <section className="space-y-3 mt-6">
                <SectionHeader
                    icon={<Zap className="h-3.5 w-3.5" />}
                    label="C · Order execution"
                    hint="EDI transmission · Non-EDI agent · Compass reconciliation (all 4 mfrs)"
                    accent="primary"
                />
                <OrderExecutionPanel />
            </section>
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
