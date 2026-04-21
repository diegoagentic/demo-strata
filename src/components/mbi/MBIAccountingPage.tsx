/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Flow 2 — Accounting AI, packaged in MBIWizardShell with 4 scenes
 *          that follow Kathy Belleville's morning: queue → HealthTrust
 *          exception → Non-EDI reconciliation → AR wrap-up + Flow 3 handoff.
 *
 *          Mirrors Flow 1's wizard pattern — shared stepper, persona badge,
 *          per-step CTA, FlowHandoff at the end.
 *
 * DEMO TOUR: m2.1 → m2.4 map 1:1 to wizard scenes 0–3. Outside a demo step
 * the user navigates freely via the stepper chips + Back/Next.
 */

import { useEffect, useState } from 'react'
import { Receipt, Heart, GitCompare, DollarSign } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import AccountingMorningQueue from './AccountingMorningQueue'
import HealthTrustExceptionScene from './HealthTrustExceptionScene'
import NonEDIReconcilerScene from './NonEDIReconcilerScene'
import ARAgingWrapScene from './ARAgingWrapScene'
import { useDemo } from '../../context/DemoContext'

const ACCOUNTING_STEPS: WizardStepSpec[] = [
    { id: 'morning', label: 'Morning queue', shortLabel: '1. Queue' },
    { id: 'healthtrust', label: 'HealthTrust', shortLabel: '2. HealthTrust' },
    { id: 'non-edi', label: 'Non-EDI recon', shortLabel: '3. Non-EDI' },
    { id: 'ar-wrap', label: 'AR wrap-up', shortLabel: '4. AR wrap' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm2.1': 0,
    'm2.2': 1,
    'm2.3': 2,
    'm2.4': 3,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm2.1',
    1: 'm2.2',
    2: 'm2.3',
    3: 'm2.4',
}

const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
    0: { hint: 'Strata pre-processed 12 invoices overnight · you review only the 2 exceptions.', nextLabel: 'Review HealthTrust royalty' },
    1: { hint: 'Approve the auto-calculated 3% royalty · or override with a logged reason · or escalate to Lynda.', nextLabel: 'Reconcile non-EDI' },
    2: { hint: 'Line-by-line diff vs PO · accept variances that match your delivery, override with a reason for the rest.', nextLabel: 'Close with AR wrap' },
    3: { hint: 'Live AR aging · collection emails pre-drafted · close the morning to continue.', nextLabel: 'Done' },
}

export default function MBIAccountingPage() {
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
            title="Accounting AI"
            subtitle="Phase 2 quick wins · Kathy Belleville (Controller) · morning routine · 4h → 18 min"
            icon={<Receipt className="h-5 w-5" />}
            activeApp="mbi-accounting"
        >
            {inWizard ? (
                <MBIWizardShell
                    steps={ACCOUNTING_STEPS}
                    activeStep={activeStep}
                    onStepClick={navigateWizard}
                    onPrev={() => navigateWizard(Math.max(0, activeStep - 1))}
                    onNext={() => navigateWizard(Math.min(ACCOUNTING_STEPS.length - 1, activeStep + 1))}
                    canAdvance
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
                    persona={
                        <MBIPersonaBadge
                            name="Kathy Belleville"
                            role="Controller · Accounting"
                            isPilot
                            tone="ai"
                        />
                    }
                >
                    {activeStep === 0 && <AccountingMorningQueue />}
                    {activeStep === 1 && <HealthTrustExceptionScene />}
                    {activeStep === 2 && <NonEDIReconcilerScene />}
                    {activeStep === 3 && <ARAgingWrapScene />}
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
            <StatCard icon={<Receipt className="h-4 w-4" />} value="12" label="Invoices processed overnight" accent="text-foreground" />
            <StatCard icon={<Heart className="h-4 w-4" />} value="2" label="HealthTrust royalty flagged" accent="text-zinc-900 dark:text-primary" />
            <StatCard icon={<GitCompare className="h-4 w-4" />} value="2" label="Non-EDI exceptions" accent="text-amber-600 dark:text-amber-400" />
            <StatCard icon={<DollarSign className="h-4 w-4" />} value="$240K" label="AR live · forecast refreshed" accent="text-success" />
        </div>
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
