/**
 * COMPONENT: DesignerCapacityBoard
 * PURPOSE: Visualizes designer workload from the data Lisa Garretson previously
 *          managed by intuition. Shows hours logged per designer + active project
 *          count, including the 3 designer-sales hybrids that are invisible to
 *          the Director of Design today.
 *
 * PROPS: none — uses MBI_STAKEHOLDERS + MBI_DESIGN_PROJECTS
 *
 * STATES: static
 *
 * DS TOKENS: bg-card · border-border · primary · amber (overload) · success (light)
 *
 * USED BY: MBIDesignPage (Phase 5.A)
 */

import { Users, Clock, Briefcase, AlertTriangle } from 'lucide-react'
import { MBI_STAKEHOLDERS, MBI_DESIGN_PROJECTS, getStakeholder } from '../../config/profiles/mbi-data'

const CAPACITY_HOURS = 40 // weekly capacity per designer

export default function DesignerCapacityBoard() {
    const designers = MBI_STAKEHOLDERS.filter(s => s.team === 'design')

    // Aggregate hours + project count by designer
    const data = designers.map(d => {
        const projects = MBI_DESIGN_PROJECTS.filter(p => p.designerId === d.id)
        const hoursLogged = projects.reduce((acc, p) => acc + p.hoursLogged, 0)
        const utilization = Math.min(100, Math.round((hoursLogged / CAPACITY_HOURS) * 100))
        return { designer: d, projects, hoursLogged, utilization }
    }).sort((a, b) => b.hoursLogged - a.hoursLogged)

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center">
                        <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Designer capacity dashboard</div>
                        <div className="text-[10px] text-muted-foreground">
                            Lisa assigns by data, not intuition · including {designers.filter(d => d.role.toLowerCase().includes('hybrid')).length || 1} designer-sales hybrid
                        </div>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border">
                {data.map(({ designer, projects, hoursLogged, utilization }) => {
                    const overload = utilization > 90
                    const isHybrid = designer.role.toLowerCase().includes('hybrid')
                    return (
                        <div key={designer.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-bold text-foreground truncate">{designer.name}</span>
                                    {isHybrid && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-info/10 text-info">
                                            Hybrid · was invisible
                                        </span>
                                    )}
                                    {designer.isEarlyAdopter && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                                            Early adopter
                                        </span>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span className="font-bold text-foreground tabular-nums">{hoursLogged}h</span> / {CAPACITY_HOURS}h
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            <span className="font-bold text-foreground tabular-nums">{projects.length}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Utilization bar */}
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${overload ? 'bg-amber-500' : utilization > 70 ? 'bg-primary' : 'bg-success'}`}
                                    style={{ width: `${utilization}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                                <div className="truncate">
                                    {projects.slice(0, 2).map(p => p.name).join(' · ') || 'No active projects'}
                                    {projects.length > 2 && ` · +${projects.length - 2} more`}
                                </div>
                                {overload && (
                                    <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold tabular-nums shrink-0">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        {utilization}%
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer note */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border text-[10px] text-muted-foreground italic">
                Backup mechanism formalized: queue doesn't stop when Lisa is out
            </div>
        </div>
    )
}

// Helper kept exported in case parent wants quick access
export { getStakeholder }
