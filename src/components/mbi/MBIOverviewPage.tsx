/**
 * COMPONENT: MBIOverviewPage
 * PURPOSE: Landing page for MBI demo — pipeline overview + impact stats.
 *          Phase 0.D stub — full implementation in Phase 1.
 *
 * STATUS: stub · Phase 0.D placeholder
 */

import { Network, Sparkles } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import { MBI_TENANT } from '../../config/profiles/mbi-data'

export default function MBIOverviewPage() {
    return (
        <MBIPageShell
            title="E2E Strata Flow"
            subtitle={`AI-accelerated pipeline for ${MBI_TENANT.name}`}
            icon={<Network className="h-5 w-5" />}
            activeApp="mbi-overview"
        >
            <div className="bg-card dark:bg-zinc-800/40 border border-border rounded-2xl p-12 text-center space-y-3">
                <Sparkles className="h-10 w-10 text-zinc-900 dark:text-primary mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Strata Pipeline</h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    Design → Budget → Quote → Order → Invoice — connected with AI checkpoints.
                </p>
                <p className="text-xs text-muted-foreground italic">
                    Phase 0.D placeholder · Full pipeline strip ships in Phase 1
                </p>
            </div>
        </MBIPageShell>
    )
}
