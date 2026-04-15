// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — File Import Modal
// v7 · w1.1 opening beat · simulates David uploading the CORE export files
// (spec PDFs + floor plan) before the dossier / BoM / calculations land.
//
// The modal is fully orchestrated by the Shell — it just renders whatever
// `phase` and `progress` it's given. Expected phase order:
//   'uploading' → 'parsing' → 'extracting' → 'done'
// When `phase === 'done'`, the Shell closes the modal and continues the
// existing w1.1 narrative.
// ═══════════════════════════════════════════════════════════════════════════════

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { CheckCircle2, FileText, Sparkles, UploadCloud } from 'lucide-react'
import { clsx } from 'clsx'

export type ImportPhase = 'uploading' | 'parsing' | 'extracting' | 'done'

interface FileImportModalProps {
    isOpen: boolean
    phase: ImportPhase
    progress: number
}

interface ImportFile {
    name: string
    size: string
}

const FILES: ImportFile[] = [
    { name: 'JPS_specs.pdf', size: '2.4 MB' },
    { name: 'JPS_floor_plan.pdf', size: '4.1 MB' },
    { name: 'JPS_contract.pdf', size: '680 KB' },
]

const PHASE_LABELS: Record<ImportPhase, string> = {
    uploading:  'Uploading project files to Strata…',
    parsing:    'Parsing PDFs · reading line items and rooms…',
    extracting: 'Extracting 24 products and labor categories…',
    done:       'Import complete · opening JPS dossier',
}

export default function FileImportModal({
    isOpen,
    phase,
    progress,
}: FileImportModalProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress))

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={() => {}}>
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
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-primary/10 text-foreground dark:text-primary shrink-0">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Import Project Files
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Drop the CORE export to kick off the estimation
                                    </p>
                                </div>
                                <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="w-3 h-3" />
                                    AI Agent
                                </span>
                            </div>

                            {/* File drop zone (simulated — already has files in it) */}
                            <div className="px-6 pt-5">
                                <div
                                    className={clsx(
                                        'rounded-xl border-2 border-dashed p-5 transition-colors duration-300',
                                        phase === 'uploading'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-muted/20'
                                    )}
                                >
                                    <div className="flex items-center justify-center mb-3">
                                        <UploadCloud
                                            className={clsx(
                                                'w-8 h-8 transition-colors duration-300',
                                                phase === 'uploading'
                                                    ? 'text-primary animate-bounce'
                                                    : 'text-muted-foreground'
                                            )}
                                        />
                                    </div>
                                    <ul className="space-y-1.5">
                                        {FILES.map((file) => (
                                            <li
                                                key={file.name}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card dark:bg-zinc-900 border border-border"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                <span className="flex-1 min-w-0 text-xs font-semibold text-foreground truncate">
                                                    {file.name}
                                                </span>
                                                <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                                                    {file.size}
                                                </span>
                                                {phase !== 'uploading' && (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pt-4 pb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Progress
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider tabular-nums">
                                        {Math.round(clampedProgress)}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${clampedProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Phase status */}
                            <div className="px-6 py-4 border-t border-border bg-muted/20">
                                <div className="flex items-center gap-2 text-xs text-foreground">
                                    {phase === 'done' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    ) : (
                                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                                            <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </span>
                                    )}
                                    <span className="font-semibold">
                                        {PHASE_LABELS[phase]}
                                    </span>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
