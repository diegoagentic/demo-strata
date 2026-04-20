/**
 * COMPONENT: BudgetIntakeStep
 * PURPOSE: Wizard Step 1 — Intake. Dual-path selector:
 *          - Design-Assisted (SIF/CAP upload)
 *          - Quick Budget    (salesperson form)
 *
 * The demo tour locks this to Design-Assisted (the hero scenario), but the
 * Quick Budget path is fully functional for out-of-tour exploration.
 *
 * PROPS:
 *   - path: 'design-assisted' | 'quick-budget' | null
 *   - onPathChange: (p) => void
 *   - uploadedSIF?: SIFSample | null
 *   - quickForm: QuickFormState
 *   - onQuickFormChange: (form) => void
 *
 * STATES:
 *   - path = null             → show 2 big path cards
 *   - path = design-assisted  → show SIF preview card + CAP upload
 *   - path = quick-budget     → show full form
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · text-foreground · primary ring
 * USED BY: MBIBudgetPage (Step 1 view)
 */

import { Upload, FileSpreadsheet, FileCode2, ClipboardList, Briefcase, Building2, GraduationCap, Landmark, Heart, CheckCircle2 } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { SIFSample, BudgetPath, Vertical, ContractType } from '../../config/profiles/mbi-data'
import { MBI_CONTRACTS, getSIFSample } from '../../config/profiles/mbi-data'

export interface QuickFormState {
    clientName: string
    projectName: string
    vertical: Vertical
    contract: ContractType
    budgetCeiling: string
    workstations: string
    privateOffices: string
    conferenceRooms: string
    lounge: string
}

export const INITIAL_QUICK_FORM: QuickFormState = {
    clientName: 'Commerce Bank',
    projectName: 'Branch Remodel — Clayton',
    vertical: 'corporate',
    contract: 'HNI',
    budgetCeiling: '124000',
    workstations: '12',
    privateOffices: '6',
    conferenceRooms: '0',
    lounge: '0',
}

interface BudgetIntakeStepProps {
    path: BudgetPath | null
    onPathChange: (p: BudgetPath) => void
    quickForm: QuickFormState
    onQuickFormChange: (f: QuickFormState) => void
    lockedToDemoPath?: boolean           // when true, path switch disabled (demo tour mode)
}

export default function BudgetIntakeStep({
    path,
    onPathChange,
    quickForm,
    onQuickFormChange,
    lockedToDemoPath = false,
}: BudgetIntakeStepProps) {
    // If no path selected yet, show the path selector
    if (!path) {
        return (
            <>
                <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                        How do you want to start the budget? Strata routes you to the correct engine based on the inputs you have.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PathCard
                        icon={<FileCode2 className="h-6 w-6" />}
                        title="Design-Assisted"
                        subtitle="I have CET exports (SIF + CAP)"
                        description="Upload the CET SIF export and CAP worksheet. Strata parses 24 fields, applies contract pricing, and generates scenarios automatically."
                        bullets={['~2 min to scenarios', 'Uses real CET data', 'Highest accuracy']}
                        onClick={() => onPathChange('design-assisted')}
                        emphasis
                    />
                    <PathCard
                        icon={<ClipboardList className="h-6 w-6" />}
                        title="Quick Budget"
                        subtitle="Salesperson-only · no design yet"
                        description="Fill a short form (space type, scope, contract, ceiling). Strata uses historical CORE data + pricing reference table to estimate."
                        bullets={['~5 min', 'No CET required', 'Marked budget-grade']}
                        onClick={() => onPathChange('quick-budget')}
                    />
                </div>
            </>
        )
    }

    if (path === 'design-assisted') {
        return <DesignAssistedIntake locked={lockedToDemoPath} onBack={() => !lockedToDemoPath && onPathChange('quick-budget' as BudgetPath)} />
    }

    return (
        <QuickBudgetIntake
            form={quickForm}
            onChange={onQuickFormChange}
            locked={lockedToDemoPath}
            onSwitchToDesign={() => !lockedToDemoPath && onPathChange('design-assisted')}
        />
    )
}

// ─── Path selector card ──────────────────────────────────────────────────────
function PathCard({
    icon,
    title,
    subtitle,
    description,
    bullets,
    onClick,
    emphasis,
}: {
    icon: React.ReactNode
    title: string
    subtitle: string
    description: string
    bullets: string[]
    onClick: () => void
    emphasis?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className={`
                text-left bg-card border rounded-2xl p-5 transition-all hover:shadow-md
                ${emphasis ? 'border-primary/40 hover:border-primary' : 'border-border hover:border-muted-foreground/40'}
            `}
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${emphasis ? 'bg-primary/10 text-zinc-900 dark:text-primary' : 'bg-muted text-foreground'}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
            <ul className="space-y-1">
                {bullets.map((b, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        {b}
                    </li>
                ))}
            </ul>
        </button>
    )
}

// ─── Design-Assisted intake (files uploaded) ─────────────────────────────────
function DesignAssistedIntake({ locked, onBack }: { locked: boolean; onBack: () => void }) {
    const sif = getSIFSample('SIF-ENTERPRISE-001')!
    return (
        <div className="space-y-4">
            {/* Header with path badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <FileCode2 className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Design-Assisted path</div>
                        <div className="text-[10px] text-muted-foreground">Upload CET exports · Strata parses automatically</div>
                    </div>
                </div>
                {!locked && (
                    <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Switch path
                    </button>
                )}
            </div>

            {/* SIF file — uploaded state */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                    <FileCode2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{sif.fileName}</span>
                        <span className="text-[10px] font-bold text-success uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success/10">
                            Uploaded
                        </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        {sif.fieldCount} fields · {sif.lineItems.length} line items · CET v{sif.cetVersion} · exported {new Date(sif.exportedAt).toLocaleString()}
                    </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            </div>

            {/* CAP file — uploaded state */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">EnterpriseHoldings_CAP.xlsx</span>
                        <span className="text-[10px] font-bold text-success uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success/10">
                            Uploaded
                        </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                        Pricing adjustments · 7 discount overrides · 3 custom-pricing lines
                    </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            </div>

            {/* Intake summary */}
            <div className="bg-muted/20 border border-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Intake summary — detected by AI</h4>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><dt className="text-muted-foreground">Client</dt><dd className="font-bold text-foreground mt-0.5">Enterprise Holdings</dd></div>
                    <div><dt className="text-muted-foreground">Project</dt><dd className="font-bold text-foreground mt-0.5">New HQ Floor 12</dd></div>
                    <div><dt className="text-muted-foreground">Contract</dt><dd className="font-bold text-foreground mt-0.5">HNI Corporate · 55%</dd></div>
                    <div><dt className="text-muted-foreground">Budget ceiling</dt><dd className="font-bold text-foreground mt-0.5">$385,000</dd></div>
                </dl>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-3">
                <Upload className="h-4 w-4 text-ai shrink-0" />
                <span>Both files recognized and validated. Strata is ready to parse — click <strong className="text-foreground">Next</strong> to continue.</span>
            </div>
        </div>
    )
}

// ─── Quick Budget intake form ────────────────────────────────────────────────
const VERTICALS: { id: Vertical; label: string; icon: React.ReactNode }[] = [
    { id: 'corporate', label: 'Corporate', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="h-4 w-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'government', label: 'Government', icon: <Landmark className="h-4 w-4" /> },
]

function QuickBudgetIntake({
    form,
    onChange,
    locked,
    onSwitchToDesign,
}: {
    form: QuickFormState
    onChange: (f: QuickFormState) => void
    locked: boolean
    onSwitchToDesign: () => void
}) {
    const update = <K extends keyof QuickFormState>(key: K, value: QuickFormState[K]) =>
        onChange({ ...form, [key]: value })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center">
                        <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Quick Budget path</div>
                        <div className="text-[10px] text-muted-foreground">Salesperson form · uses historical CORE data</div>
                    </div>
                </div>
                {!locked && (
                    <button onClick={onSwitchToDesign} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Switch to Design-Assisted
                    </button>
                )}
            </div>

            {/* Client + project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Client">
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={e => update('clientName', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </FormField>
                <FormField label="Project">
                    <input
                        type="text"
                        value={form.projectName}
                        onChange={e => update('projectName', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </FormField>
            </div>

            {/* Vertical */}
            <FormField label="Vertical">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {VERTICALS.map(v => {
                        const active = form.vertical === v.id
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => update('vertical', v.id)}
                                className={`
                                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors
                                    ${active ? 'bg-primary/10 text-zinc-900 dark:text-primary border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}
                                `}
                            >
                                {v.icon}
                                {v.label}
                            </button>
                        )
                    })}
                </div>
            </FormField>

            {/* Scope */}
            <FormField label="Scope">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ScopeInput label="Workstations" value={form.workstations} onChange={v => update('workstations', v)} icon={<Building2 className="h-4 w-4" />} />
                    <ScopeInput label="Offices" value={form.privateOffices} onChange={v => update('privateOffices', v)} icon={<Briefcase className="h-4 w-4" />} />
                    <ScopeInput label="Conference" value={form.conferenceRooms} onChange={v => update('conferenceRooms', v)} icon={<ClipboardList className="h-4 w-4" />} />
                    <ScopeInput label="Lounge" value={form.lounge} onChange={v => update('lounge', v)} icon={<Heart className="h-4 w-4" />} />
                </div>
            </FormField>

            {/* Contract + budget ceiling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Contract">
                    <select
                        value={form.contract}
                        onChange={e => update('contract', e.target.value as ContractType)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                        {MBI_CONTRACTS.map(c => (
                            <option key={c.id} value={c.type}>{c.name} · {Math.round(c.discount * 100)}%</option>
                        ))}
                        <option value="none">No contract</option>
                    </select>
                </FormField>
                <FormField label="Budget ceiling (USD)">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
                        <input
                            type="text"
                            value={form.budgetCeiling}
                            onChange={e => update('budgetCeiling', e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-6 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                </FormField>
            </div>
        </div>
    )
}

// ─── Small helpers ───────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    )
}

function ScopeInput({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode }) {
    return (
        <div className="bg-muted/20 border border-border rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
                {icon}
                <span>{label}</span>
            </div>
            <input
                type="number"
                min={0}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-foreground focus:outline-none"
            />
        </div>
    )
}
