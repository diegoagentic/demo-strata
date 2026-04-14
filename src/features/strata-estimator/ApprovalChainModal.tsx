// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Approval Chain Modal
// v7 · David Park pre-approves inside his own Estimator view, so the modal
// opens with David already signed and auto-chains through Alex → Sara →
// Jordan. The "redirect to David's workspace" happens in the Shell, not here.
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Check, CheckCircle2, ShieldCheck, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ApprovalRole {
    name: string
    role: string
    photo: string
}

const CHAIN: ApprovalRole[] = [
    {
        name: 'David Park',
        role: 'Regional Sales Manager',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'Alex Rivera',
        role: 'Designer',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'Sara Chen',
        role: 'Account Manager',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
    {
        name: 'Jordan Park',
        role: 'VP Sales',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
]

const STEP_MS = 800

interface ApprovalChainModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
}

export default function ApprovalChainModal({
    isOpen,
    onClose,
    onComplete,
}: ApprovalChainModalProps) {
    const [approvedCount, setApprovedCount] = useState(0)

    // Reset + sequential auto-approval. David (index 0) is pre-approved on
    // open because the Shell already played his workspace cutaway before the
    // modal was allowed to mount.
    useEffect(() => {
        if (!isOpen) {
            setApprovedCount(0)
            return
        }

        const timers: ReturnType<typeof setTimeout>[] = []
        // David is already signed when we land here.
        timers.push(setTimeout(() => setApprovedCount(1), 350))
        // Alex / Sara / Jordan chain with the usual cadence.
        for (let i = 1; i < CHAIN.length; i++) {
            timers.push(
                setTimeout(
                    () => setApprovedCount(i + 1),
                    350 + i * STEP_MS
                )
            )
        }
        timers.push(
            setTimeout(onComplete, 350 + CHAIN.length * STEP_MS + 300)
        )
        return () => timers.forEach(clearTimeout)
    }, [isOpen, onComplete])

    const progressPct = (approvedCount / CHAIN.length) * 100
    const done = approvedCount >= CHAIN.length

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-[200]"
                onClose={done ? onClose : () => {}}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary/10 text-foreground dark:text-primary shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Approval Chain
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Four-person sign-off required for JPS Health Network
                                    </p>
                                </div>
                                {done && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Signatures
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                                        {approvedCount} / {CHAIN.length}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Chain rows */}
                            <div className="p-6 space-y-3">
                                {CHAIN.map((person, i) => {
                                    const approved = i < approvedCount
                                    const pending = i === approvedCount && !done
                                    return (
                                        <div
                                            key={person.name}
                                            className={clsx(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                                                approved && 'bg-green-500/5 dark:bg-green-500/10',
                                                !approved && 'bg-muted/40'
                                            )}
                                        >
                                            <img
                                                src={person.photo}
                                                alt={person.name}
                                                className={clsx(
                                                    'w-10 h-10 rounded-full object-cover shrink-0 transition-all',
                                                    approved && 'ring-2 ring-green-500',
                                                    pending && 'ring-2 ring-primary animate-pulse'
                                                )}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                                                    {person.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    {person.role}
                                                </p>
                                            </div>
                                            <div
                                                className={clsx(
                                                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                                                    approved
                                                        ? 'bg-green-500 text-white scale-100'
                                                        : 'bg-muted text-muted-foreground scale-95'
                                                )}
                                            >
                                                {approved ? (
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                ) : pending ? (
                                                    <span className="text-[10px] font-bold">...</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold">{i + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer status */}
                            <div className="px-6 py-4 border-t border-border bg-muted/20">
                                {done ? (
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="font-semibold">All signatures collected.</span>
                                        <span className="text-muted-foreground">
                                            Releasing proposal…
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Strata is routing the proposal through the approval chain.
                                        This normally takes a few seconds.
                                    </p>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
