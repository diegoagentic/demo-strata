import { useState } from 'react'
import {
    BuildingOffice2Icon,
    UserIcon,
    TruckIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

interface OrderSimulationArtifactProps {
    onBack?: () => void;
    onGeneratePO?: () => void;
}

type Role = 'manufacturer' | 'dealer' | 'end_user';

export default function OrderSimulationArtifact({ onBack, onGeneratePO }: OrderSimulationArtifactProps) {
    const [activeRole, setActiveRole] = useState<Role>('dealer');
    const [isGenerated, setIsGenerated] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const orderData = {
        id: "ORD-7829",
        items: [
            { name: "Executive Ergonomic Chair", quantity: 15, unitCost: 450, unitPrice: 850 },
            { name: "Standing Desk Pro", quantity: 15, unitCost: 600, unitPrice: 1200 },
            { name: "Conference Table (Modular)", quantity: 2, unitCost: 1500, unitPrice: 3500 }
        ],
        shipping: 1250,
        taxRate: 0.08,
        manufacturerFee: 2500 // Platform fee for manufacturer view
    };

    const calculateTotals = (role: Role) => {
        const subtotal = orderData.items.reduce((acc, item) => {
            if (role === 'manufacturer') return acc + (item.unitCost * item.quantity);
            return acc + (item.unitPrice * item.quantity);
        }, 0);

        let total = subtotal;
        let margin = 0;

        if (role === 'end_user') {
            total += orderData.shipping + (subtotal * orderData.taxRate);
        } else if (role === 'dealer') {
            const cost = orderData.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
            margin = subtotal - cost;
            // Dealer sees revenue as total items price (simplified)
        } else if (role === 'manufacturer') {
            // Manufacturer sees cost + fee
            total += orderData.manufacturerFee;
        }

        return { subtotal, total, margin };
    };

    const totals = calculateTotals(activeRole);

    if (isCollapsed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 animate-in fade-in zoom-in duration-300 h-full">
                <div className="bg-white/90 dark:bg-zinc-900/90 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <ChartBarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Order Simulation</h4>
                            <p className="text-xs text-muted-foreground">Simulation view collapsed</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCollapsed(false)} className="text-sm font-medium text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                        Re-open
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack || (() => setIsCollapsed(true))}
                        className="p-2 -ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors group"
                        title={onBack ? "Go Back" : "Collapse Simulation"}
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                    <div>
                        <h3 className="text-xl font-brand font-bold text-foreground">Order Simulation</h3>
                        <p className="text-sm text-muted-foreground">Preview how this order appears to different stakeholders</p>
                    </div>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveRole('manufacturer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'manufacturer'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <BuildingOffice2Icon className="w-4 h-4" /> Manufacturer
                    </button>
                    <button
                        onClick={() => setActiveRole('dealer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'dealer'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <UserIcon className="w-4 h-4" /> Dealer
                    </button>
                    <button
                        onClick={() => setActiveRole('end_user')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeRole === 'end_user'
                            ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <UserIcon className="w-4 h-4" /> End User
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto scrollbar-micro">
                <div className={`max-w-4xl mx-auto rounded-xl border p-8 shadow-sm transition-colors duration-500 ${activeRole === 'manufacturer' ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800' :
                    activeRole === 'dealer' ? 'bg-white border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800' :
                        'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
                    }`}>
                    {/* Role Specific Badge */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${activeRole === 'manufacturer' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                activeRole === 'dealer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {activeRole === 'manufacturer' ? 'Production View' : activeRole === 'dealer' ? 'Margin Analysis' : 'Customer Invoice'}
                            </span>
                            <h2 className="text-3xl font-bold mt-4 text-foreground">Order #{orderData.id}</h2>
                            <p className="text-muted-foreground">Placed on Feb 20, 2026</p>
                        </div>
                        <div className="text-right">
                            {activeRole === 'dealer' && (
                                <div className="bg-green-100 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-900/30">
                                    <p className="text-xs text-green-700 dark:text-green-400 font-bold uppercase">Estimated Margin</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                        ${totals.margin.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase pb-2 border-b border-border">
                            <div className="col-span-6">Item</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">{activeRole === 'manufacturer' ? 'Cost' : 'Price'}</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        {orderData.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 text-sm py-3 border-b border-border/50 items-center">
                                <div className="col-span-6 font-medium text-foreground">{item.name}</div>
                                <div className="col-span-2 text-center text-muted-foreground">{item.quantity}</div>
                                <div className="col-span-2 text-right text-muted-foreground">
                                    ${(activeRole === 'manufacturer' ? item.unitCost : item.unitPrice).toLocaleString()}
                                </div>
                                <div className="col-span-2 text-right font-medium text-foreground">
                                    ${((activeRole === 'manufacturer' ? item.unitCost : item.unitPrice) * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${totals.subtotal.toLocaleString()}</span>
                            </div>

                            {activeRole === 'end_user' && (
                                <>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>${orderData.shipping.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Tax (8%)</span>
                                        <span>${(totals.subtotal * orderData.taxRate).toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            {activeRole === 'manufacturer' && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Platform Fee</span>
                                    <span>${orderData.manufacturerFee.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-border flex justify-between items-baseline">
                                <span className="font-bold text-foreground">Total</span>
                                <span className="text-2xl font-bold text-foreground">${totals.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Area */}
            {onGeneratePO && !isGenerated && (
                <div className="p-4 border-t border-border flex justify-end bg-zinc-50 dark:bg-zinc-800/50">
                    <button
                        onClick={() => {
                            setIsGenerated(true)
                            onGeneratePO()
                        }}
                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        Generate Purchase Order
                    </button>
                </div>
            )}
            {onGeneratePO && isGenerated && (
                <div className="p-4 border-t border-border flex justify-end bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="px-6 py-2.5 bg-green-100 dark:bg-green-900/10 text-green-700 dark:text-green-400 font-bold rounded-xl flex items-center gap-2 border border-green-200 dark:border-green-800/50">
                        <CheckCircleIcon className="w-5 h-5" />
                        PO Generation Started
                    </div>
                </div>
            )}
        </div>
    )
}
