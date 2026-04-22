/**
 * COMPONENT: MBIWizardShell
 * PURPOSE: Generic wizard chrome shared across all MBI demo flows. Provides
 *          the same header (caption + stepper chips), body slot, inline CTA,
 *          and footer that Flow 1 uses — but flow-agnostic. Each flow owns
 *          its own step list and passes it via `steps`.
 *
 *          Renamed from BudgetWizardShell to signal Flow-2/3/4 reuse. The
 *          step config shape is exported so each flow can define its own
 *          ordered list of scenes.
 *
 * PROPS:
 *   - steps: WizardStepSpec[]       — ordered scenes for the flow
 *   - activeStep: number             — index into steps (0-based)
 *   - onPrev / onNext / onStepClick  — navigation handlers
 *   - canAdvance?: boolean           — gates the Next button
 *   - nextLabel?: string             — overrides default 'Continue · <next>' label
 *   - actionHint?: string            — 1-line hint under the active step name
 *   - persona?: ReactNode            — optional persona badge rendered in header
 *   - children: ReactNode            — active scene content
 *
 * USED BY: MBIBudgetPage (Flow 1), future flow pages.
 */

import type { ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'

export interface WizardStepSpec {
    id: string
    label: string
    shortLabel: string
}

interface MBIWizardShellProps {
    steps: WizardStepSpec[]
    activeStep: number
    onPrev?: () => void
    onNext?: () => void
    onStepClick?: (idx: number) => void
    canAdvance?: boolean
    nextLabel?: string
    actionHint?: string
    persona?: ReactNode
    children: ReactNode
}

export default function MBIWizardShell({
    steps,
    activeStep,
    onPrev,
    onNext,
    onStepClick,
    canAdvance = true,
    nextLabel,
    actionHint,
    persona,
    children,
}: MBIWizardShellProps) {
    const activeSpec = steps[activeStep]
    const nextSpec = steps[activeStep + 1]
    const resolvedNextLabel = nextLabel ?? (nextSpec ? `Continue · ${nextSpec.label}` : 'Done')
    const isLast = activeStep === steps.length - 1

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header: caption + persona + stepper chips */}
            <div className="px-5 pt-4 pb-3 border-b border-border bg-muted/10 dark:bg-zinc-900/40 space-y-3">
                {activeSpec && (
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex items-start gap-3">
                            {persona}
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Step {activeStep + 1} of {steps.length}
                                </div>
                                <div className="text-base font-bold text-foreground">{activeSpec.label}</div>
                                {actionHint && (
                                    <div className="text-xs text-muted-foreground mt-0.5">{actionHint}</div>
                                )}
                            </div>
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
                    {steps.map((step, i) => {
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
                                {i < steps.length - 1 && (
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
            </div>

            {/* Single nav controller — Back · pagination · primary action.
                Lives at the wizard footer so it is always reachable, with the
                primary action labelled by the next step's name (or 'Done' on
                the final step). Both handlers fire the same callbacks the
                demo guide listens to, so step changes stay in sync either way. */}
            {(onPrev || onNext) && (
                <div className="px-5 py-3 border-t border-border bg-muted/10 dark:bg-zinc-900/40 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <button
                            onClick={onPrev}
                            disabled={!onPrev || activeStep === 0}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </button>

                        <div className="text-[10px] text-muted-foreground tabular-nums hidden sm:block">
                            Step {activeStep + 1} of {steps.length}
                        </div>

                        <button
                            onClick={onNext}
                            disabled={!onNext || !canAdvance}
                            className="flex-1 sm:flex-none min-w-[180px] flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span>{isLast ? 'Done' : resolvedNextLabel}</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    {!canAdvance && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 text-center italic">
                            Complete this step's action to continue.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
