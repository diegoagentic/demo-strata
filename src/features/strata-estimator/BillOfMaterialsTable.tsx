// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Bill of Materials Table
// Phase 6 of WRG Demo v6 implementation
//
// Editable table of LineItems. Inline selects for category / subcategory,
// textarea for description, number for qty. AI Import + AI Refine buttons
// in the header trigger the Vision Engine modal (Phase 8).
// ═══════════════════════════════════════════════════════════════════════════════

import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import { Check, ChevronDown, FileText, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { ConfigState, LineItem } from './types'

// ── Inline listbox: accessible select that lives inside a table cell ─────────

interface InlineOption {
    id: string
    label: string
}

interface InlineListboxProps {
    value: string
    onChange: (value: string) => void
    options: InlineOption[]
    placeholder?: string
    valueClassName?: string
}

function InlineListbox({
    value,
    onChange,
    options,
    placeholder = '—',
    valueClassName = 'text-foreground font-medium',
}: InlineListboxProps) {
    const selected = options.find((o) => o.id === value)
    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative">
                <ListboxButton
                    className={clsx(
                        'group w-full flex items-center justify-between gap-1 px-1.5 py-1 rounded text-xs cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary',
                        valueClassName
                    )}
                >
                    <span className="block truncate text-left">
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown
                        className="w-3 h-3 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                    />
                </ListboxButton>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-max min-w-full overflow-auto rounded-xl bg-card dark:bg-zinc-800 border border-border shadow-xl py-1 text-xs focus:outline-none">
                        {options.map((option) => (
                            <ListboxOption
                                key={option.id}
                                value={option.id}
                                className={({ focus, selected }) =>
                                    clsx(
                                        'relative cursor-pointer select-none py-1.5 pl-8 pr-3 transition-colors',
                                        focus && 'bg-zinc-100 dark:bg-zinc-900',
                                        selected
                                            ? 'text-foreground font-semibold'
                                            : 'text-muted-foreground'
                                    )
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className="block truncate">{option.label}</span>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-foreground dark:text-primary">
                                                <Check className="h-3.5 w-3.5" aria-hidden />
                                            </span>
                                        )}
                                    </>
                                )}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Transition>
            </div>
        </Listbox>
    )
}

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
                                        <InlineListbox
                                            value={item.categoryId}
                                            onChange={(v) =>
                                                onUpdateItem(item.id, 'categoryId', v)
                                            }
                                            options={categories.map((c) => ({
                                                id: c.id,
                                                label: c.label,
                                            }))}
                                        />
                                    </td>

                                    {/* Product Line (subcategory) */}
                                    <td className="px-4 py-3">
                                        <InlineListbox
                                            value={item.subCategoryId}
                                            onChange={(v) =>
                                                onUpdateItem(item.id, 'subCategoryId', v)
                                            }
                                            placeholder="— default rate —"
                                            valueClassName="text-muted-foreground"
                                            options={[
                                                { id: '', label: '— default rate —' },
                                                ...subcategories.map((s) => ({
                                                    id: s.id,
                                                    label: s.label,
                                                })),
                                            ]}
                                        />
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
