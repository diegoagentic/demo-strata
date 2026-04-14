// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Bill of Materials Table
// Phase 6 of WRG Demo v6 implementation
//
// Editable table of LineItems. Inline selects for category / subcategory,
// textarea for description, number for qty. AI Import + AI Refine buttons
// in the header trigger the Vision Engine modal (Phase 8).
// ═══════════════════════════════════════════════════════════════════════════════

import { FileText, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react'
import type { ConfigState, LineItem } from './types'

interface BillOfMaterialsTableProps {
    lineItems: LineItem[]
    config: ConfigState
    onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void
    onAddItem: () => void
    onRemoveItem: (id: string) => void
    onAiImport: () => void
    onAiRefine: () => void
    hasLastFile: boolean
}

export default function BillOfMaterialsTable({
    lineItems,
    config,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
    onAiImport,
    onAiRefine,
    hasLastFile,
}: BillOfMaterialsTableProps) {
    const categories = Object.values(config.categories)

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Bill of Materials
                    </h3>
                    <span className="text-xs text-muted-foreground">
                        · {lineItems.length} items
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onAiImport}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Import
                    </button>

                    {hasLastFile && (
                        <button
                            onClick={onAiRefine}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            AI Refine
                        </button>
                    )}

                    <button
                        onClick={onAddItem}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Line
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40">
                            <th className="text-left px-6 py-3 w-[18%]">Group</th>
                            <th className="text-left px-4 py-3 w-[22%]">Product Line</th>
                            <th className="text-left px-4 py-3">Description</th>
                            <th className="text-right px-4 py-3 w-[80px]">QTY</th>
                            <th className="text-right px-6 py-3 w-[48px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {lineItems.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-xs text-muted-foreground">
                                    No line items yet. Use AI Import or Add Line to get started.
                                </td>
                            </tr>
                        )}
                        {lineItems.map((item) => {
                            const category = config.categories[item.categoryId]
                            const subcategories = category
                                ? Object.values(category.subcategories ?? {})
                                : []

                            return (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    {/* Group (category) */}
                                    <td className="px-6 py-3">
                                        <select
                                            value={item.categoryId}
                                            onChange={(e) =>
                                                onUpdateItem(item.id, 'categoryId', e.target.value)
                                            }
                                            className="w-full bg-transparent text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Product Line (subcategory) */}
                                    <td className="px-4 py-3">
                                        <select
                                            value={item.subCategoryId}
                                            onChange={(e) =>
                                                onUpdateItem(item.id, 'subCategoryId', e.target.value)
                                            }
                                            className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                        >
                                            <option value="">— default rate —</option>
                                            {subcategories.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Description */}
                                    <td className="px-4 py-3">
                                        <textarea
                                            value={item.description}
                                            onChange={(e) =>
                                                onUpdateItem(item.id, 'description', e.target.value)
                                            }
                                            rows={1}
                                            className="w-full bg-transparent text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                        />
                                    </td>

                                    {/* QTY */}
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                onUpdateItem(
                                                    item.id,
                                                    'quantity',
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="w-16 bg-transparent text-xs text-foreground font-semibold text-right focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                            title="Remove line"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
