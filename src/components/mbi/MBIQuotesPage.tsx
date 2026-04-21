/**
 * COMPONENT: MBIQuotesPage
 * PURPOSE: Flow 3 — Quotes AI. 4-scene wizard following the PC team's
 *          proposal creation: incoming budget → SIF→CORE auto-import →
 *          AI validation (4→1+1 audit loop collapse) → send + handoff to
 *          Flow 4 (Design AI).
 *
 *          Mirrors Flow 1/2 wizard pattern. Marcia Ludwig (Director of PM)
 *          renders as persona — though the 'doers' are Amy Behl + Mario +
 *          Erin (hybrid PC/designer). For the demo, Marcia owns the flow.
 *
 * DEMO TOUR: m3.1 → m3.4 map 1:1 to wizard scenes 0–3.
 */

import { useEffect, useState } from 'react'
import { FileSearch } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import QuoteIncomingBudget from './QuoteIncomingBudget'
import QuoteAutoImportScene from './QuoteAutoImportScene'
import QuoteValidationScene from './QuoteValidationScene'
import QuoteSendProposalScene from './QuoteSendProposalScene'
import { useDemo } from '../../context/DemoContext'

const QUOTES_STEPS: WizardStepSpec[] = [
    { id: 'incoming', label: 'Incoming budget', shortLabel: '1. Incoming' },
    { id: 'auto-import', label: 'SIF → CORE', shortLabel: '2. Auto-import' },
    { id: 'validation', label: 'AI validation', shortLabel: '3. Validation' },
    { id: 'send', label: 'Send proposal', shortLabel: '4. Send' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm3.1': 0,
    'm3.2': 1,
    'm3.3': 2,
    'm3.4': 3,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm3.1',
    1: 'm3.2',
    2: 'm3.3',
    3: 'm3.4',
}

const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
    0: { hint: 'Signed budget from Amanda · all 4 readiness checks pass · PC can pick up.', nextLabel: 'Watch SIF → CORE' },
    1: { hint: 'Zero keystrokes · 24 fields flow from SIF into a CORE proposal draft.', nextLabel: 'Run AI validation' },
    2: { hint: '4 audit loops → 1 AI pass + 1 human review · Spec Check is MBI\'s #1 Q10 priority.', nextLabel: 'Send the proposal' },
    3: { hint: 'Approve + send · orders route to each manufacturer · hand off upstream to Design AI.', nextLabel: 'Done' },
}

export default function MBIQuotesPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null
    const demoWizardIdx = demoStepId && demoStepId in STEP_TO_WIZARD_INDEX
        ? STEP_TO_WIZARD_INDEX[demoStepId]
        : null

    const [activeStep, setActiveStep] = useState(0)
    const inWizard = demoWizardIdx !== null || !isDemoActive

    useEffect(() => {
        if (demoWizardIdx !== null) setActiveStep(demoWizardIdx)
    }, [demoWizardIdx])

    const navigateWizard = (idx: number) => {
        setActiveStep(idx)
        if (!isDemoActive) return
        const targetId = WIZARD_INDEX_TO_STEP[idx]
        if (!targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }

    const stepMeta = STEP_HINTS[activeStep] ?? { hint: '', nextLabel: undefined }

    return (
        <MBIPageShell
            title="Quotes AI"
            subtitle="Phase 4 · PC bottleneck (3.5 PCs / 29 staff) → reviewers, not builders · 2h per proposal → 12 min"
            icon={<FileSearch className="h-5 w-5" />}
            activeApp="mbi-quotes"
        >
            {inWizard ? (
                <MBIWizardShell
                    steps={QUOTES_STEPS}
                    activeStep={activeStep}
                    onStepClick={navigateWizard}
                    onPrev={() => navigateWizard(Math.max(0, activeStep - 1))}
                    onNext={() => navigateWizard(Math.min(QUOTES_STEPS.length - 1, activeStep + 1))}
                    canAdvance
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
                    persona={
                        <MBIPersonaBadge
                            name="Marcia Ludwig"
                            role="Director of PM · 3.5 PCs for 29 staff"
                            tone="neutral"
                        />
                    }
                >
                    {activeStep === 0 && <QuoteIncomingBudget />}
                    {activeStep === 1 && <QuoteAutoImportScene />}
                    {activeStep === 2 && <QuoteValidationScene />}
                    {activeStep === 3 && <QuoteSendProposalScene />}
                </MBIWizardShell>
            ) : (
                <OverviewStub />
            )}
        </MBIPageShell>
    )
}

function OverviewStub() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard value="3.5 / 29" label="PCs / staff (bottleneck)" accent="text-foreground" />
            <StatCard value="4 → 1+1" label="Audit loops (collapsed)" accent="text-success" />
            <StatCard value="9.08/10" label="Spec Check Q10 priority" accent="text-zinc-900 dark:text-primary" />
            <StatCard value="2h → 12m" label="Per proposal PC effort" accent="text-success" />
        </div>
    )
}

function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-4">
            <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
        </div>
    )
}
