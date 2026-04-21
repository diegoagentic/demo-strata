/**
 * COMPONENT: MBIPersonaBadge
 * PURPOSE: Tight identity chip for the protagonist of a flow/step. Renders
 *          circular initials + name + role, with an optional 'Phase 1 Pilot'
 *          marker for early-adopter champions (Kathy, Beth) so the MBI
 *          adoption sequencing is visible in-UI, not just in narration.
 *
 *          Two sizes: 'sm' (inline in step headers) · 'md' (hero placements).
 *
 * PROPS:
 *   - name: string                — 'Kathy Belleville'
 *   - role: string                — 'Controller · Accounting'
 *   - isPilot?: boolean           — renders Phase 1 Pilot badge
 *   - size?: 'sm' | 'md'          — visual weight
 *   - tone?: 'neutral' | 'success' | 'ai'  — accent for the avatar ring
 *
 * DS TOKENS: bg-primary/10 · text-zinc-900 dark:text-primary · success / ai accents
 *
 * USED BY: MBIWizardShell header, FlowHandoff time-skip block, step intros.
 */

import { Award } from 'lucide-react'

interface MBIPersonaBadgeProps {
    name: string
    role: string
    isPilot?: boolean
    size?: 'sm' | 'md'
    tone?: 'neutral' | 'success' | 'ai'
}

const TONE_MAP = {
    neutral: 'bg-primary/10 text-zinc-900 dark:text-primary ring-primary/20',
    success: 'bg-success/15 text-success ring-success/30',
    ai: 'bg-ai/15 text-ai ring-ai/30',
}

export default function MBIPersonaBadge({
    name,
    role,
    isPilot,
    size = 'sm',
    tone = 'neutral',
}: MBIPersonaBadgeProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const avatarSize = size === 'md' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-[11px]'
    const nameSize = size === 'md' ? 'text-sm' : 'text-xs'

    return (
        <div className="flex items-center gap-2 min-w-0">
            <div
                className={`
                    ${avatarSize} ${TONE_MAP[tone]} rounded-full ring-2 flex items-center justify-center font-bold shrink-0
                `}
            >
                {initials}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`${nameSize} font-bold text-foreground truncate`}>{name}</span>
                    {isPilot && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-ai/15 text-ai">
                            <Award className="h-2.5 w-2.5" />
                            Phase 1 Pilot
                        </span>
                    )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{role}</div>
            </div>
        </div>
    )
}
