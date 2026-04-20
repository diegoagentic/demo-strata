/**
 * COMPONENT: MBITopBar
 * PURPOSE: Secondary navigation bar matching MBI_Strata_Prototype_Flow.html reference.
 *          Shows 5 tabs (E2E Flow · Budget Builder · Accounting AI · Quotes AI · Design AI)
 *          and highlights the active tab based on currentStep.app.
 *          Clicks navigate between MBI modules.
 *
 * PROPS:
 *   - activeApp: SimulationApp               — current step app (mbi-* value)
 *   - onNavigate: (app: string) => void      — navigate to another MBI app
 *
 * STATES:
 *   - default — all tabs neutral, active one highlighted
 *   - hover   — tab label changes color
 *
 * DS TOKENS:
 *   - bg-background / bg-card · border-border · text-foreground / text-muted-foreground
 *   - Active: text-primary · border-primary
 *
 * USED IN: MBIPageShell (appears once per MBI page)
 */

import { Network, Calculator, Receipt, FileSearch, Palette } from 'lucide-react'
import type { SimulationApp } from '../../config/demoProfiles'

interface MBITopBarProps {
    activeApp: SimulationApp | string
    onNavigate: (app: string) => void
}

interface TabSpec {
    app: string
    label: string
    icon: React.ReactNode
}

const MBI_TABS: TabSpec[] = [
    { app: 'mbi-overview', label: 'E2E Strata Flow', icon: <Network className="h-3.5 w-3.5" /> },
    { app: 'mbi-budget', label: 'Budget Builder', icon: <Calculator className="h-3.5 w-3.5" /> },
    { app: 'mbi-accounting', label: 'Accounting AI', icon: <Receipt className="h-3.5 w-3.5" /> },
    { app: 'mbi-quotes', label: 'Quotes AI', icon: <FileSearch className="h-3.5 w-3.5" /> },
    { app: 'mbi-design', label: 'Design AI', icon: <Palette className="h-3.5 w-3.5" /> },
]

export default function MBITopBar({ activeApp, onNavigate }: MBITopBarProps) {
    return (
        <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {MBI_TABS.map(tab => {
                        const active = tab.app === activeApp
                        return (
                            <button
                                key={tab.app}
                                onClick={() => onNavigate(tab.app)}
                                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                                    border-b-2 transition-colors
                                    ${active
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }
                                `}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}

export { MBI_TABS }
