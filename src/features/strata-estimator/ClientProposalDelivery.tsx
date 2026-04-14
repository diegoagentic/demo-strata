// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Client Representative Proposal Handoff
// v7 Flow 2 · w2.3 (Sales Coordinator hands the approved proposal to the client representative)
//
// Replaces the normal ESTIMATOR tab content (Dossier → Hero → BoM → Constraints)
// while the demo is on w2.3. Surfaces stages 15-17 of WRG's 18-stage AS-IS
// process from WRG_CONSOLIDATED_REFERENCE.md §2:
//
//   | 15-16 | Salesperson | CORE emails Sales. Quote reviewed and accepted. |
//   | 17    | SAC         | Combines labor + product quote, applies markup,
//                           sends to the client's representative.           |
//
// 4-phase beat timeline:
//   email-received → reviewing-pdf → sending → delivered
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import {
    ArrowRight,
    Bell,
    Check,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Inbox,
    Mail,
    MousePointer2,
    RotateCcw,
    Send,
    Sparkles,
} from 'lucide-react'

type DeliveryPhase =
    | 'rep-preview'
    | 'email-received'
    | 'reviewing-pdf'
    | 'sending'
    | 'delivered'

// Fake list of other vendor quotes the JPS procurement rep is tracking.
// Only used for the w2.3 opening cutaway so the audience can see *where* the
// proposal lands on the client side before we return to Riley's send flow.
const EXISTING_VENDOR_QUOTES: {
    id: string
    vendor: string
    project: string
    amount: string
    received: string
    status: string
}[] = [
    { id: 'q1', vendor: 'Steelcase', project: 'Executive floor refresh',  amount: '$84,230', received: 'Apr 10', status: 'Awaiting review' },
    { id: 'q2', vendor: 'Haworth',   project: 'Lobby redesign',           amount: '$52,140', received: 'Apr 8',  status: 'Approved' },
    { id: 'q3', vendor: 'HON',       project: 'Staff chair replacement', amount: '$18,460', received: 'Apr 5',  status: 'Sent to finance' },
    { id: 'q4', vendor: 'Knoll',     project: 'Exam room desks',          amount: '$31,980', received: 'Apr 2',  status: 'Under review' },
]

interface ClientProposalDeliveryProps {
    proposalPrice: string
    clientName: string
    approvedBy: string
    approvedAt: number
    onRestart: () => void
    onSent?: () => void
}

interface TimelineStep {
    label: string
    date: string
}

const DELIVERY_TIMELINE: TimelineStep[] = [
    { label: 'Contract signed', date: 'Week 0 — today' },
    { label: 'Order placed with MillerKnoll', date: 'Week 1' },
    { label: 'On-site installation', date: 'Weeks 8-10' },
    { label: 'Final walk-through', date: 'Week 11' },
]

function formatElapsed(ts: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    return `${minutes}m ago`
}

function formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ClientProposalDelivery({
    proposalPrice,
    clientName,
    approvedBy,
    approvedAt,
    onRestart,
    onSent,
}: ClientProposalDeliveryProps) {
    const [phase, setPhase] = useState<DeliveryPhase>('rep-preview')
    const [sentAt, setSentAt] = useState<number | null>(null)

    // Rep cutaway state
    const [repNotifVisible, setRepNotifVisible] = useState(false)
    const [repPointerShown, setRepPointerShown] = useState(false)
    const [repNotifClicked, setRepNotifClicked] = useState(false)

    // Beat timeline · rep-preview cutaway → email-received (auto)
    useEffect(() => {
        if (phase !== 'rep-preview') return
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setRepNotifVisible(true), 900))
        timers.push(setTimeout(() => setRepPointerShown(true), 2000))
        timers.push(setTimeout(() => setRepNotifClicked(true), 2700))
        timers.push(setTimeout(() => setPhase('email-received'), 3600))
        return () => timers.forEach(clearTimeout)
    }, [phase])

    // Beat timeline · email-received → reviewing-pdf (auto)
    useEffect(() => {
        if (phase !== 'email-received') return
        const timer = setTimeout(() => setPhase('reviewing-pdf'), 1200)
        return () => clearTimeout(timer)
    }, [phase])

    // Beat timeline · sending → delivered (auto)
    useEffect(() => {
        if (phase !== 'sending') return
        const timer = setTimeout(() => {
            setSentAt(Date.now())
            setPhase('delivered')
            onSent?.()
        }, 1600)
        return () => clearTimeout(timer)
    }, [phase, onSent])

    const handleSendClick = () => {
        if (phase !== 'reviewing-pdf') return
        setPhase('sending')
    }

    // ─── Client representative cutaway (runs first, before Riley's flow) ───
    if (phase === 'rep-preview') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                {/* Role strip */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-950 text-white border border-border">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 text-[9px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        Client representative view
                    </span>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider hidden sm:block">
                        Switching to
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                        <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
                            alt="Lauren Kim"
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-primary"
                        />
                        <div>
                            <p className="text-xs font-bold text-white leading-tight">
                                Lauren Kim
                            </p>
                            <p className="text-[10px] text-zinc-400 leading-tight">
                                JPS Health Network · Procurement lead
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fake vendor-quotes app frame */}
                <div className="relative bg-card dark:bg-zinc-800 rounded-2xl border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-bold text-foreground">
                            My vendor quotes
                        </p>
                        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                            JPS procurement portal
                        </span>
                    </div>

                    {/* Notification toast (slides in from the right) */}
                    <div
                        className={clsx(
                            'absolute top-20 right-4 w-80 bg-card dark:bg-zinc-900 rounded-xl border border-primary/40 shadow-xl p-4 transition-all duration-500 z-10',
                            repNotifVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-6 pointer-events-none',
                            repNotifClicked &&
                                'ring-4 ring-primary/50 shadow-lg shadow-primary/40 scale-[0.98]'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                                <Bell className="w-4 h-4 text-foreground dark:text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    New vendor proposal
                                </p>
                                <p className="text-xs font-bold text-foreground leading-tight mt-1">
                                    WRG Texas · Health Center for Women
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                    ${proposalPrice} · just arrived · tap to review
                                </p>
                            </div>
                        </div>
                        {repPointerShown && (
                            <MousePointer2
                                className={clsx(
                                    'absolute -right-1 -bottom-2 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                    repNotifClicked
                                        ? 'translate-x-0 translate-y-0 scale-90'
                                        : 'translate-x-1 translate-y-1 animate-bounce'
                                )}
                                aria-hidden
                            />
                        )}
                    </div>

                    {/* Existing vendor quotes list */}
                    <ul className="divide-y divide-border">
                        {EXISTING_VENDOR_QUOTES.map((q) => (
                            <li
                                key={q.id}
                                className="flex items-center gap-3 px-6 py-3 hover:bg-muted/20"
                            >
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground leading-tight truncate">
                                        {q.vendor} · {q.project}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                        Received {q.received} · {q.status}
                                    </p>
                                </div>
                                <span className="shrink-0 text-xs font-bold text-foreground tabular-nums">
                                    {q.amount}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-[10px] text-muted-foreground italic p-4 text-center border-t border-border">
                        Strata notifies JPS's procurement lead the moment the
                        approved proposal leaves WRG Texas.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* ═══ EMAIL NOTIFICATION CARD ══════════════════════════════════════ */}
            <div
                className={clsx(
                    'rounded-2xl border overflow-hidden transition-all duration-500',
                    phase === 'email-received'
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 animate-in fade-in slide-in-from-top-2'
                        : 'bg-card dark:bg-zinc-800 border-border'
                )}
            >
                <div className="flex items-start gap-3 px-5 py-4">
                    <div
                        className={clsx(
                            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                            phase === 'email-received'
                                ? 'bg-indigo-500/15'
                                : 'bg-muted/60'
                        )}
                    >
                        <Mail
                            className={clsx(
                                'w-5 h-5',
                                phase === 'email-received'
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-muted-foreground'
                            )}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider leading-none text-indigo-600 dark:text-indigo-400">
                            CORE · New approved proposal
                        </p>
                        <p className="text-sm font-bold text-foreground leading-tight mt-1 truncate">
                            {clientName} — ${proposalPrice}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            From {approvedBy} · {formatElapsed(approvedAt)} ·{' '}
                            {formatTimestamp(approvedAt)}
                        </p>
                    </div>
                    <div className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Inbox
                    </div>
                </div>
                <div className="px-5 py-3 bg-muted/30 border-t border-border text-[11px] text-muted-foreground italic">
                    Hi Riley, the JPS Health Network proposal just cleared the
                    4-person approval chain. Full line-item breakdown is attached
                    as an internal audit trail PDF. Please prepare the package
                    for JPS's client representative and send when ready.
                </div>
            </div>

            {/* ═══ REPRESENTATIVE-FACING PDF PREVIEW ════════════════════════════ */}
            {(phase === 'reviewing-pdf' ||
                phase === 'sending' ||
                phase === 'delivered') && (
                <div
                    className={clsx(
                        'bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-500',
                        phase === 'reviewing-pdf'
                            ? 'animate-in fade-in slide-in-from-bottom-2'
                            : ''
                    )}
                >
                    {/* PDF header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-foreground dark:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Representative PDF · Preview
                            </p>
                            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                                JPS_Proposal_${proposalPrice}.pdf
                            </p>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                            <Sparkles className="w-3 h-3" />
                            Branded
                        </span>
                    </div>

                    {/* PDF body — 3-column mock (cover letter · summary · timeline) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
                        {/* Cover letter */}
                        <div className="rounded-xl bg-muted/20 border border-border px-4 py-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Cover letter
                            </p>
                            <p className="text-[11px] text-foreground leading-relaxed">
                                Dear JPS Health Network representative,
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                                Thank you for choosing WRG Texas as your
                                furniture partner for the Health Center for
                                Women project. This proposal covers the full
                                scope of 24 product lines — from the MillerKnoll
                                Canvas workstations in the nursing stations to
                                the custom OFS Serpentine lounge in the family
                                waiting area.
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                                Our team is ready to begin production and
                                installation as soon as you give us the green
                                light.
                            </p>
                            <p className="text-[11px] text-foreground leading-relaxed mt-3 font-semibold">
                                — Riley Morgan, WRG Texas
                            </p>
                        </div>

                        {/* Summary */}
                        <div className="rounded-xl bg-muted/20 border border-border px-4 py-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Investment summary
                            </p>
                            <ul className="space-y-2 text-[11px]">
                                <li className="flex items-baseline justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Furniture &amp; product
                                    </span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        $178,219
                                    </span>
                                </li>
                                <li className="flex items-baseline justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Delivery &amp; installation
                                    </span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        $17,685
                                    </span>
                                </li>
                                <li className="flex items-baseline justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Freight
                                    </span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        $6,234
                                    </span>
                                </li>
                                <li className="h-px bg-border my-2" aria-hidden />
                                <li className="flex items-baseline justify-between gap-2">
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                        Total investment
                                    </span>
                                    <span className="text-base font-black text-foreground tabular-nums">
                                        ${proposalPrice}
                                    </span>
                                </li>
                            </ul>
                            <p className="text-[10px] text-muted-foreground italic mt-3 leading-snug">
                                Pricing honours the JPS Master Services
                                Agreement and includes the 38 % contract
                                discount on product.
                            </p>
                        </div>

                        {/* Delivery schedule */}
                        <div className="rounded-xl bg-muted/20 border border-border px-4 py-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                Delivery schedule
                            </p>
                            <ol className="space-y-2.5">
                                {DELIVERY_TIMELINE.map((step, i) => (
                                    <li
                                        key={step.label}
                                        className="flex items-start gap-2 text-[11px]"
                                    >
                                        <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-foreground dark:text-primary text-[9px] font-bold flex items-center justify-center tabular-nums">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-foreground font-semibold leading-tight">
                                                {step.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground leading-tight">
                                                {step.date}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* PDF footer · action bar */}
                    {phase === 'reviewing-pdf' && (
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleSendClick}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Send to {clientName.split(' ')[0]} representative
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Sending state */}
                    {phase === 'sending' && (
                        <div className="flex items-center justify-center gap-3 px-6 py-5 border-t border-border bg-muted/20">
                            <span className="inline-flex w-5 h-5 items-center justify-center">
                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                                Sending proposal to {clientName.split(' ')[0]} representative…
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ DELIVERED STATE (centred success card) ═════════════════════ */}
            {phase === 'delivered' && (
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="px-6 py-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                            <Check
                                className="w-8 h-8 text-green-600 dark:text-green-400"
                                strokeWidth={3}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mt-4">
                            Handed off to representative
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            ${proposalPrice} quote sent to {clientName}'s representative
                        </p>
                        {sentAt && (
                            <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">
                                {formatTimestamp(sentAt)} · tracking #WRG-{sentAt
                                    .toString()
                                    .slice(-6)}
                            </p>
                        )}
                    </div>

                    {/* Delivery tracking bar */}
                    <div className="px-6 pb-5">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Sent', state: 'done' as const },
                                { label: 'Received', state: 'pending' as const },
                                { label: 'Opened', state: 'pending' as const },
                            ].map((step) => (
                                <div
                                    key={step.label}
                                    className="rounded-xl bg-muted/40 px-3 py-2.5 flex items-center gap-2"
                                >
                                    {step.state === 'done' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-foreground leading-tight mt-0.5 truncate">
                                            {step.state === 'done'
                                                ? 'Just now'
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Restart */}
                    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border bg-muted/20">
                        <button
                            type="button"
                            onClick={onRestart}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Start new quote
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
