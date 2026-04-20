/**
 * COMPONENT: ReviewStep
 * PURPOSE: Wizard step 5 — Review. Consolidates everything the user built
 *          across the previous steps into a final approval dashboard before
 *          client delivery.
 *
 *          Shows: client context · selected scenario summary · line items
 *          from SIF · resolved validations counter · Approve Budget CTA
 *          gated until everything is in order.
 *
 * PROPS:
 *   - client: { name, project, vertical }
 *   - scenario: Scenario                 — the selected one
 *   - markup: number                     — effective markup %
 *   - sifLineItems: LineItem[]           — items to review
 *   - validationsResolved: number        — X of Y
 *   - validationsTotal: number
 *   - preventedImpact: number            — $ aggregated from accepted
 *   - approved: boolean
 *   - onApprove: () => void
 *
 * STATES:
 *   - pre-approval: all UI visible, Approve button primary
 *   - approved: CTA replaced by success check + next-step hint
 *   - gated: if validations not all resolved, Approve is disabled
 *
 * DS TOKENS: bg-card · border-border · rounded-2xl · primary/success/muted
 *
 * USED BY: MBIBudgetPage (m1.4 first half)
 */

import { Briefcase, FileCheck2, ShieldCheck, Check, AlertTriangle } from 'lucide-react'
import type { Scenario, LineItem, Vertical } from '../../config/profiles/mbi-data'

interface ReviewStepProps {
    client: { name: string; project: string; vertical: Vertical }
    scenario: Scenario
    markup: number
    sifLineItems: LineItem[]
    validationsResolved: number
    validationsTotal: number
    preventedImpact: number
    approved: boolean
    onApprove: () => void
}

export default function ReviewStep({
    client,
    scenario,
    markup,
    sifLineItems,
    validationsResolved,
    validationsTotal,
    preventedImpact,
    approved,
    onApprove,
}: ReviewStepProps) {
    const allValidationsResolved = validationsResolved === validationsTotal
    const markupFactor = (1 + markup) / (1 + scenario.markup)
    const adjustedTotal = Math.round(scenario.total * markupFactor)

    return (
        <div className="space-y-4">
            {/* Intro banner */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-ai/5 border border-ai/10 rounded-xl p-3">
                <FileCheck2 className="h-4 w-4 text-ai shrink-0" />
                <span>
                    Final review before client delivery. All scenario choices and validation
                    decisions are captured here. Approving locks the budget and triggers
                    artifact generation.
                </span>
            </div>

            {/* Three-column summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client card */}
                <div className="bg-muted/20 border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                            <Briefcase className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Client</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">{client.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{client.project}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 capitalize">{client.vertical}</div>
                </div>

                {/* Scenario card */}
                <div className="bg-muted/20 border border-primary/30 ring-2 ring-primary/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                            <FileCheck2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scenario selected</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">{scenario.label}</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums mt-1">${adjustedTotal.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        {scenario.lineItemCount} items · markup <span className="tabular-nums">{Math.round(markup * 100)}%</span>
                    </div>
                </div>

                {/* Validations card */}
                <div className={`bg-muted/20 border rounded-2xl p-4 ${allValidationsResolved ? 'border-success/30' : 'border-amber-300 dark:border-amber-500/30'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${allValidationsResolved ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validations</span>
                    </div>
                    <div className="text-sm font-bold text-foreground tabular-nums">
                        {validationsResolved} of {validationsTotal} resolved
                    </div>
                    {preventedImpact > 0 && (
                        <div className="text-2xl font-bold text-success tabular-nums mt-1">
                            ${preventedImpact.toLocaleString()}
                        </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">
                        {allValidationsResolved ? 'Prevented before client' : 'Pending before approval'}
                    </div>
                </div>
            </div>

            {/* Line items table */}
            <div className="bg-muted/20 border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-foreground">Line items</div>
                        <div className="text-[10px] text-muted-foreground">
                            From SIF · {sifLineItems.length} items · post-validation
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                        {sifLineItems.filter(li => li.quantity > 0).length} active
                    </div>
                </div>
                <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {sifLineItems.map((li, i) => (
                        <div key={i} className="px-4 py-2 flex items-center gap-3 text-xs">
                            <div className="font-mono text-muted-foreground w-24 shrink-0 truncate">{li.sku}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-foreground truncate">{li.description}</div>
                                <div className="text-[10px] text-muted-foreground">{li.manufacturer} · {li.finish}</div>
                            </div>
                            <div className="text-muted-foreground tabular-nums shrink-0 w-12 text-right">×{li.quantity}</div>
                            <div className="font-bold text-foreground tabular-nums shrink-0 w-20 text-right">${li.total.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Approve CTA */}
            <div className="bg-muted/20 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-bold text-foreground">Ready to approve?</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        {approved
                            ? 'Budget approved · artifacts generated below'
                            : allValidationsResolved
                                ? `Approving will generate the Excel breakdown and the MBI-branded client PDF, and log a version in SharePoint.`
                                : `Resolve all ${validationsTotal - validationsResolved} pending validation${(validationsTotal - validationsResolved) !== 1 ? 's' : ''} before approval.`
                        }
                    </div>
                </div>
                {!approved ? (
                    <button
                        onClick={onApprove}
                        disabled={!allValidationsResolved}
                        className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {!allValidationsResolved && <AlertTriangle className="h-4 w-4" />}
                        <Check className="h-4 w-4" />
                        Approve budget
                    </button>
                ) : (
                    <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-success px-5 py-2.5 bg-success/10 rounded-xl border border-success/30">
                        <Check className="h-4 w-4" />
                        Approved
                    </div>
                )}
            </div>
        </div>
    )
}
