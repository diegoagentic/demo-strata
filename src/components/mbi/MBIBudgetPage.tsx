/**
 * COMPONENT: MBIBudgetPage
 * PURPOSE: Budget Builder hero prototype — step-aware rendering of 4 sub-views
 *          driven by currentStep.id (m1.1 → m1.4). Between-demo (or outside of
 *          steps), shows the Queue view.
 *
 * STEP VIEWS:
 *   - m1.1 → IntakeView         : path selector stub (Design-Assisted vs Quick)
 *   - m1.2 → ParsingView        : SIF parsing + scenarios stub
 *   - m1.3 → ValidationView     : $18K hero moment stub
 *   - m1.4 → OutputView         : review + PDF delivery stub
 *   - other/none → QueueView    : 6 budget cards grid
 *
 * STATUS: Phase 0.D step-aware skeleton. Full wizard in Phase 2 (sub-phases 2.1-2.7).
 */

import { useState } from 'react'
import { Calculator, Sparkles, AlertTriangle, FileCheck2, CheckCircle2, ArrowRight, Plus, Clock, DollarSign, TrendingUp } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import BudgetQueueKanban from './BudgetQueueKanban'
import BudgetWizardShell from './BudgetWizardShell'
import BudgetIntakeStep, { INITIAL_QUICK_FORM, type QuickFormState } from './BudgetIntakeStep'
import SIFParserPreview from './SIFParserPreview'
import PreflightScanChain from './PreflightScanChain'
import ScenariosStep from './ScenariosStep'
import ValidationStep from './ValidationStep'
import ReviewStep from './ReviewStep'
import OutputStep from './OutputStep'
import type { ScenarioTier, ValidationStatus } from '../../config/profiles/mbi-data'
import { HERO_VALIDATION_SECONDARY } from '../../config/profiles/mbi-data'
import { useDemo } from '../../context/DemoContext'
import {
    MBI_BUDGET_REQUESTS,
    getHeroBudget,
    HERO_VALIDATION,
    HERO_SCENARIOS,
    getSIFSample,
} from '../../config/profiles/mbi-data'
import type { BudgetPath } from '../../config/profiles/mbi-data'

// Map demo tour step id → wizard step index (0-based)
const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm1.1': 0,  // Intake
    'm1.2': 1,  // Parsing (also covers step 2 scenarios = wizard idx 2 collapses into parsing step)
    'm1.3': 3,  // Validation
    'm1.4': 5,  // Output (skips step 4 review in the demo tour)
}

export default function MBIBudgetPage() {
    const { currentStep, isDemoActive } = useDemo()
    const stepId = isDemoActive ? currentStep?.id : null
    const isInWizard = stepId !== null && stepId in STEP_TO_WIZARD_INDEX
    const wizardStepIdx = stepId ? STEP_TO_WIZARD_INDEX[stepId] ?? 0 : 0

    // Wizard state — locked to Design-Assisted + Enterprise scenario in demo tour
    const [path] = useState<BudgetPath>('design-assisted')
    const [quickForm, setQuickForm] = useState<QuickFormState>(INITIAL_QUICK_FORM)

    // Scenario selection state (shared across m1.2 parsing → m1.3 validation → m1.4 output)
    const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>('better')
    const [markupOverrides, setMarkupOverrides] = useState<Partial<Record<ScenarioTier, number>>>({})
    const handleMarkupChange = (tier: ScenarioTier, v: number) =>
        setMarkupOverrides(prev => ({ ...prev, [tier]: v }))

    // Validation state — shared between m1.3 validation and m1.4 output
    const [validationStatus, setValidationStatus] = useState<Record<string, ValidationStatus>>({
        [HERO_VALIDATION.id]: 'pending',
        [HERO_VALIDATION_SECONDARY.id]: 'pending',
    })
    const handleValidationChange = (id: string, s: ValidationStatus) =>
        setValidationStatus(prev => ({ ...prev, [id]: s }))

    // Approval state — gates the Output step
    const [approved, setApproved] = useState(false)

    return (
        <MBIPageShell
            title="Budget Builder"
            subtitle="Hero prototype · 1 week → <24 hours · Amanda Renshaw (Account Manager)"
            icon={<Calculator className="h-5 w-5" />}
            activeApp="mbi-budget"
        >
            {isInWizard ? (
                <BudgetWizardShell activeStep={wizardStepIdx}>
                    {stepId === 'm1.1' && (
                        <BudgetIntakeStep
                            path={path}
                            onPathChange={() => { /* demo locks path */ }}
                            quickForm={quickForm}
                            onQuickFormChange={setQuickForm}
                            lockedToDemoPath
                        />
                    )}
                    {stepId === 'm1.2' && (
                        <ParsingView
                            selectedTier={selectedTier}
                            onSelectTier={setSelectedTier}
                            markupOverrides={markupOverrides}
                            onMarkupChange={handleMarkupChange}
                        />
                    )}
                    {stepId === 'm1.3' && (
                        <>
                            <StepHeader id="m1.3" title="AI validation — $18K catch" icon={<AlertTriangle className="h-4 w-4" />} />
                            <ValidationStep
                                validations={[HERO_VALIDATION, HERO_VALIDATION_SECONDARY]}
                                statusById={validationStatus}
                                onStatusChange={handleValidationChange}
                            />
                        </>
                    )}
                    {stepId === 'm1.4' && (() => {
                        const hero = getHeroBudget()
                        const selectedScenario = HERO_SCENARIOS.find(s => s.tier === selectedTier) ?? HERO_SCENARIOS[1]
                        const effectiveMarkup = markupOverrides[selectedScenario.tier] ?? selectedScenario.markup
                        const sif = getSIFSample('SIF-ENTERPRISE-001')
                        const resolvedCount = Object.values(validationStatus).filter(s => s !== 'pending').length
                        const totalValidations = Object.keys(validationStatus).length
                        const preventedImpact = [HERO_VALIDATION, HERO_VALIDATION_SECONDARY]
                            .filter(v => validationStatus[v.id] === 'accepted')
                            .reduce((acc, v) => acc + (v.estimatedImpact ?? 0), 0)
                        const markupFactor = (1 + effectiveMarkup) / (1 + selectedScenario.markup)
                        const adjustedTotal = Math.round(selectedScenario.total * markupFactor)
                        return (
                            <>
                                <StepHeader id="m1.4" title="Review + client delivery" icon={<FileCheck2 className="h-4 w-4" />} />
                                <ReviewStep
                                    client={hero.client}
                                    scenario={selectedScenario}
                                    markup={effectiveMarkup}
                                    sifLineItems={sif?.lineItems ?? []}
                                    validationsResolved={resolvedCount}
                                    validationsTotal={totalValidations}
                                    preventedImpact={preventedImpact}
                                    approved={approved}
                                    onApprove={() => setApproved(true)}
                                />
                                {approved && (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <OutputStep
                                            client={hero.client}
                                            scenarioLabel={selectedScenario.label}
                                            total={adjustedTotal}
                                            markup={effectiveMarkup}
                                            preventedImpact={preventedImpact}
                                        />
                                    </div>
                                )}
                            </>
                        )
                    })()}
                </BudgetWizardShell>
            ) : (
                <QueueView />
            )}
        </MBIPageShell>
    )
}

// ─── Queue (default view) ─────────────────────────────────────────────────
function QueueView() {
    const approvedCount = MBI_BUDGET_REQUESTS.filter(b => b.status === 'approved').length
    const inFlightCount = MBI_BUDGET_REQUESTS.filter(b => b.status !== 'approved').length
    const totalValue = MBI_BUDGET_REQUESTS.reduce((sum, b) => sum + (b.total ?? b.budgetCeiling ?? 0), 0)
    const heroImpact = HERO_VALIDATION.estimatedImpact ?? 0

    return (
        <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    icon={<Clock className="h-4 w-4" />}
                    value={`${inFlightCount}`}
                    label="In flight"
                    accent="text-zinc-900 dark:text-primary"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    value={`${approvedCount}`}
                    label="Approved"
                    accent="text-success"
                />
                <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    value={`$${(totalValue / 1_000_000).toFixed(2)}M`}
                    label="Total pipeline"
                    accent="text-foreground"
                />
                <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    value={`$${(heroImpact / 1000).toFixed(1)}K`}
                    label="Last error prevented"
                    accent="text-ai"
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                    Pipeline stages · Intake → AI Parsing → Validation → Review → Approved
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                    New Budget
                </button>
            </div>

            {/* Kanban */}
            <BudgetQueueKanban />

            <p className="text-xs text-muted-foreground italic text-center mt-4">
                Phase 2.1 · Queue complete. Launch the MBI demo tour to step through Amanda's 4-step Budget Builder flow.
            </p>
        </>
    )
}

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-2xl font-bold leading-none">{value}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">{label}</div>
        </div>
    )
}

// IntakeView replaced by BudgetIntakeStep component (Phase 2.2 refactor).

// ─── Step m1.2 — Parsing (animated SIF extraction + 5-check pre-flight) ───
interface ParsingViewProps {
    selectedTier: ScenarioTier | null
    onSelectTier: (tier: ScenarioTier) => void
    markupOverrides: Partial<Record<ScenarioTier, number>>
    onMarkupChange: (tier: ScenarioTier, v: number) => void
}

function ParsingView({ selectedTier, onSelectTier, markupOverrides, onMarkupChange }: ParsingViewProps) {
    const sif = getSIFSample('SIF-ENTERPRISE-001')
    const [scenariosRevealed, setScenariosRevealed] = useState(false)
    if (!sif) return null

    const parserStagger = 140
    const preflightStartDelay = 1800

    return (
        <>
            <StepHeader id="m1.2" title="AI parsing + scenario generation" icon={<Sparkles className="h-4 w-4" />} />

            <SIFParserPreview sif={sif} stagger={parserStagger} />

            <PreflightScanChain
                startDelay={preflightStartDelay}
                perCheckDuration={1100}
                onComplete={() => setScenariosRevealed(true)}
            />

            {/* Scenarios full interactive view — reveals after pre-flight completes */}
            {scenariosRevealed && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-primary uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Scenarios generated — select one to continue</span>
                        </div>
                    </div>
                    <ScenariosStep
                        scenarios={HERO_SCENARIOS}
                        selectedTier={selectedTier}
                        onSelectTier={onSelectTier}
                        markupOverrides={markupOverrides}
                        onMarkupChange={onMarkupChange}
                    />
                </div>
            )}
        </>
    )
}

// ValidationView replaced by ValidationStep component (Phase 2.5 refactor).

// OutputView replaced by ReviewStep + OutputStep components (Phase 2.6/2.7).

// ─── Shared step header ───────────────────────────────────────────────────
function StepHeader({ id, title, icon }: { id: string; title: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-primary uppercase tracking-wider mb-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
            <span>Step {id}</span>
            <span>·</span>
            <span className="text-foreground normal-case">{title}</span>
        </div>
    )
}
