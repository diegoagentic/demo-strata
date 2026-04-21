/**
 * COMPONENT: BudgetWizardShell
 * PURPOSE: 6-step wizard chrome for the Budget Builder. Header = caption +
 *          stepper chips. Body = active step content. Footer = Back + big
 *          primary CTA. Chips are always clickable; Next label names the
 *          action per step (e.g. "Parse SIF + CAP").
 *
 *          Layout rules: header is NOT sticky (avoids overlapping the
 *          active-step caption). The big primary CTA is rendered inline at
 *          the end of the step body via <WizardPrimaryCTA /> for visibility,
 *          AND in the footer as a persistent nav bar.
 *
 * PROPS:
 *   - activeStep: number (0-5)
 *   - onPrev / onNext / onStepClick
 *   - canAdvance?: boolean — gates the Next button
 *   - nextLabel?: string   — overrides default "Continue · <next>" label
 *   - actionHint?: string  — 1-line hint under the active step name
 *
 * USED BY: MBIBudgetPage
 */

import type { ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface WizardStepSpec {
    id: string
    label: string
    shortLabel: string
}

export const WIZARD_STEPS: WizardStepSpec[] = [
    { id: 'intake', label: 'Intake', shortLabel: '1. Intake' },
    { id: 'parsing', label: 'AI Parsing', shortLabel: '2. Parsing' },
    { id: 'scenarios', label: 'Scenarios', shortLabel: '3. Scenarios' },
    { id: 'validation', label: 'Validation', shortLabel: '4. Validation' },
    { id: 'review', label: 'Review', shortLabel: '5. Review' },
    { id: 'output', label: 'Output', shortLabel: '6. Output' },
]

interface BudgetWizardShellProps {
    activeStep: number
    onPrev?: () => void
    onNext?: () => void
    onStepClick?: (idx: number) => void
    canAdvance?: boolean
    nextLabel?: string
    actionHint?: string
    children: ReactNode
}

export default function BudgetWizardShell({
    activeStep,
    onPrev,
    onNext,
    onStepClick,
    canAdvance = true,
    nextLabel,
    actionHint,
    children,
}: BudgetWizardShellProps) {
    const activeSpec = WIZARD_STEPS[activeStep]
    const nextSpec = WIZARD_STEPS[activeStep + 1]
    const resolvedNextLabel = nextLabel ?? (nextSpec ? `Continue · ${nextSpec.label}` : 'Done')
    const isLast = activeStep === WIZARD_STEPS.length - 1

    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl overflow-hidden">
            {/* Header: caption (what you're doing) + stepper chips */}
            <div className="px-5 pt-4 pb-3 border-b border-border bg-muted/10 dark:bg-zinc-900/40 space-y-3">
                {activeSpec && (
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Step {activeStep + 1} of {WIZARD_STEPS.length}
                            </div>
                            <div className="text-base font-bold text-foreground">{activeSpec.label}</div>
                            {actionHint && (
                                <div className="text-xs text-muted-foreground mt-0.5">{actionHint}</div>
                            )}
                        </div>
                        {nextSpec && (
                            <div className="text-[10px] text-muted-foreground text-right shrink-0">
                                <div className="font-bold uppercase tracking-wider">Next</div>
                                <div className="truncate max-w-[180px]">{nextSpec.label}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {WIZARD_STEPS.map((step, i) => {
                        const isActive = i === activeStep
                        const isCompleted = i < activeStep
                        const clickable = !!onStepClick
                        const Comp: React.ElementType = clickable ? 'button' : 'div'
                        return (
                            <div key={step.id} className="flex items-center gap-1 shrink-0">
                                <Comp
                                    onClick={clickable ? () => onStepClick!(i) : undefined}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                        ${isActive ? 'bg-primary/10 text-zinc-900 dark:text-primary border-primary/40 shadow-sm' : ''}
                                        ${isCompleted ? 'text-success border-success/30 bg-success/5' : ''}
                                        ${!isActive && !isCompleted ? 'text-muted-foreground border-border' : ''}
                                        ${clickable ? 'hover:border-primary/40 hover:text-foreground cursor-pointer' : ''}
                                    `}
                                >
                                    <div
                                        className={`
                                            h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                            ${isActive ? 'bg-primary text-primary-foreground' : ''}
                                            ${isCompleted ? 'bg-success text-white' : ''}
                                            ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                                        `}
                                    >
                                        {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                                    </div>
                                    <span className="whitespace-nowrap">{step.label}</span>
                                </Comp>
                                {i < WIZARD_STEPS.length - 1 && (
                                    <div className={`h-px w-3 shrink-0 ${i < activeStep ? 'bg-success/50' : 'bg-border'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                {children}

                {/* Inline primary CTA — Back (secondary) + Next (brand) at end of step */}
                {!isLast && (
                    <div className="pt-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={onPrev}
                                disabled={!onPrev || activeStep === 0}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-foreground bg-background dark:bg-zinc-800 border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:px-6"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Back</span>
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!onNext || !canAdvance}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <span>{resolvedNextLabel}</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        {!canAdvance && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 text-center mt-2 italic">
                                Complete this step's action to continue.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Nav footer — Back on the left, secondary Next on the right */}
            {(onPrev || onNext) && (
                <div className="px-5 py-3 border-t border-border bg-muted/10 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
                    <button
                        onClick={onPrev}
                        disabled={!onPrev || activeStep === 0}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="text-[10px] text-muted-foreground tabular-nums hidden sm:block">
                        {activeStep + 1} / {WIZARD_STEPS.length}
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!onNext || !canAdvance || isLast}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLast ? 'Done' : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
