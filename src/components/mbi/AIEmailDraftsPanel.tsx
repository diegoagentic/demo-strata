/**
 * COMPONENT: AIEmailDraftsPanel
 * PURPOSE: Shows LLM-drafted collection email previews for the top AR records.
 *          Kathy reviews + one-click sends. Replaces today's manual follow-up writing.
 *
 *          Mock: 2 drafts generated based on MBI_AR_RECORDS
 *          (1 escalation, 1 friendly first reminder).
 *
 * STATES per draft:
 *   - pending — preview with Approve/Edit/Send buttons
 *   - sent — collapsed success state
 *
 * DS TOKENS: bg-card · ai/5 bg · primary CTA
 *
 * USED BY: MBIAccountingPage (Phase 3.C)
 */

import { useState } from 'react'
import { Sparkles, Send, Pencil, CheckCircle2, AlertTriangle, Mail } from 'lucide-react'
import { StatusBadge, type StatusTone } from '../shared'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'

interface EmailDraft {
    id: string
    recordId: string
    tone: 'friendly' | 'firm' | 'escalation'
    subject: string
    body: string
    to: string
}

function buildDrafts(): EmailDraft[] {
    const escalated = MBI_AR_RECORDS.find(r => r.status === 'escalated')
    const noResponse = MBI_AR_RECORDS.find(r => r.status === 'no-response')
    const drafts: EmailDraft[] = []

    if (escalated) {
        drafts.push({
            id: 'DRAFT-001',
            recordId: escalated.id,
            tone: 'escalation',
            to: `${escalated.client} AP team + ${escalated.salesperson ?? 'Amanda Renshaw'}`,
            subject: `${escalated.poNumber} — ${escalated.daysPastDue} days past due · escalating to salesperson`,
            body: `Hello,\n\nPO ${escalated.poNumber} ($${escalated.amount.toLocaleString()}) is ${escalated.daysPastDue} days past due. We've escalated internally — ${escalated.salesperson ?? 'a sales representative'} will follow up within 72 hours.\n\nIf payment has already been sent, please reply with the reference number.\n\nBest,\nKathy Belleville · Controller · MBI`,
        })
    }
    if (noResponse) {
        drafts.push({
            id: 'DRAFT-002',
            recordId: noResponse.id,
            tone: 'firm',
            to: `${noResponse.client} AP team`,
            subject: `Second follow-up: ${noResponse.poNumber} · $${(noResponse.amount / 1000).toFixed(0)}K past due`,
            body: `Hi,\n\nWe haven't received a response to our first reminder on ${noResponse.poNumber} (sent ${noResponse.lastContact}). The balance of $${noResponse.amount.toLocaleString()} is now ${noResponse.daysPastDue} days past due.\n\nCan you confirm receipt of the invoice and expected payment date?\n\nThanks,\nKathy`,
        })
    }
    return drafts
}

const TONE_META = {
    friendly: { label: 'Friendly · 1st reminder', tone: 'info' as StatusTone, icon: <Mail className="h-3 w-3" /> },
    firm: { label: '2nd follow-up', tone: 'warning' as StatusTone, icon: <Mail className="h-3 w-3" /> },
    escalation: { label: 'Escalation', tone: 'danger' as StatusTone, icon: <AlertTriangle className="h-3 w-3" /> },
}

export default function AIEmailDraftsPanel() {
    const drafts = buildDrafts()
    const [sent, setSent] = useState<Record<string, boolean>>({})

    return (
        <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-foreground">AI-drafted collection emails</div>
                    <div className="text-[10px] text-muted-foreground">
                        LLM personalizes by account · Kathy reviews + one-click sends
                    </div>
                </div>
                <StatusBadge label={`${drafts.length} drafts ready`} tone="ai" size="sm" />
            </div>

            <div className="divide-y divide-border">
                {drafts.map(draft => {
                    const isSent = sent[draft.id]
                    const tone = TONE_META[draft.tone]
                    return (
                        <div key={draft.id} className="px-4 py-3">
                            {isSent ? (
                                <div className="flex items-center gap-2 text-xs">
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                    <span className="text-muted-foreground">
                                        Sent to <span className="font-semibold text-foreground">{draft.to}</span>
                                    </span>
                                    <button
                                        onClick={() => setSent(prev => ({ ...prev, [draft.id]: false }))}
                                        className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline"
                                    >
                                        Undo
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <StatusBadge label={tone.label} tone={tone.tone} size="xs" icon={tone.icon} />
                                        <span className="text-[10px] text-muted-foreground font-mono">→ {draft.to}</span>
                                    </div>

                                    <div className="text-sm font-bold text-foreground mb-1">{draft.subject}</div>

                                    <div className="bg-muted/30 rounded-lg p-2.5 text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed mb-2 max-h-32 overflow-y-auto">
                                        {draft.body}
                                    </div>

                                    <div className="flex items-center gap-2 justify-end">
                                        <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-foreground bg-background border border-border rounded hover:bg-muted transition-colors">
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setSent(prev => ({ ...prev, [draft.id]: true }))}
                                            className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-primary-foreground bg-primary rounded hover:opacity-90 transition-opacity"
                                        >
                                            <Send className="h-3 w-3" />
                                            Approve + send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
