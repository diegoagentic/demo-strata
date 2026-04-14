// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Proposal Action Bar
// Refinement Phase 1 (w2.4 closure)
//
// Floating bottom pill that appears when the Shell is in 'proposal-review'
// state (w2.4 / Dealer role). Three CTAs: Request Clarification (secondary),
// Preview PDF (secondary), Approve & Release (primary). The parent Shell
// handles the modal opens.
// ═══════════════════════════════════════════════════════════════════════════════

import { CheckCircle2, FileText, MessageSquare } from 'lucide-react'

interface ProposalActionBarProps {
    salesPrice: string
    onRequestClarification: () => void
    onPreviewPdf: () => void
    onApproveRelease: () => void
}

export default function ProposalActionBar({
    salesPrice,
    onRequestClarification,
    onPreviewPdf,
    onApproveRelease,
}: ProposalActionBarProps) {
    return (
        <div
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
            role="toolbar"
            aria-label="Proposal review actions"
        >
            <div className="w-full max-w-4xl flex items-center gap-3 px-5 py-3 rounded-full bg-card/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-border shadow-lg">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                            Proposal
                        </span>
                        <span className="text-sm font-bold text-foreground leading-tight">
                            ${salesPrice}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onRequestClarification}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Request Clarification</span>
                </button>

                <button
                    onClick={onPreviewPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Preview PDF</span>
                </button>

                <button
                    onClick={onApproveRelease}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve &amp; Release
                </button>
            </div>
        </div>
    )
}
