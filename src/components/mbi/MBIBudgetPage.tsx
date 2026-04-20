/**
 * COMPONENT: MBIBudgetPage
 * PURPOSE: Budget Builder hero prototype — packaged in a 6-step Wizard shell
 *          with sticky stepper, free click-navigation between steps, and
 *          floating detail sheets for deep-dive content.
 *
 * STEP VIEWS (wizard indices 0-5):
 *   - 0 Intake       · path selector stub (Design-Assisted vs Quick)
 *   - 1 AI Parsing   · SIF parsing + structured extraction
 *   - 2 Scenarios    · Good/Better/Best comparison + markup
 *   - 3 Validation   · $18K hero moment
 *   - 4 Review       · Client · scenario · validations summary
 *   - 5 Output       · PDF delivery + approve
 *
 * DEMO TOUR: when the demo drives a step (m1.1 → m1.4), the wizard slot is
 * set programmatically via STEP_TO_WIZARD_INDEX. Outside a demo step the user
 * navigates freely via the stepper chips + Back/Next.
 *
 * STATUS: Phase 2.8 wizard refactor — consolidated free-nav + demo-nav modes.
 */

import { useEffect, useState } from 'react'
import { Calculator, Plus, Clock, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import BudgetQueueKanban from './BudgetQueueKanban'
import BudgetWizardShell, { WIZARD_STEPS } from './BudgetWizardShell'
import BudgetIntakeStep, { INITIAL_QUICK_FORM, type QuickFormState } from './BudgetIntakeStep'
import ParsingStep from './ParsingStep'
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
    'm1.2': 1,  // AI Parsing
    'm1.3': 3,  // Validation (scenarios are auto-selected for the demo)
    'm1.4': 4,  // Review — approve auto-advances to Output
}

export default function MBIBudgetPage() {
    const { currentStep, isDemoActive } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null
    const demoWizardIdx = demoStepId && demoStepId in STEP_TO_WIZARD_INDEX
        ? STEP_TO_WIZARD_INDEX[demoStepId]
        : null

    // Free navigation state (overridden by demo when active)
    const [manualStep, setManualStep] = useState(0)
    const activeStep = demoWizardIdx ?? manualStep
    const inWizard = demoWizardIdx !== null || !isDemoActive

    // Sync manual step with demo tour so jumping out of demo keeps context
    useEffect(() => {
        if (demoWizardIdx !== null) setManualStep(demoWizardIdx)
    }, [demoWizardIdx])

    // Wizard state — locked to Design-Assisted + Enterprise scenario in demo tour
    const [path] = useState<BudgetPath>('design-assisted')
    const [quickForm, setQuickForm] = useState<QuickFormState>(INITIAL_QUICK_FORM)

    // Scenario selection state (shared across parsing → scenarios → validation → review)
    const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>('better')
    const [markupOverrides, setMarkupOverrides] = useState<Partial<Record<ScenarioTier, number>>>({})
    const handleMarkupChange = (tier: ScenarioTier, v: number) =>
        setMarkupOverrides(prev => ({ ...prev, [tier]: v }))

    // Validation state — shared between validation and review/output
    const [validationStatus, setValidationStatus] = useState<Record<string, ValidationStatus>>({
        [HERO_VALIDATION.id]: 'pending',
        [HERO_VALIDATION_SECONDARY.id]: 'pending',
    })
    const handleValidationChange = (id: string, s: ValidationStatus) =>
        setValidationStatus(prev => ({ ...prev, [id]: s }))

    // Approval state — gates the Output step
    const [approved, setApproved] = useState(false)

    // Auto-advance from Review → Output once approved
    const handleApprove = () => {
        setApproved(true)
        setManualStep(5)
    }

    const canAdvance = (() => {
        switch (activeStep) {
            case 0: return true
            case 1: return true
            case 2: return selectedTier !== null
            case 3: return Object.values(validationStatus).every(s => s !== 'pending')
            case 4: return approved
            case 5: return false
            default: return true
        }
    })()

    const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
        0: { hint: 'Confirm both files are uploaded · Strata auto-detects path.', nextLabel: 'Parse SIF + CAP' },
        1: { hint: 'Watch the AI extract every line item from the SIF · open the source or pre-flight log for detail.', nextLabel: 'Pick a scenario' },
        2: { hint: 'Choose Good / Better / Best and tune markup · breakdown opens on demand.', nextLabel: 'Review validations' },
        3: { hint: 'Resolve every flagged item — Accept, Override, or Reject · approval is gated until clear.', nextLabel: 'Continue to Review' },
        4: { hint: 'Final summary before client delivery · approve to lock the budget.', nextLabel: approved ? 'View output' : 'Approve to continue' },
        5: { hint: 'Budget locked · download artifacts and send to client.', nextLabel: 'Done' },
    }
    const stepMeta = STEP_HINTS[activeStep] ?? { hint: '', nextLabel: undefined }

    return (
        <MBIPageShell
            title="Budget Builder"
            subtitle="Hero prototype · 1 week → <24 hours · Amanda Renshaw (Account Manager)"
            icon={<Calculator className="h-5 w-5" />}
            activeApp="mbi-budget"
        >
            {inWizard ? (
                <BudgetWizardShell
                    activeStep={activeStep}
                    onStepClick={setManualStep}
                    onPrev={() => setManualStep(s => Math.max(0, s - 1))}
                    onNext={() => setManualStep(s => Math.min(WIZARD_STEPS.length - 1, s + 1))}
                    canAdvance={canAdvance}
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
                >
                    {activeStep === 0 && (
                        <BudgetIntakeStep
                            path={path}
                            onPathChange={() => { /* demo locks path */ }}
                            quickForm={quickForm}
                            onQuickFormChange={setQuickForm}
                            lockedToDemoPath
                        />
                    )}
                    {activeStep === 1 && (
                        <ParsingStep
                            selectedTier={selectedTier}
                            onSelectTier={setSelectedTier}
                            markupOverrides={markupOverrides}
                            onMarkupChange={handleMarkupChange}
                        />
                    )}
                    {activeStep === 2 && (
                        <ScenariosStep
                            scenarios={HERO_SCENARIOS}
                            selectedTier={selectedTier}
                            onSelectTier={setSelectedTier}
                            markupOverrides={markupOverrides}
                            onMarkupChange={handleMarkupChange}
                        />
                    )}
                    {activeStep === 3 && (
                        <ValidationStep
                            validations={[HERO_VALIDATION, HERO_VALIDATION_SECONDARY]}
                            statusById={validationStatus}
                            onStatusChange={handleValidationChange}
                        />
                    )}
                    {(activeStep === 4 || activeStep === 5) && (() => {
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
                        return activeStep === 4 ? (
                            <ReviewStep
                                client={hero.client}
                                scenario={selectedScenario}
                                markup={effectiveMarkup}
                                sifLineItems={sif?.lineItems ?? []}
                                validationsResolved={resolvedCount}
                                validationsTotal={totalValidations}
                                preventedImpact={preventedImpact}
                                approved={approved}
                                onApprove={handleApprove}
                            />
                        ) : (
                            <OutputStep
                                client={hero.client}
                                scenarioLabel={selectedScenario.label}
                                total={adjustedTotal}
                                markup={effectiveMarkup}
                                preventedImpact={preventedImpact}
                            />
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

            <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                    Pipeline stages · Intake → AI Parsing → Validation → Review → Approved
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                    New Budget
                </button>
            </div>

            <BudgetQueueKanban />

            <p className="text-xs text-muted-foreground italic text-center mt-4">
                Launch the MBI demo tour to walk Amanda's 4-step Budget Builder flow — or open the wizard manually.
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
