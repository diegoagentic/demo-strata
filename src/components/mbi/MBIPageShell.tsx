/**
 * COMPONENT: MBIPageShell
 * PURPOSE: Shared shell for the 5 MBI demo pages — provides consistent layout,
 *          header, breadcrumbs and tenant context. All MBI pages compose this.
 *
 * PROPS:
 *   - title: string                 — page title (e.g. "Budget Builder")
 *   - subtitle?: string             — optional 1-line description
 *   - icon?: ReactNode              — optional Lucide icon for the title
 *   - actions?: ReactNode           — optional right-aligned actions (CTAs)
 *   - children: ReactNode           — page body
 *
 * STATES:
 *   - default — shell renders with header + body
 *
 * DS TOKENS USED:
 *   - bg-background · text-foreground · text-muted-foreground
 *   - border-border · max-w-7xl · pt-24 px-4
 *
 * USED BY: MBIOverviewPage, MBIBudgetPage, MBIAccountingPage,
 *          MBIQuotesPage, MBIDesignPage
 */

import type { ReactNode } from 'react'
import { MBI_TENANT } from '../../config/profiles/mbi-data'

interface MBIPageShellProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    actions?: ReactNode
    /** activeApp kept for backwards compatibility — now unused (primary nav lives in Navbar) */
    activeApp?: string
    children: ReactNode
}

export default function MBIPageShell({ title, subtitle, icon, actions, children }: MBIPageShellProps) {
    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page title row */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-zinc-900 dark:text-primary">
                                {icon}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium uppercase tracking-wider">{MBI_TENANT.short}</span>
                                <span>·</span>
                                <span>Strata for MBI</span>
                            </div>
                            <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
                            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>

                {/* Page body */}
                {children}
            </div>
        </div>
    )
}
