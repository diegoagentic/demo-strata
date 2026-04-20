/**
 * COMPONENT: BudgetWizardShell
 * PURPOSE: 6-step wizard chrome for the Budget Builder. Provides consistent
 *          step indicator, title, and body slot. Each step's content is rendered
 *          as children. The demo tour drives the active step; manual nav is
 *          available via Back/Next when NOT in a demo tour.
 *
 * PROPS:
 *   - activeStep: number (0-5)     — which wizard step is active
 *   - onPrev?: () => void          — back button handler (disabled if null)
 *   - onNext?: () => void          — next button handler (disabled if null)
 *   - canAdvance?: boolean         — gates the Next button
 *   - children: ReactNode          — active step content
 *
 * STATES:
 *   - default        — step indicator + content + nav buttons
 *   - canAdvance=false — next button disabled
 *   - no onPrev/onNext — buttons hidden (demo-tour mode)
 *
 * DS TOKENS:
 *   - bg-card · border-border · rounded-2xl
 *   - active: bg-primary/10 + text-primary + border-primary
 *   - completed: text-success · border-success/30
 *   - pending: text-muted-foreground · border-border
 *
 * USED BY: MBIBudgetPage (wraps all step views)
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
    canAdvance?: boolean
    children: ReactNode
}

export default function BudgetWizardShell({
    activeStep,
    onPrev,
    onNext,
    canAdvance = true,
    children,
}: BudgetWizardShellProps) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* 6-step indicator */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {WIZARD_STEPS.map((step, i) => {
                        const isActive = i === activeStep
                        const isCompleted = i < activeStep
                        return (
                            <div key={step.id} className="flex items-center gap-1 shrink-0">
                                <div
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
                                        ${isActive ? 'bg-primary/10 text-zinc-900 dark:text-primary border-primary/30' : ''}
                                        ${isCompleted ? 'text-success border-success/30 bg-success/5' : ''}
                                        ${!isActive && !isCompleted ? 'text-muted-foreground border-border' : ''}
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
                                </div>
                                {i < WIZARD_STEPS.length - 1 && (
                                    <div className="h-px w-3 bg-border shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                {children}
            </div>

            {/* Nav footer — only shown when manual nav is allowed */}
            {(onPrev || onNext) && (
                <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
                    <button
                        onClick={onPrev}
                        disabled={!onPrev || activeStep === 0}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="text-xs text-muted-foreground">
                        Step {activeStep + 1} of {WIZARD_STEPS.length}
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!onNext || !canAdvance || activeStep === WIZARD_STEPS.length - 1}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
