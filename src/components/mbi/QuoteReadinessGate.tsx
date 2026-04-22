/**
 * COMPONENT: QuoteReadinessGate
 * PURPOSE: Checklist enforced before the quote workflow starts. Today MBI has
 *          no trigger or readiness criteria — premature quotes waste PC time.
 *          Strata gates the handoff: budget confirmed, contract identified,
 *          scope locked, design sign-off. All must be ✓ before PC picks it up.
 *
 *          (Teams-bot-driven in production — for demo shown as a 4-item checklist)
 *
 * PROPS:
 *   - items: optional overrides; defaults to hero scenario readiness
 *
 * STATES: static (all 4 checkmarks present — the hero budget passed the gate)
 *
 * DS TOKENS: bg-card · border-success · text-success
 *
 * USED BY: MBIQuotesPage
 */

import { CheckCircle2, Shield, Users } from 'lucide-react'
import { StatusBadge } from '../shared'

const DEFAULT_CHECKS = [
    { label: 'Budget confirmed', detail: 'BDG-2026-002 · Enterprise Holdings · $372,500 · approved' },
    { label: 'Contract identified', detail: 'HNI Corporate · 55% discount confirmed' },
    { label: 'Scope locked', detail: '45 workstations · 8 offices · 1 lounge · no pending changes' },
    { label: 'Design sign-off', detail: 'Beth Gianino · SIF v5 validated · no open spec flags' },
]

export default function QuoteReadinessGate() {
    return (
        <div className="bg-success/5 border border-success/30 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                            <div className="text-sm font-bold text-foreground">Quote readiness gate passed</div>
                            <div className="text-[11px] text-muted-foreground">
                                Enforced by Teams bot · all 4 criteria met before PC picks up
                            </div>
                        </div>
                        <StatusBadge label="PC bottleneck avoided" tone="success" size="sm" icon={<Users className="h-3 w-3" />} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DEFAULT_CHECKS.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 bg-card border border-border rounded-lg px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">{c.label}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{c.detail}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
