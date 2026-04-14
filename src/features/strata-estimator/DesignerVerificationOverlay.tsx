import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface CheckboxModule {
    id: string
    title: string
    description: string
}

const MODULES: CheckboxModule[] = [
    { id: '1', title: 'Cost Summary', description: 'Review the base cost vs margin.' },
    { id: '2', title: 'Project Scope', description: 'Validate operational constraints.' },
    { id: '3', title: 'Escalated Item (OFS Serpentine)', description: 'Check custom dimensions and assembly time.' },
    { id: '4', title: 'Assembly Verification', description: 'Ensure no missing parts.' },
    { id: '5', title: 'Applied Rate ($798)', description: 'Validate final labor rate.' },
]

interface EscalationContext {
    fromName: string
    fromRole: string
    fromPhoto: string
    reason: string
    receivedAt: number
    itemRef?: string
}

interface DesignerVerificationOverlayProps {
    isOpen: boolean
    onSendBack: () => void
    onPreviewPdf: () => void
    /** Provenance block: who sent this verification and why */
    escalationContext?: EscalationContext
    /** Scroll the named row into view (default: li-19) */
    onScrollToItem?: (rowId: string) => void
}

function formatElapsed(ts: number): string {
    const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000))
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    return `${minutes}m ago`
}

export default function DesignerVerificationOverlay({
    isOpen,
    onSendBack,
    onPreviewPdf,
    escalationContext,
    onScrollToItem,
}: DesignerVerificationOverlayProps) {
    const [checkedModules, setCheckedModules] = useState<Record<string, boolean>>({})
    const [expandedModule, setExpandedModule] = useState<string | null>(null)
    const [comments, setComments] = useState<Record<string, string>>({})
    const [leaving, setLeaving] = useState(false)

    // Reset everything when the overlay opens fresh (new step entry)
    useEffect(() => {
        if (!isOpen) return
        setLeaving(false)
        setCheckedModules({})
        setExpandedModule(null)
        setComments({})
    }, [isOpen])

    const handleSendBackClick = () => {
        setLeaving(true)
        setTimeout(onSendBack, 400)
    }

    if (!isOpen) return null

    const handleToggleCheck = (id: string) => {
        setCheckedModules((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handleToggleExpand = (id: string) => {
        setExpandedModule((prev) => (prev === id ? null : id))
    }

    const handleCommentChange = (id: string, text: string) => {
        setComments((prev) => ({ ...prev, [id]: text }))
    }

    const allChecked = MODULES.every((m) => checkedModules[m.id])

    return (
        <div
            className={clsx(
                'fixed inset-y-0 right-0 w-96 bg-card dark:bg-zinc-900 border-l border-border shadow-2xl flex flex-col z-40 transition-all duration-300 ease-out',
                leaving
                    ? 'translate-x-full opacity-0'
                    : 'translate-x-0 opacity-100'
            )}
        >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/20">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 text-foreground dark:text-primary p-1.5 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Designer Verification
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                    Validate the 5 modules escalated by the Expert before returning the estimate.
                </p>

                {/* Provenance block — who sent this, when, and why */}
                {escalationContext && (
                    <div className="mt-4 p-3 rounded-xl bg-card dark:bg-zinc-800 border border-border">
                        <div className="flex items-center gap-2.5">
                            <img
                                src={escalationContext.fromPhoto}
                                alt={escalationContext.fromName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                    From
                                </p>
                                <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                    {escalationContext.fromName}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                    {escalationContext.fromRole}
                                </p>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                                {formatElapsed(escalationContext.receivedAt)}
                            </span>
                        </div>

                        <p className="text-[11px] text-foreground mt-3 leading-snug">
                            <span className="font-semibold">Reason:</span>{' '}
                            {escalationContext.reason}
                        </p>

                        {onScrollToItem && escalationContext.itemRef && (
                            <button
                                type="button"
                                onClick={() => onScrollToItem(escalationContext.itemRef!)}
                                className="mt-2 text-[10px] font-semibold text-foreground dark:text-primary hover:underline uppercase tracking-wider"
                            >
                                See row in the BoM →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {MODULES.map((module) => (
                    <div key={module.id} className="border border-border rounded-xl bg-background overflow-hidden transition-colors hover:border-border/80">
                        <div
                            className="p-4 flex items-start gap-3 cursor-pointer"
                            onClick={() => handleToggleExpand(module.id)}
                        >
                            <input
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={!!checkedModules[module.id]}
                                onChange={(e) => {
                                    e.stopPropagation()
                                    handleToggleCheck(module.id)
                                }}
                            />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium leading-none">{module.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                                    {module.description}
                                </p>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <svg
                                    className={`w-4 h-4 transform transition-transform ${expandedModule === module.id ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {expandedModule === module.id && (
                            <div className="p-4 pt-0 border-t border-border/50 bg-muted/10">
                                <label className="block text-xs font-medium text-muted-foreground mb-2">Designer Notes</label>
                                <textarea
                                    className="w-full text-sm p-3 bg-background border border-border rounded-lg focus:ring-1 focus:ring-brand-400 focus:border-brand-400 outline-none resize-none"
                                    rows={3}
                                    placeholder="Add any comments or changes..."
                                    value={comments[module.id] || ''}
                                    onChange={(e) => handleCommentChange(module.id, e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-background space-y-3">
                <button
                    onClick={onPreviewPdf}
                    className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Preview PDF
                </button>
                <button
                    onClick={handleSendBackClick}
                    disabled={!allChecked || leaving}
                    className={`w-full py-2.5 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity ${allChecked ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Send Back to Expert
                </button>
            </div>
        </div>
    )
}
