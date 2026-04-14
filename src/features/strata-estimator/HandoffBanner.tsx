// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Handoff Banner
// Phase 4.7 of WRG Demo v6 implementation
//
// Temporary banner that appears at the top of the Estimator when a role
// hands off work to another role. Auto-dismisses after `duration` ms.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import type { ConnectedUser } from './StrataEstimatorNavbar'

interface HandoffBannerProps {
    fromUser: ConnectedUser
    message: string
    duration?: number
    onDismiss?: () => void
}

export default function HandoffBanner({
    fromUser,
    message,
    duration = 3000,
    onDismiss,
}: HandoffBannerProps) {
    const [visible, setVisible] = useState(true)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        const leaveTimer = setTimeout(() => setLeaving(true), duration - 300)
        const dismissTimer = setTimeout(() => {
            setVisible(false)
            onDismiss?.()
        }, duration)

        return () => {
            clearTimeout(leaveTimer)
            clearTimeout(dismissTimer)
        }
    }, [duration, onDismiss])

    if (!visible) return null

    return (
        <div
            className={clsx(
                'fixed top-24 left-0 right-0 z-40 flex justify-center px-4 transition-all duration-300',
                leaving ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0 animate-in slide-in-from-top-2 fade-in'
            )}
            role="status"
            aria-live="polite"
        >
            <div className="max-w-3xl w-full flex items-center gap-3 px-4 py-2 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-lg">
                <img
                    src={fromUser.photo}
                    alt={fromUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">
                        {fromUser.name}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground truncate">{message}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            </div>
        </div>
    )
}
