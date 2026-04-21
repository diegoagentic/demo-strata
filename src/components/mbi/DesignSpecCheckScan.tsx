/**
 * COMPONENT: DesignSpecCheckScan
 * PURPOSE: Flow 4 · Scene 1 — Animated Spec Check running across the 47
 *          line items of Beth's BJC ICU project. 4 checks run sequentially
 *          with live progress, then a complete state invites Beth to review
 *          the 1 finding that surfaced.
 *
 *          Pattern mirrors PreflightScanChain from Flow 1 but tuned for
 *          design-level spec validation (dimensions · finish · palette ·
 *          availability).
 *
 * USED BY: MBIDesignPage (wizard scene 1)
 */

import { useEffect, useState } from 'react'
import {
    CheckCircle2, Loader2, ShieldCheck, ArrowRight, Ruler, Palette,
    Droplet, Package, AlertTriangle,
} from 'lucide-react'

interface SpecCheck {
    id: string
    label: string
    detail: string
    icon: React.ReactNode
    findings: number
}

const CHECKS: SpecCheck[] = [
    {
        id: 'dimensions',
        label: 'Dimensions',
        detail: 'Every panel, worksurface, and fixture matches CET footprint',
        icon: <Ruler className="h-4 w-4" />,
        findings: 0,
    },
    {
        id: 'finish',
        label: 'Finish consistency',
        detail: 'Every upholstery + laminate + powder-coat matches its spec sheet',
        icon: <Droplet className="h-4 w-4" />,
        findings: 1,
    },
    {
        id: 'palette',
        label: 'Palette match',
        detail: 'All items align with Marine Blue project palette',
        icon: <Palette className="h-4 w-4" />,
        findings: 1,
    },
    {
        id: 'availability',
        label: 'Vendor availability',
        detail: 'Every SKU in stock or lead-time compatible with install date',
        icon: <Package className="h-4 w-4" />,
        findings: 0,
    },
]

export default function DesignSpecCheckScan() {
    const [phase, setPhase] = useState(-1)
    const [scanning, setScanning] = useState(false)

    const handleStart = () => {
        setScanning(true)
        setPhase(0)
    }

    useEffect(() => {
        if (phase < 0 || phase >= CHECKS.length) return
        const t = setTimeout(() => setPhase(p => p + 1), 1400)
        return () => clearTimeout(t)
    }, [phase])

    const done = phase >= CHECKS.length
    const runningCheck = phase >= 0 && !done ? CHECKS[phase] : null
    const totalFindings = CHECKS.reduce((acc, c) => acc + c.findings, 0)
    const progressPct = Math.round((Math.min(phase, CHECKS.length) / CHECKS.length) * 100)

    return (
        <div className="space-y-4">
            {/* Start / Status card */}
            <div className={`
                border rounded-2xl p-5 flex items-start gap-4 transition-colors
                ${done
                    ? 'bg-success/10 dark:bg-success/15 border-success/40'
                    : scanning
                        ? 'bg-ai/5 dark:bg-ai/10 border-ai/40'
                        : 'bg-card dark:bg-zinc-800/40 border-border'
                }
            `}>
                <div className={`
                    h-12 w-12 rounded-full flex items-center justify-center shrink-0
                    ${done ? 'bg-success/15 text-success' : 'bg-ai/15 text-ai'}
                `}>
                    {done
                        ? <CheckCircle2 className="h-6 w-6" />
                        : scanning
                            ? <Loader2 className="h-6 w-6 animate-spin" />
                            : <ShieldCheck className="h-6 w-6" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground">
                        {done
                            ? 'Spec Check complete · 1 finding ready for review'
                            : scanning
                                ? `Scanning · ${runningCheck?.label ?? 'Running'}…`
                                : "Ready to run Spec Check on BJC ICU Expansion"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        {done
                            ? `Scanned 47 line items in ${(CHECKS.length * 1.4).toFixed(1)} seconds · ${totalFindings} finding${totalFindings !== 1 ? 's' : ''} surfaced · 3 of 4 checks clean`
                            : scanning
                                ? runningCheck?.detail
                                : '4 AI checks · dimensions, finish, palette, availability · under 5 minutes'
                        }
                    </div>
                    {scanning && (
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>{progressPct}% complete</span>
                                <span>{Math.min(phase, CHECKS.length)} / {CHECKS.length} checks</span>
                            </div>
                            <div className="h-1.5 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-success' : 'bg-ai'}`}
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {!scanning && (
                    <button
                        onClick={handleStart}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Run Spec Check
                    </button>
                )}
            </div>

            {/* Check-by-check list */}
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHECKS.map((check, i) => {
                    const isDone = done || i < phase
                    const isRunning = scanning && !done && i === phase
                    const isPending = !scanning || (!isDone && !isRunning)
                    const hasFindings = isDone && check.findings > 0

                    return (
                        <li
                            key={check.id}
                            className={`
                                rounded-xl border border-l-4 p-3 transition-colors
                                ${isDone && hasFindings ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 border-l-amber-500' : ''}
                                ${isDone && !hasFindings ? 'bg-success/5 dark:bg-success/10 border-success/30 border-l-success' : ''}
                                ${isRunning ? 'bg-ai/10 dark:bg-ai/15 border-ai/40 border-l-ai' : ''}
                                ${isPending ? 'bg-zinc-50/50 dark:bg-zinc-800/40 border-border border-l-muted-foreground/30 opacity-60' : ''}
                            `}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={`
                                    h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                                    ${isDone && hasFindings ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : ''}
                                    ${isDone && !hasFindings ? 'bg-success/15 text-success' : ''}
                                    ${isRunning ? 'bg-ai/15 text-ai' : ''}
                                    ${isPending ? 'bg-muted text-muted-foreground' : ''}
                                `}>
                                    {isDone && hasFindings && <AlertTriangle className="h-4 w-4" />}
                                    {isDone && !hasFindings && <CheckCircle2 className="h-4 w-4" />}
                                    {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isPending && check.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">{check.label}</span>
                                        {isDone && (
                                            <span className={`
                                                text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md
                                                ${hasFindings ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-success/15 text-success'}
                                            `}>
                                                {hasFindings ? `${check.findings} finding${check.findings !== 1 ? 's' : ''}` : 'Clean'}
                                            </span>
                                        )}
                                        {isRunning && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-ai/15 text-ai">
                                                Scanning
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{check.detail}</div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ol>

            {/* Forward cue once done */}
            {done && (
                <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 animate-in fade-in duration-300">
                    <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                    <span className="flex-1 text-foreground">
                        Next: Beth reviews the palette finding on <strong>Line 23</strong> (HON Ignition chair · Forest Green vs Marine Blue). One click to swap — the exact class of mistake that used to slip to the client.
                    </span>
                </div>
            )}
        </div>
    )
}
