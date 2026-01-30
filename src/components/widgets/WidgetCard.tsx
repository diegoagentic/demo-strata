
import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface WidgetCardProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export default function WidgetCard({ title, description, icon: Icon, action, children, className }: WidgetCardProps) {
    return (
        <div className={clsx("bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500", className)}>
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Consistent Drag Handle */}
                    <Bars3Icon className="w-5 h-5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing" />

                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            {Icon && <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />}
                            <h3 className="text-lg font-brand font-semibold text-foreground">{title}</h3>
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="flex-1 p-6 overflow-auto">
                {children}
            </div>
        </div>
    )
}
