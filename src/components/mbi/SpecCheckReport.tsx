/**
 * COMPONENT: SpecCheckReport
 * PURPOSE: AI Spec Check Engine output — scans CET BOM for finish
 *          inconsistencies, quantity outliers, missing options, and
 *          non-catalog items. Q10 #1 team priority at 9.08/10.
 *
 *          Used in BOTH Quotes AI (pre-handoff validation) and Design AI
 *          (in-CET spec check via Teams bot). Same component, same data shape.
 *
 * PROPS:
 *   - reportId?: string   — defaults to 'SC-002' (Enterprise HQ hero)
 *
 * STATES: static (shows mock report with 3 flags)
 *
 * DS TOKENS: bg-card · red/amber/info by severity · ai accent for AI label
 *
 * USED BY: MBIQuotesPage, MBIDesignPage
 */

import { Sparkles, AlertTriangle, AlertCircle, Info, Scan } from 'lucide-react'
import { MBI_SPEC_CHECKS } from '../../config/profiles/mbi-data'

interface SpecCheckReportProps {
    reportId?: string
}

const FLAG_TYPE_META = {
    finish: { label: 'Finish', icon: '🎨' },
    quantity: { label: 'Quantity', icon: '#' },
    option: { label: 'Option', icon: '⚙' },
    'non-catalog': { label: 'Non-catalog', icon: '📋' },
}

export default function SpecCheckReport({ reportId = 'SC-002' }: SpecCheckReportProps) {
    const report = MBI_SPEC_CHECKS.find(r => r.id === reportId) ?? MBI_SPEC_CHECKS[1]
    const criticalCount = report.flags.filter(f => f.severity === 'critical').length
    const warningCount = report.flags.filter(f => f.severity === 'warning').length
    const infoCount = report.flags.filter(f => f.severity === 'info').length

    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                        <Scan className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">AI Spec Check · {report.projectId}</div>
                        <div className="text-[10px] text-muted-foreground">
                            Q10 priority #1 (9.08/10) · {report.lineItemsScanned} line items scanned in &lt; 5 min
                        </div>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    report.status === 'clean' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}>
                    {report.status === 'clean' ? 'Clean' : 'Needs review'}
                </span>
            </div>

            {/* Summary counts */}
            <div className="px-4 py-3 border-b border-border grid grid-cols-4 gap-2">
                <SummaryCell label="Scanned" value={report.lineItemsScanned} className="text-foreground" />
                <SummaryCell label="Critical" value={criticalCount} className="text-red-600 dark:text-red-400" />
                <SummaryCell label="Warnings" value={warningCount} className="text-amber-600 dark:text-amber-400" />
                <SummaryCell label="Info" value={infoCount} className="text-info" />
            </div>

            {/* Flags list */}
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {report.flags.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                        No flags — all line items passed spec check.
                    </div>
                ) : (
                    report.flags.map((flag, i) => {
                        const theme = (() => {
                            if (flag.severity === 'critical') return {
                                icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
                                pill: 'bg-red-500/10 text-red-700 dark:text-red-400',
                                bg: 'bg-red-50/40 dark:bg-red-500/5',
                            }
                            if (flag.severity === 'warning') return {
                                icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                                pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                                bg: 'bg-amber-50/30 dark:bg-amber-500/5',
                            }
                            return {
                                icon: <Info className="h-4 w-4 text-info" />,
                                pill: 'bg-info/10 text-info',
                                bg: '',
                            }
                        })()
                        const typeMeta = FLAG_TYPE_META[flag.type]
                        return (
                            <div key={i} className={`px-4 py-2.5 flex items-start gap-3 ${theme.bg}`}>
                                <div className="shrink-0 mt-0.5">{theme.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${theme.pill}`}>
                                            {typeMeta.label}
                                        </span>
                                        {flag.lineRef && (
                                            <span className="text-[9px] font-mono text-muted-foreground">{flag.lineRef}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-foreground">{flag.description}</div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-ai font-bold shrink-0">
                                    <Sparkles className="h-3 w-3" />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-ai shrink-0" />
                <span>
                    Replaces 2 of 3 manual audit loops. Before: "everything's blue, this one's green" caught after client sees it.
                </span>
            </div>
        </div>
    )
}

function SummaryCell({ label, value, className }: { label: string; value: number; className: string }) {
    return (
        <div className="text-center">
            <div className={`text-lg font-bold tabular-nums ${className}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
    )
}
