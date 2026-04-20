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
    onStepClick?: (idx: number) => void
    canAdvance?: boolean
    /** Label for the Next button — name the action ("Parse files", "Pick scenario"). */
    nextLabel?: string
    /** Subtitle under the active step name — short hint about the primary action. */
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
    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl overflow-hidden">
            {/* 6-step indicator — sticky for long-scrolling step content */}
            <div className="sticky top-20 z-20 px-4 py-3 border-b border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 dark:supports-[backdrop-filter]:bg-zinc-900/80">
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

            {/* Active-step caption — names what the user is doing here */}
            {activeSpec && (
                <div className="px-5 pt-4 pb-2 flex items-baseline justify-between gap-3 flex-wrap">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Step {activeStep + 1} of {WIZARD_STEPS.length}
                        </div>
                        <div className="text-base font-bold text-foreground">{activeSpec.label}</div>
                        {actionHint && (
                            <div className="text-xs text-muted-foreground mt-0.5">{actionHint}</div>
                        )}
                    </div>
                    {nextSpec && (
                        <div className="text-[10px] text-muted-foreground text-right">
                            <div className="font-bold uppercase tracking-wider">Next</div>
                            <div>{nextSpec.label}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="px-5 pt-2 pb-5 space-y-4">
                {children}
            </div>

            {/* Nav footer — always rendered when wired so the user can navigate */}
            {(onPrev || onNext) && (
                <div className="sticky bottom-0 px-5 py-3 border-t border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 dark:supports-[backdrop-filter]:bg-zinc-900/80 flex items-center justify-between gap-3">
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
                        disabled={!onNext || !canAdvance || activeStep === WIZARD_STEPS.length - 1}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                        {nextLabel ?? (nextSpec ? `Continue · ${nextSpec.label}` : 'Done')}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
