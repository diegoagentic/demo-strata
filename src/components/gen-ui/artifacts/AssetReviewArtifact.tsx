import { useState } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    FunnelIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    TrashIcon,
    BoltIcon,
    SparklesIcon,
    ArrowLongRightIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';
import EditAssetModal from './AssetReview/EditAssetModal';
import AISuggestionPanel from './AssetReview/AISuggestionPanel';
import DiscountStructureWidget from './AssetReview/DiscountStructureWidget';
import SuccessModal from './AssetReview/SuccessModal';

import MappingField from './AssetReview/MappingField';
import SuggestionModal from './AssetReview/SuggestionModal';

// Types
export interface AssetType {
    id: string;
    description: string;
    sku: string;
    qty: number;
    unitPrice: number;
    basePrice: number;
    totalPrice: number;
    status: 'validated' | 'review' | 'suggestion';
    issues?: string[];
    warranty?: string; // New field
    suggestion?: {
        sku: string;
        price: number;
        reason: string;
    };
}

export default function AssetReviewArtifact({ data, source = 'upload' }: { data: any, source?: 'upload' | 'erp' }) {
    const { sendMessage } = useGenUI();
    const [filter, setFilter] = useState<'all' | 'attention' | 'validated'>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetType | null>(null);
    // Initialize step based on source: ERP data is pre-mapped, so skip to review
    const [currentStep, setCurrentStep] = useState<'map' | 'review' | 'discount' | 'finalize'>(source === 'erp' ? 'review' : 'map');
    const [finalType, setFinalType] = useState<'quote' | 'po'>('po');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMappingExpanded, setIsMappingExpanded] = useState(true);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [selectedSuggestionAsset, setSelectedSuggestionAsset] = useState<AssetType | null>(null);

    // Mock Mapping Data
    const [mappingFields, setMappingFields] = useState<{
        label: string;
        originalField: string;
        description: string;
        status: 'review' | 'matched';
        confidence: number;
        value: string;
        suggestions: { value: string; confidence: number; description: string; }[];
    }[]>([
        {
            label: "Delivery Date",
            originalField: "date_req",
            description: "2024-03-15",
            status: "review",
            confidence: 75,
            value: "Requested Delivery Date",
            suggestions: [
                { value: "Requested Delivery Date", confidence: 75, description: "Matches date format and 'req' suffix context." },
                { value: "Ship By Date", confidence: 60, description: "Alternative date field found in header." },
                { value: "Project Start Date", confidence: 45, description: "Less likely based on context." }
            ]
        },
        {
            label: "Finish / Color",
            originalField: "item_finish_code",
            description: "WAL-001 (Walnut)",
            status: "review",
            confidence: 70,
            value: "Material Finish",
            suggestions: [
                { value: "Material Finish", confidence: 70, description: "Detected 'finish' keyword and material code pattern." },
                { value: "Color Option", confidence: 65, description: "Could map to generic color field." }
            ]
        },
        {
            label: "Delivery Address",
            originalField: "ship_addr_l1",
            description: "10948 WILLOW COURT, #200, San Diego CA...",
            status: "review",
            confidence: 65,
            value: "Ship To Address",
            suggestions: [
                { value: "Ship To Address", confidence: 65, description: "Address format detected." },
                { value: "Bill To Address", confidence: 40, description: "Address format, but 'ship' prefix suggests otherwise." }
            ]
        },
        {
            label: "Quantity",
            originalField: "qty_ordered",
            description: "45",
            status: "review",
            confidence: 60,
            value: "Item Quantity",
            suggestions: [
                { value: "Item Quantity", confidence: 85, description: "Numeric field with 'qty' label." },
                { value: "Pack Size", confidence: 30, description: "Unlikely for main order line." }
            ]
        }
    ]);

    const handleApplyMapping = (label: string, newValue: string) => {
        setMappingFields(prev => prev.map(f =>
            f.label === label
                ? { ...f, value: newValue, status: 'matched', confidence: 100 }
                : f
        ));
    };

    // Derived State
    const unmappedFields = mappingFields.filter(f => f.status !== 'matched');
    const matchedFields = mappingFields.filter(f => f.status === 'matched');

    // Mock Data (will come from `data` prop later)
    const [assets, setAssets] = useState<AssetType[]>(data?.assets?.map((a: any) => ({ ...a, warranty: 'Standard Warranty' })) || [
        {
            id: '1',
            description: 'Executive Task Chair',
            sku: 'CHAIR-EXEC-2024',
            qty: 150,
            unitPrice: 895.00,
            totalPrice: 134250.00,
            status: 'validated',
            warranty: 'Standard Warranty'
        },
        {
            id: '2',
            description: 'Conf Chair (Leather)',
            sku: 'CHR-CONF-LTH',
            qty: 8,
            unitPrice: 850.00,
            totalPrice: 6800.00,
            status: 'review',
            issues: ['Needs review'],
            warranty: 'Standard Warranty'
        },
        {
            id: '3',
            description: 'Height Adjustable Workstation',
            sku: 'DESK-ELECTRIC-7230',
            qty: 95,
            unitPrice: 1250.00,
            totalPrice: 118750.00,
            status: 'suggestion',
            suggestion: {
                sku: 'DESK-ELECTRIC-7230-BUDGET',
                price: 1100.00,
                reason: 'Budget alternative available (Save $150/unit)'
            },
            warranty: 'Standard Warranty'
        },
        {
            id: '4',
            description: 'Ergonomic Office Chair',
            sku: 'CHAIR-ERG-001',
            qty: 85,
            unitPrice: 425.00,
            totalPrice: 36125.00,
            status: 'validated',
            warranty: 'Standard Warranty'
        }
    ]);

    const [isWarrantyMenuOpen, setIsWarrantyMenuOpen] = useState(false);
    const [pricingStep, setPricingStep] = useState<'warranties' | 'discounts'>('warranties');

    const handleApplyWarranty = (warrantyName: string, scope: 'all' | 'single' = 'single', assetId?: string) => {
        const getPriceIncrease = (w: string) => {
            if (w.includes('Extended')) return 50;
            if (w.includes('Premium')) return 120;
            return 0;
        };

        setAssets(prev => prev.map(a => {
            const base = a.basePrice !== undefined ? a.basePrice : a.unitPrice;
            const shouldUpdate = scope === 'all' || (scope === 'single' && a.id === assetId);

            if (shouldUpdate) {
                const increase = getPriceIncrease(warrantyName);
                const newUnitPrice = base + increase;
                return {
                    ...a,
                    basePrice: base,
                    warranty: warrantyName,
                    unitPrice: newUnitPrice,
                    totalPrice: newUnitPrice * a.qty
                };
            }
            // Ensure basePrice is preserved/set
            return { ...a, basePrice: base };
        }));
        setIsWarrantyMenuOpen(false);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleEdit = (asset: AssetType) => {
        setEditingAsset(asset);
        setIsEditModalOpen(true);
    };

    const handleViewSuggestion = (asset: AssetType) => {
        setSelectedSuggestionAsset(asset);
        setIsSuggestionModalOpen(true);
    };

    const handleSaveAsset = (updatedAsset: AssetType) => {
        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? { ...updatedAsset, status: 'validated', issues: [] } : a));
    };

    const handleAcceptSuggestion = (assetId: string) => {
        setAssets(prev => prev.map(a => {
            if (a.id === assetId && a.suggestion) {
                return {
                    ...a,
                    sku: a.suggestion.sku,
                    unitPrice: a.suggestion.price,
                    totalPrice: a.qty * a.suggestion.price,
                    status: 'validated',
                    suggestion: undefined
                };
            }
            return a;
        }));
        setIsSuggestionModalOpen(false); // Close modal on accept
    };

    const handleRejectSuggestion = (assetId: string) => {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'validated', suggestion: undefined } : a));
        setIsSuggestionModalOpen(false); // Close modal on reject
    };

    const filteredAssets = assets.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'attention') return a.status === 'review' || a.status === 'suggestion';
        if (filter === 'validated') return a.status === 'validated';
        return true;
    });

    const stats = {
        total: assets.length,
        attention: assets.filter(a => a.status === 'review' || a.status === 'suggestion').length,
        validated: assets.filter(a => a.status === 'validated').length,
        totalValue: assets.reduce((acc, curr) => acc + curr.totalPrice, 0)
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            {/* Header / Toolbar - Stratified */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold font-brand text-foreground tracking-tight">Asset Processing</h2>
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Beta</span>
                    </div>
                    <p className="text-muted-foreground text-xs">Review and validate assets from {source === 'erp' ? 'ERP Integration' : 'Document Extraction'}</p>
                </div>

                {/* Stepper (Strata Minimalist) */}
                <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                    {source !== 'erp' && (
                        <>
                            <button
                                onClick={() => setCurrentStep('map')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'map' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'map' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>1</span>
                                Intelligence
                            </button>

                            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                        </>
                    )}

                    <button
                        onClick={() => setCurrentStep('review')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'review' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'review' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>{source === 'erp' ? '1' : '2'}</span>
                        Review
                    </button>

                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

                    <button
                        onClick={() => setCurrentStep('discount')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'discount' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'discount' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>{source === 'erp' ? '2' : '3'}</span>
                        Discounts
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors text-foreground">
                        <DocumentTextIcon className="w-4 h-4" />
                        Save Draft
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Asset List */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">

                    {/* Controls */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Filter by Status:</span>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filter === 'all' ? 'bg-white dark:bg-zinc-700 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    All ({stats.total})
                                </button>
                                <button
                                    onClick={() => setFilter('attention')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'attention' ? 'bg-white dark:bg-zinc-700 shadow-sm text-amber-600 dark:text-amber-500' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                    Needs Attention ({stats.attention})
                                </button>
                                <button
                                    onClick={() => setFilter('validated')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'validated' ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600 dark:text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    Validated ({stats.validated})
                                </button>
                            </div>
                        </div>
                        <span className="text-muted-foreground text-xs">Showing {filteredAssets.length} of {stats.total} items</span>
                        <span className="text-muted-foreground text-xs">Showing {filteredAssets.length} of {stats.total} items</span>
                    </div>

                    {/* Scrollable List with Integrated Mapping Section */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-micro bg-zinc-50/50 dark:bg-zinc-900/50">

                        {/* Step 1: Integrated Field Mapping Section */}
                        {currentStep === 'map' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                            <SparklesIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-foreground">Order Intelligence & Mapping</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Review and confirm AI-detected field mappings.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                                    {unmappedFields.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {unmappedFields.map((field) => (
                                                <MappingField
                                                    key={field.label}
                                                    field={{
                                                        ...field,
                                                        onApply: (val) => handleApplyMapping(field.label, val)
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground">All Fields Mapped</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Order intelligence is complete.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Matched Fields Summary (Optional) */}
                                {matchedFields.length > 0 && (
                                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mapped Fields ({matchedFields.length})</h4>
                                        <div className="space-y-2 opacity-70">
                                            {matchedFields.map(field => (
                                                <div key={`summary-${field.label}`} className="flex justify-between text-xs">
                                                    <span className="text-foreground font-medium">{field.label}</span>
                                                    <span className="text-muted-foreground">{field.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                            </div>
                        )}

                        {/* Divider */}
                        {currentStep === 'review' && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 pt-2">
                                    <span>Asset List ({filteredAssets.length})</span>
                                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                                </div>

                                {/* Assets List */}
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {filteredAssets.map(asset => (
                                        <div key={asset.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex gap-4 items-start">
                                                {/* Status Icon */}
                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${asset.status === 'review' ? 'bg-amber-100 text-amber-600' :
                                                    asset.status === 'suggestion' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                    {asset.status === 'review' && <ExclamationTriangleIcon className="w-5 h-5" />}
                                                    {asset.status === 'suggestion' && <BoltIcon className="w-5 h-5" />}
                                                    {asset.status === 'validated' && <CheckCircleIcon className="w-5 h-5" />}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-foreground text-sm truncate">{asset.description}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-muted-foreground">SKU: {asset.sku} • Qty: {asset.qty}</span>

                                                                {/* Interactive Pills */}
                                                                {asset.status === 'review' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleEdit(asset); }}
                                                                        className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide hover:bg-amber-200 transition-colors"
                                                                    >
                                                                        Needs Review
                                                                    </button>
                                                                )}
                                                                {asset.status === 'suggestion' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleViewSuggestion(asset); }}
                                                                        className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide hover:bg-blue-200 transition-colors"
                                                                    >
                                                                        AI Suggestion
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-foreground text-sm">{formatCurrency(asset.totalPrice)}</div>
                                                            <div className="text-xs text-muted-foreground">{formatCurrency(asset.unitPrice)} each</div>
                                                        </div>
                                                    </div>

                                                    {/* Issues / Suggestions */}
                                                    {asset.status === 'review' && asset.issues && (
                                                        <div className="mt-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            <span>{asset.issues.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleEdit(asset)}
                                                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                                                    >
                                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Stats similar to screenshot */}
                    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center text-xs">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                <CheckCircleIcon className="w-4 h-4" /> {stats.validated} Validated
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                                <ExclamationTriangleIcon className="w-4 h-4" /> {stats.attention} Need Review
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-muted-foreground">Total Value:</span>
                                <span className="ml-2 font-bold text-foreground text-sm">{formatCurrency(stats.totalValue)}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (currentStep === 'map') setCurrentStep('review');
                                    else if (currentStep === 'review') setCurrentStep('discount');
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm"
                            >
                                {currentStep === 'map' ? 'Review Assets' : 'Pricing & Discounts'} <ChevronDownIcon className="w-3 h-3 -rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Document Preview / PO */}
                <div className="w-1/3 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 hidden lg:flex flex-col">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4" />
                            Purchase Order Preview
                        </span>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-zinc-100 rounded"><ArrowPathIcon className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Mock PDF Viewer */}
                    <div className="flex-1 p-8 overflow-y-auto flex justify-center scrollbar-micro">
                        <div className="bg-white w-full max-w-[300px] min-h-[500px] h-fit shadow-lg rounded-sm border border-zinc-200 p-8 text-[10px] leading-relaxed relative text-zinc-900 flex flex-col">
                            <div className="font-bold text-lg mb-4 text-center text-zinc-900">PURCHASE ORDER</div>
                            <div className="flex justify-between mb-6">
                                <div>
                                    <div className="font-bold">BILL TO:</div>
                                    <div>ENTERPRISE CORP</div>
                                    <div>1234 BUSINESS WAY</div>
                                    <div>Atlanta, GA 30318</div>
                                </div>
                                <div>
                                    <div className="font-bold">VENDOR:</div>
                                    <div>Office Furniture Co.</div>
                                    <div>5678 SUPPLIER ST</div>
                                    <div>Atlanta, GA 30309</div>
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="flex justify-between border-b border-zinc-100 pb-1">
                                        <div className="w-8">#{i}024</div>
                                        <div className="flex-1 ml-2">Office Chair ergonomic black mesh...</div>
                                        <div className="w-12 text-right">$450.00</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-8 pt-4 border-t border-zinc-200 font-bold text-sm">
                                TOTAL: $511,575.00
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {/* Overlays */}
            {/* Overlays */}

            {
                currentStep === 'discount' && (
                    <div className="absolute inset-0 z-20 bg-white dark:bg-zinc-900 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Top Header */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 z-10">
                            <button onClick={() => setCurrentStep('review')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <ChevronDownIcon className="w-4 h-4 rotate-90" /> Back to Review
                            </button>

                            {/* Pricing Stepper */}
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <div className={`flex items-center gap-2 ${pricingStep === 'warranties' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${pricingStep === 'warranties' ? 'bg-primary/10 border-primary text-primary' : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'}`}>1</div>
                                    <span>Warranties</span>
                                </div>
                                <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                                <div className={`flex items-center gap-2 ${pricingStep === 'discounts' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${pricingStep === 'discounts' ? 'bg-primary/10 border-primary text-primary' : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'}`}>2</div>
                                    <span>Discounts</span>
                                </div>
                            </div>

                            <div className="w-20"></div> {/* Spacer for balance */}
                        </div>
                        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black/50 p-8 scrollbar-micro">
                            <div className="max-w-4xl mx-auto space-y-6">

                                {pricingStep === 'warranties' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                                <ShieldCheckIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">Asset Protection Plans</h3>
                                                <p className="text-sm text-muted-foreground">Select warranty coverage before applying final discounts.</p>
                                            </div>
                                        </div>

                                        {/* Warranty Toolbar */}
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleApplyWarranty('Extended Warranty (3 Years)', 'all')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-colors hover:shadow-sm"
                                                >
                                                    <ShieldCheckIcon className="w-4 h-4" />
                                                    Extended Warranty
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsWarrantyMenuOpen(!isWarrantyMenuOpen)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-colors hover:shadow-sm"
                                                    >
                                                        <SparklesIcon className="w-4 h-4" />
                                                        Premium Protection
                                                    </button>

                                                    {isWarrantyMenuOpen && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setIsWarrantyMenuOpen(false)}></div>
                                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => handleApplyWarranty('Premium Protection (5 Years)', 'all')}
                                                                        className="w-full text-left px-4 py-2 text-xs font-medium text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800"
                                                                    >
                                                                        Apply Premium (5 Years)
                                                                    </button>
                                                                    <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                        By Category
                                                                    </div>
                                                                    {['Seating', 'Desks', 'Tables', 'Storage'].map(cat => (
                                                                        <button
                                                                            key={cat}
                                                                            onClick={() => handleApplyWarranty('Premium Protection (5 Years)', 'all')}
                                                                            className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                                        >
                                                                            Apply to All {cat}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleApplyWarranty('Standard Warranty', 'all')}
                                                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground text-xs transition-colors ml-auto"
                                                >
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                    Reset All
                                                </button>
                                            </div>
                                        </div>

                                        {/* Asset List for Warranty */}
                                        <div className="space-y-3">
                                            {filteredAssets.map(asset => (
                                                <div key={asset.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex gap-4 items-center group hover:border-primary/30 transition-colors">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-semibold text-foreground text-sm truncate">{asset.description}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-muted-foreground">SKU: {asset.sku} • Qty: {asset.qty}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-semibold text-foreground text-sm">{formatCurrency(asset.totalPrice)}</div>
                                                                <div className="text-xs text-muted-foreground">{(asset.basePrice !== undefined && asset.unitPrice !== asset.basePrice) && <span className="text-amber-600 mr-1">Modified</span>}{formatCurrency(asset.unitPrice)} each</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-[200px] shrink-0">
                                                        <div className="relative">
                                                            <ShieldCheckIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                                            <select
                                                                value={asset.warranty || 'Standard Warranty'}
                                                                onChange={(e) => handleApplyWarranty(e.target.value, 'single', asset.id)}
                                                                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <option value="Standard Warranty">Standard @ {formatCurrency(asset.basePrice || asset.unitPrice)}</option>
                                                                <option value="Extended Warranty (3 Years)">Extended +$50</option>
                                                                <option value="Premium Protection (5 Years)">Premium +$120</option>
                                                            </select>
                                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                            <button
                                                onClick={() => setPricingStep('discounts')}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02]"
                                            >
                                                Next: Apply Discounts <ArrowLongRightIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                                <ChartBarIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">Discounts & Adjustments</h3>
                                                <p className="text-sm text-muted-foreground">Review total value and apply applicable discounts.</p>
                                            </div>
                                        </div>

                                        <DiscountStructureWidget
                                            subtotal={stats.totalValue}
                                            onApply={(finalTotal) => setCurrentStep('finalize')}
                                        />

                                        <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                            <button
                                                onClick={() => setPricingStep('warranties')}
                                                className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <ArrowLongRightIcon className="w-4 h-4 rotate-180" /> Back to Warranties
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                currentStep === 'finalize' && (
                    <div className="absolute inset-0 z-20 bg-white dark:bg-zinc-900 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                            <button onClick={() => setCurrentStep('discount')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <ChevronDownIcon className="w-4 h-4 rotate-90" /> Back to Pricing
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black/50 scrollbar-micro">
                            <div className="min-h-full flex items-center justify-center p-8">
                                <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${stats.total === stats.validated ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                                        {stats.total === stats.validated ? (
                                            <CheckCircleIcon className="w-8 h-8" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-8 h-8" />
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-center mb-2">
                                        {stats.total === stats.validated ? 'Ready to Submit Order' : 'Review Incomplete'}
                                    </h3>
                                    <p className="text-center text-muted-foreground mb-8 text-sm">
                                        {stats.total === stats.validated
                                            ? 'All assets have been validated. This will create a Purchase Order.'
                                            : 'Some items still need review. You can proceed by creating a Quote instead.'}
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                            <span className="text-muted-foreground">Ordering Assets</span>
                                            <span className="font-semibold">{stats.total} Items</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                            <span className="text-muted-foreground">Validation Status</span>
                                            {stats.total === stats.validated ? (
                                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                                    <CheckCircleIcon className="w-4 h-4" /> All Validated
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-semibold flex items-center gap-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4" /> {stats.total - stats.validated} Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                            <span className="text-primary font-medium">Total Value</span>
                                            <span className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue)}</span>
                                        </div>
                                    </div>

                                    {stats.total === stats.validated ? (
                                        <button
                                            onClick={() => {
                                                setFinalType('po');
                                                setShowSuccess(true);
                                            }}
                                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            <DocumentTextIcon className="w-5 h-5" />
                                            Submit Purchase Order
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    setFinalType('quote');
                                                    setShowSuccess(true);
                                                }}
                                                className="w-full py-3 bg-white dark:bg-zinc-800 border-2 border-primary text-primary rounded-xl font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <DocumentTextIcon className="w-5 h-5" />
                                                Create Quote Only
                                            </button>
                                            <p className="text-xs text-center text-muted-foreground px-4">
                                                Creating a quote allows you to save progress and finish validation later.
                                            </p>

                                            <button
                                                onClick={() => {
                                                    setFilter('attention');
                                                    setCurrentStep('review');
                                                }}
                                                className="w-full py-3 mt-3 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                                            >
                                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                                Review Pending Items
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <EditAssetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                asset={editingAsset}
                onSave={handleSaveAsset}
            />

            <SuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                asset={selectedSuggestionAsset}
                onAccept={() => selectedSuggestionAsset && handleAcceptSuggestion(selectedSuggestionAsset.id)}
                onReject={() => selectedSuggestionAsset && handleRejectSuggestion(selectedSuggestionAsset.id)}
            />

            <SuccessModal
                isOpen={showSuccess}
                type={finalType}
                poNumber={finalType === 'po' ? "PO-2026-001" : "QT-2026-892"}
                onClose={() => {
                    setShowSuccess(false);
                    setCurrentStep('review');
                    const id = finalType === 'po' ? 'PO-2026-001' : 'QT-2026-892';
                    const msg = finalType === 'po'
                        ? `Purchase Order **${id}** has been submitted. [View in Transactions](/transactions?tab=orders&id=${id})`
                        : `Quote **${id}** has been created. [View in Transactions](/transactions?tab=quotes&id=${id})`;
                    sendMessage(msg, 'system');
                }}
                onCreateNew={() => {
                    setShowSuccess(false);
                    sendMessage('Start New Quote', 'user');
                }}
            />
        </div >
    );
}
