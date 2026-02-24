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
    ArrowLeftIcon,
    TagIcon,
    BuildingOfficeIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';
import EditAssetModal from './AssetReview/EditAssetModal';
import AISuggestionPanel from './AssetReview/AISuggestionPanel';
import DiscountStructureWidget from './AssetReview/DiscountStructureWidget';
import SuccessModal from './AssetReview/SuccessModal';

import MappingField from './AssetReview/MappingField';
import SuggestionModal from './AssetReview/SuggestionModal';
import DiscrepancyResolverArtifact, { type DiscrepancyItem } from './DiscrepancyResolverArtifact';

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
    costCenter?: string; // New field
    options?: { sku: string; name: string; price: number; subText: string; }[]; // New field for manual selection
    suggestion?: {
        sku: string;
        price: number;
        reason: string;
        confidence?: number;
    };
}

export default function AssetReviewArtifact({ data, source = 'upload', onApprove }: { data: any, source?: 'upload' | 'erp', onApprove?: () => void }) {
    const { sendMessage } = useGenUI();
    const [filter, setFilter] = useState<'all' | 'attention' | 'validated'>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetType | null>(null);

    // Initialize step based on source: ERP data is pre-mapped, so skip to review
    // Modified: Autonomous flow now starts at 'report' instead of 'map'
    const [currentStep, setCurrentStep] = useState<'map' | 'report' | 'review' | 'discount' | 'finalize'>('review');
    const [finalType, setFinalType] = useState<'quote' | 'po'>('po');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMappingExpanded, setIsMappingExpanded] = useState(false);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [selectedSuggestionAsset, setSelectedSuggestionAsset] = useState<AssetType | null>(null);
    const [isResolverOpen, setIsResolverOpen] = useState(!!data?.openResolver);
    const [isSubstitutionsOpen, setIsSubstitutionsOpen] = useState(false);
    const [isApproved, setIsApproved] = useState(false); // Tracks if this artifact has been finalized

    // Mock Header & Rule Issues (New for Unified Resolution)
    const [headerIssues, setHeaderIssues] = useState<DiscrepancyItem[]>([
        {
            id: 'h-1',
            type: 'header',
            title: 'Reference Number Mismatch',
            description: 'PO #12345 vs Extracted "PO-12345-RevA"',
            severity: 'medium',
            original: { label: 'Input PO', value: '12345' },
            suggestion: {
                label: 'Extracted PO',
                value: 'PO-12345-RevA',
                reason: 'Document header contains Revision suffix.',
                confidence: 92
            }
        }
    ]);

    const [ruleIssues, setRuleIssues] = useState<DiscrepancyItem[]>([
        {
            id: 'r-1',
            type: 'rule',
            title: 'Margin Threshold Alert',
            description: 'Project margin below 25% target',
            severity: 'high',
            original: { label: 'Current Margin', value: '22%' },
            suggestion: {
                label: 'Target Margin',
                value: '25%',
                reason: 'Standard dealer policy requires 25% min margin.',
                confidence: 100
            }
        }
    ]);

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
    const [assets, setAssets] = useState<AssetType[]>(data?.assets?.map((a: any) => ({ ...a, warranty: 'Standard Warranty', costCenter: '' })) || [
        {
            id: '1',
            description: 'Executive Task Chair',
            sku: 'CHAIR-EXEC-2024',
            qty: 150,
            unitPrice: 895.00,
            totalPrice: 134250.00,
            status: 'validated',
            warranty: 'Standard Warranty',
            costCenter: 'CC-101'
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
            warranty: 'Standard Warranty',
            costCenter: 'CC-GEN'
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
            warranty: 'Standard Warranty',
            costCenter: 'CC-ENG'
        },
        // MOCK DATA FOR FLOW 1: Discontinued Item 1 (AI Suggested)
        {
            id: '4',
            description: 'Legacy Side Table (Discontinued)',
            sku: 'TBL-SIDE-LEGACY-09',
            qty: 12,
            unitPrice: 320.00,
            totalPrice: 3840.00,
            status: 'review',
            issues: ['Discontinued: End of Life'],
            costCenter: 'CC-LOBBY',
            warranty: 'Standard Warranty',
            suggestion: {
                sku: 'TBL-SIDE-MODERN-24',
                price: 345.00,
                reason: 'Direct replacement for legacy series. 98% match on dimensions.',
                confidence: 95
            }
        },
        // MOCK DATA FOR FLOW 1: Discontinued Item 2 (AI Suggested)
        {
            id: '6',
            description: 'Vintage Filing Cabinet (Discontinued)',
            sku: 'CAB-FILE-VINT-2',
            qty: 5,
            unitPrice: 180.00,
            totalPrice: 900.00,
            status: 'review',
            issues: ['Discontinued: Manufacturer recalled'],
            costCenter: 'CC-ADMIN',
            warranty: 'Standard Warranty',
            suggestion: {
                sku: 'CAB-FILE-STEEL-X',
                price: 195.00,
                reason: 'Steelcase alternative selected per client substitution rules.',
                confidence: 92
            }
        },
        // MOCK DATA FOR FLOW 1: Discontinued Item 3 (Manual Selection Required)
        {
            id: '7',
            description: 'Acoustic Panel System (Discontinued)',
            sku: 'PNL-AC-SYS-OLD',
            qty: 24,
            unitPrice: 150.00,
            totalPrice: 3600.00,
            status: 'review',
            issues: ['Discontinued: Out of Stock Indefinitely'],
            costCenter: 'CC-OPEN',
            warranty: 'Standard Warranty',
            options: [
                { sku: 'PNL-AC-SYS-NEW-A', name: 'Acoustic Panel Pro', price: 165.00, subText: 'Premium soundproofing' },
                { sku: 'PNL-AC-SYS-NEW-B', name: 'Acoustic Panel Lite', price: 140.00, subText: 'Budget friendly' },
                { sku: 'PNL-AC-SYS-COLOR', name: 'Acoustic Panel Vibrant', price: 170.00, subText: 'Custom color finish' }
            ]
        },
        {
            id: '5',
            description: 'Ergonomic Office Chair',
            sku: 'CHAIR-ERG-001',
            qty: 85,
            unitPrice: 425.00,
            totalPrice: 36125.00,
            status: 'validated',
            warranty: 'Standard Warranty',
            costCenter: 'CC-HR'
        },
        {
            id: '8',
            description: 'Steel Mobile Pedestal',
            sku: 'PED-MOB-STL-01',
            qty: 120,
            unitPrice: 225.00,
            totalPrice: 27000.00,
            status: 'validated',
            warranty: 'Standard Warranty',
            costCenter: 'CC-101'
        },
        {
            id: '9',
            description: 'Dual Monitor Arm',
            sku: 'ACC-MON-DUAL',
            qty: 150,
            unitPrice: 145.00,
            totalPrice: 21750.00,
            status: 'validated',
            warranty: 'Standard Warranty',
            costCenter: 'CC-101'
        },
        {
            id: '10',
            description: 'Lounge Seating Sofa',
            sku: 'SOFA-LNG-3STR',
            qty: 4,
            unitPrice: 1200.00,
            totalPrice: 4800.00,
            status: 'validated',
            warranty: '12-Year Standard',
            costCenter: 'CC-LOBBY'
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
                    suggestion: undefined,
                    issues: []
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

    // Update Cost Center
    const handleCostCenterChange = (assetId: string, value: string) => {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, costCenter: value } : a));
    };

    const [activeAccordion, setActiveAccordion] = useState<string | null>('assets');

    const handleResolveDiscrepancy = (id: string, action: 'accept' | 'keep' | 'manual', data?: any) => {
        // Handle Header/Rule issues
        if (id.startsWith('h-')) {
            setHeaderIssues(prev => prev.filter(i => i.id !== id));
            return;
        }
        if (id.startsWith('r-')) {
            setRuleIssues(prev => prev.filter(i => i.id !== id));
            return;
        }

        // Handle Asset issues
        setAssets(prev => prev.map(a => {
            if (a.id !== id) return a;

            if (action === 'accept') {
                if (a.suggestion) {
                    return {
                        ...a,
                        sku: a.suggestion.sku,
                        unitPrice: a.suggestion.price,
                        totalPrice: a.qty * a.suggestion.price,
                        status: 'validated',
                        suggestion: undefined,
                        issues: []
                    };
                } else if (a.options) {
                    const selectedOpt = data ? a.options.find(opt => opt.sku === data) : a.options[0];
                    if (selectedOpt) {
                        return {
                            ...a,
                            description: selectedOpt.name,
                            sku: selectedOpt.sku,
                            unitPrice: selectedOpt.price,
                            totalPrice: a.qty * selectedOpt.price,
                            status: 'validated',
                            options: undefined,
                            issues: []
                        };
                    }
                }

                // Fallback: Accept without suggestion (resolve warning)
                return {
                    ...a,
                    status: 'validated',
                    suggestion: undefined,
                    issues: []
                };
            }
            if (action === 'keep') {
                return {
                    ...a,
                    status: 'validated',
                    suggestion: undefined,
                    issues: []
                };
            }
            return a;
        }));
    };

    const filteredAssets = assets.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'attention') return a.status === 'review' || a.status === 'suggestion';
        if (filter === 'validated') return a.status === 'validated';
        return true;
    });

    // Simulating 40 total items without rendering all 40 list items to keep DOM light
    const simulatedExtraItems = 33;
    const simulatedExtraValue = simulatedExtraItems * 450; // Approximating $450 per simulated item

    const stats = {
        total: (data?.stats?.total || ((data?.stats?.validated || 0) + (data?.stats?.attention || 0)) || assets.length) + simulatedExtraItems,
        attention: data?.stats?.attention !== undefined ? data?.stats?.attention : assets.filter(a => a.status === 'review' || a.status === 'suggestion').length,
        validated: (data?.stats?.validated !== undefined ? data?.stats?.validated : assets.filter(a => a.status === 'validated').length) + simulatedExtraItems,
        totalValue: (data?.stats?.totalValue !== undefined ? data?.stats?.totalValue : assets.reduce((acc, curr) => acc + curr.totalPrice, 0)) + simulatedExtraValue
    };

    const totalIssues = headerIssues.length + ruleIssues.length + stats.attention;

    // Generate Discrepancy Items for Resolver
    // Maps asset issues (like discontinued) to the discrepancy format
    const generalDiscrepancies: DiscrepancyItem[] = [
        ...headerIssues,
        ...ruleIssues
    ];

    const substitutionItems: DiscrepancyItem[] = assets
        .filter(a => a.status === 'review' || a.status === 'suggestion')
        .map(a => {
            let mockSuggestion = a.suggestion;

            // If the item needs review but has no AI suggestion attached yet, we simulate one based on realistic business rules.
            if (!mockSuggestion && a.status === 'review') {
                const reasons = [
                    { reason: 'Similar characteristics to original request, complying with preferred vendor policy.', sku: `${a.sku}-ALT-1`, price: a.unitPrice * 0.95 },
                    { reason: 'Better pricing available for identical specifications to improve project margin.', sku: `${a.sku}-VALUE`, price: a.unitPrice * 0.85 },
                    { reason: 'More luxurious option selected based on executive office tier rules.', sku: `${a.sku}-PREM`, price: a.unitPrice * 1.5 },
                    { reason: 'Eco-friendly alternative with lower carbon footprint, matching sustainability goals.', sku: `${a.sku}-ECO`, price: a.unitPrice * 1.1 },
                    { reason: 'Sourced from a closer fulfillment center to ensure on-time delivery.', sku: `${a.sku}-LOCAL`, price: a.unitPrice * 1.05 }
                ];

                // Create a robust deterministic hash from the ID to vary reasons
                const safeIdStr = String(a.id || '');
                const hashNum = safeIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;

                const simulatedReason = reasons[hashNum % reasons.length];

                mockSuggestion = {
                    sku: simulatedReason.sku,
                    price: simulatedReason.price,
                    reason: simulatedReason.reason,
                    confidence: 85 + (hashNum % 10)
                };
            }

            return {
                id: a.id,
                type: 'line_item' as const,
                title: a.issues?.length ? a.issues[0] : 'Optimization Opportunity',
                description: a.description,
                severity: 'medium' as const,
                original: {
                    label: 'Extracted SKU',
                    value: a.sku,
                    subText: `Unit Price: ${formatCurrency(a.unitPrice)}`
                },
                suggestion: mockSuggestion ? {
                    label: 'Recommended Replacement',
                    value: mockSuggestion.sku,
                    subText: `Unit Price: ${formatCurrency(mockSuggestion.price)}`,
                    reason: mockSuggestion.reason,
                    confidence: mockSuggestion.confidence || 95
                } : {
                    label: 'No Suggestion',
                    value: 'N/A',
                    reason: 'Please review manually.',
                    confidence: 0
                },
                metadata: a.options ? { options: a.options } : undefined
            };
        });

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
            {/* Header / Status Bar */}
            <div className="shrink-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 dark:bg-primary/10 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-zinc-900 dark:text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold font-brand text-foreground flex items-center gap-2">
                            A.I. Asset Processing
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Beta</span>
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {totalIssues > 0
                                ? `${totalIssues} items require human review`
                                : "All assets validated. Ready for submission."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">


                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors text-foreground">
                        <DocumentTextIcon className="w-4 h-4" />
                        Save Draft
                    </button>

                    <button
                        onClick={() => {
                            if (totalIssues === 0) setCurrentStep('discount');
                        }}
                        disabled={totalIssues > 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${totalIssues > 0
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                            }`}
                    >
                        {totalIssues > 0 ? (
                            <>
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                Resolve Issues
                            </>
                        ) : (
                            <>
                                <TagIcon className="w-4 h-4" />
                                Apply Discounts & Warranties
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Unified Dashboard */}
                <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-800/50">

                    {/* Status Summary & Exceptions */}
                    <div className="p-6 pb-2">
                        <div className="flex flex-wrap gap-4 mb-6">
                            {/* Validated Stats */}
                            <div className="flex-1 min-w-[200px] bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Validated Assets</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{stats.validated}</p>
                                </div>
                                <div className="p-2 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-lg">
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Total Value */}
                            <div className="flex-1 min-w-[200px] bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Value</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.totalValue)}</p>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-lg">
                                    <ChartBarIcon className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Action Card */}
                            <div className={`flex-[1.5] min-w-[300px] p-4 rounded-xl border shadow-sm flex items-center justify-between transition-colors ${totalIssues > 0
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800'
                                }`}>
                                <div>
                                    <p className={`text-xs font-medium uppercase tracking-wider ${totalIssues > 0 ? 'text-amber-700 dark:text-amber-500' : 'text-muted-foreground'}`}>
                                        {totalIssues > 0 ? 'Action Required' : 'Status'}
                                    </p>
                                    <p className={`text-lg font-bold mt-1 ${totalIssues > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-foreground'}`}>
                                        {totalIssues > 0 ? `${totalIssues} Issues Found` : 'Ready to Process'}
                                    </p>
                                </div>
                                {totalIssues > 0 && (
                                    <button
                                        onClick={() => setIsResolverOpen(true)}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm shadow-md transition-transform active:scale-95 shrink-0"
                                    >
                                        Resolve Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Mappings / Context (Collapsible) */}
                        <div className="mb-4">
                            <button
                                onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
                            >
                                <ChevronDownIcon className={`w-3 h-3 transition-transform ${isMappingExpanded ? '' : '-rotate-90'}`} />
                                Detected Context & Mappings
                            </button>

                            {isMappingExpanded && (
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {mappingFields.slice(0, 4).map(field => (
                                            <div key={field.label} className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">{field.value}</span>
                                                <span className="text-sm font-medium text-foreground truncate" title={field.description}>{field.description}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${field.confidence > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {field.confidence}% Confidence
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'all'
                                    ? 'border-zinc-900 text-zinc-900 dark:border-primary dark:text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                All Assets ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('attention')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${filter === 'attention'
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Needs Attention
                                {stats.attention > 0 && (
                                    <span className="bg-amber-100 text-amber-700 px-1.5 rounded-full text-xs">{stats.attention}</span>
                                )}
                            </button>
                            <button
                                onClick={() => setFilter('validated')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'validated'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Validated
                            </button>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 scrollbar-micro">
                        {filteredAssets.map(asset => (
                            <div key={asset.id} className={`group bg-white dark:bg-zinc-800 rounded-xl border p-4 shadow-sm transition-all ${asset.status === 'review' || asset.status === 'suggestion'
                                ? 'border-amber-200 dark:border-amber-800/30'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}>
                                <div className="flex gap-4 items-start">
                                    {/* Status Icon */}
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${asset.status === 'review' ? 'bg-amber-100 text-amber-600' :
                                        asset.status === 'suggestion' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        {asset.status === 'review' && <ExclamationTriangleIcon className="w-5 h-5" />}
                                        {asset.status === 'suggestion' && <SparklesIcon className="w-5 h-5" />}
                                        {asset.status === 'validated' && <CheckCircleIcon className="w-5 h-5" />}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-foreground text-sm truncate">{asset.description}</h4>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-xs text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{asset.sku}</span>
                                                    <span className="text-xs text-muted-foreground">Qty: {asset.qty}</span>

                                                    {/* Cost Center input */}
                                                    <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
                                                        <BuildingOfficeIcon className="w-3 h-3 text-zinc-400" />
                                                        <input
                                                            type="text"
                                                            value={asset.costCenter || ''}
                                                            onChange={(e) => handleCostCenterChange(asset.id, e.target.value)}
                                                            placeholder="Cost Center"
                                                            className="text-xs bg-transparent border-none outline-none w-20 text-foreground placeholder:text-muted-foreground/50 focus:w-24 transition-all"
                                                        />
                                                    </div>

                                                    {asset.warranty && asset.warranty !== 'Standard Warranty' && (
                                                        <span className="text-[10px] flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/30">
                                                            <ShieldCheckIcon className="w-3 h-3" />
                                                            {asset.warranty}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-foreground text-sm">{formatCurrency(asset.totalPrice)}</div>
                                                <div className="text-xs text-muted-foreground">{formatCurrency(asset.unitPrice)} ea</div>
                                            </div>
                                        </div>

                                        {/* Issues / Suggestions Bar */}
                                        {(asset.status === 'review' || asset.status === 'suggestion') && (
                                            <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {asset.status === 'review' ? (
                                                        <>
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                                                            <span className="text-amber-700 dark:text-amber-500 font-medium">Issue Detected:</span>
                                                            <span className="text-zinc-600 dark:text-zinc-400">{asset.issues?.join(', ')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SparklesIcon className="w-4 h-4 text-blue-600" />
                                                            <span className="text-blue-700 dark:text-blue-500 font-medium">AI Suggestion:</span>
                                                            <span className="text-zinc-600 dark:text-zinc-400">{asset.suggestion?.reason}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setIsResolverOpen(true)} // Open unified resolver mainly
                                                    className="text-xs font-bold text-primary hover:underline"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions (Hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                        <button
                                            onClick={() => handleEdit(asset)}
                                            className="p-1.5 text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                                            title="Edit Asset"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                            title="Remove Asset"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination / Loading Mock */}
                        {stats.total > assets.length && (
                            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Showing {assets.length} of {stats.total} items
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1">Scroll to load more</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Preview / Context */}
                <div className="w-[380px] border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 hidden xl:flex flex-col">
                    {pricingStep === 'discounts' ? (
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <TagIcon className="w-5 h-5" />
                                    Discounts & Pricing
                                </h3>
                                <button onClick={() => setPricingStep('warranties')} className="text-xs text-primary hover:underline">Close</button>
                            </div>
                            <div className="flex-1 overflow-hidden p-4">
                                <DiscountStructureWidget
                                    subtotal={stats.totalValue}
                                    onApply={(total) => {
                                        // Handle apply logic
                                        setPricingStep('warranties'); // Close/Reset
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        // Default PDF Preview (Simplified)
                        <div className="h-full flex flex-col">
                            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex justify-between items-center text-sm font-medium">
                                <span className="flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Source Document
                                </span>
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-zinc-100 rounded"><ArrowPathIcon className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Mock PDF Viewer */}
                            <div className="flex-1 p-8 overflow-y-auto flex justify-center scrollbar-micro bg-zinc-100/50 dark:bg-zinc-950">
                                <div className="bg-white w-full shadow-lg rounded-sm border border-zinc-200 p-8 text-[10px] leading-relaxed relative text-zinc-900 h-fit min-h-[600px]">
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
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div key={i} className="flex justify-between border-b border-zinc-100 pb-1">
                                                <div className="w-8">#{i}024</div>
                                                <div className="flex-1 ml-2">Office Chair ergonomic black mesh...</div>
                                                <div className="w-16 text-right">$450.00</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-8 right-8 text-right">
                                        <div className="font-bold text-lg">TOTAL: $68,650.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render 'Report' Step Overlay */}
            {currentStep === 'report' && (
                <div className="absolute inset-0 z-20 bg-zinc-50 dark:bg-zinc-800 flex flex-col p-8 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-3xl w-full">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold font-brand text-foreground mb-2">Analysis Complete</h2>
                            <p className="text-muted-foreground">The AI has analyzed your document and found the following items requiring attention.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* Context & Rules Card */}
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    Context & Rules
                                </h3>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <span className="text-sm font-medium">Header Discrepancies</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${headerIssues.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {headerIssues.length} Issues
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <span className="text-sm font-medium">Business Rule Alerts</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ruleIssues.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                            {ruleIssues.length} Alerts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Card */}
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <BoltIcon className="w-5 h-5" />
                                    </div>
                                    Line Items
                                </h3>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <span className="text-sm font-medium">Confident Matches</span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                            {stats.validated} Items
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <span className="text-sm font-medium">Needs Verification</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stats.attention > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                            {stats.attention} Items
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            {totalIssues > 0 ? (
                                <button
                                    onClick={() => setIsResolverOpen(true)}
                                    className="px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform animate-pulse"
                                >
                                    Resolve {totalIssues} Issues to Proceed
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentStep('discount')}
                                    className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                    Proceed to Pricing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Render 'Discount & Warranty' Step Overlay (Unified Pricing Step) */}
            {
                currentStep === 'discount' && (
                    <div className="absolute inset-0 z-20 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-full h-full max-w-5xl bg-white dark:bg-zinc-800 md:my-6 md:rounded-2xl border-0 md:border border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden flex flex-col relative">
                            {/* Sticky Header */}
                            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 z-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setCurrentStep('review')}
                                        className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-foreground shrink-0"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-bold font-brand text-foreground mb-1">Pricing & Configuration</h2>
                                        <p className="text-muted-foreground text-sm">Review warranties and apply any special discounts before generating the PO.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep('review')}
                                        className="px-5 py-2.5 text-zinc-500 hover:text-foreground font-medium transition-colors hidden sm:block"
                                    >
                                        Back to Review
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep('finalize')}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:shadow-primary/20 transition-all flex items-center gap-2"
                                    >
                                        Proceed to Finalize
                                        <ArrowLongRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto w-full flex justify-center scrollbar-micro p-6">
                                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 h-min">

                                    {/* Left Column: Purchase Order Items & Warranties */}
                                    <div className="flex flex-col gap-6">
                                        <section>
                                            <h3 className="text-2xl font-bold font-brand text-foreground mb-6 flex items-center gap-3">
                                                <ShoppingCartIcon className="w-6 h-6 text-zinc-400" />
                                                Purchase Order Items
                                            </h3>

                                            {/* Warranty Quick Actions */}
                                            <div className="mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheckIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                                                    <span className="font-bold text-foreground whitespace-nowrap">Warranty Actions</span>
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs rounded-full font-bold">
                                                        {assets.filter(a => a.warranty !== 'Standard Warranty').length}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                                                    <button onClick={() => handleApplyWarranty('Extended Warranty', 'all')} className="flex-1 xl:flex-none px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex justify-center items-center gap-2">
                                                        <CheckCircleIcon className="w-4 h-4 text-zinc-400" />
                                                        Extended
                                                    </button>
                                                    <button onClick={() => handleApplyWarranty('Premium Protection', 'all')} className="flex-1 xl:flex-none px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex justify-center items-center gap-2">
                                                        <SparklesIcon className="w-4 h-4 text-amber-500" />
                                                        Premium
                                                    </button>
                                                    <button onClick={() => handleApplyWarranty('Standard Warranty', 'all')} className="px-3 py-1.5 text-zinc-500 hover:text-foreground text-sm font-medium transition-colors flex items-center gap-2">
                                                        <ArrowPathIcon className="w-4 h-4 shrink-0" />
                                                        <span className="hidden sm:inline">Reset</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="space-y-4">
                                                {assets.map((asset) => {
                                                    const currentWarrantyCost = (asset.unitPrice - (asset.basePrice || asset.unitPrice)) * asset.qty;
                                                    return (
                                                        <div key={asset.id} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 shadow-sm relative overflow-hidden group">
                                                            <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                                                                <div className="text-[10px] font-bold text-zinc-400 text-center leading-tight uppercase p-1">
                                                                    {asset.description.split(' ').slice(0, 2).join('\n')}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-foreground truncate">{asset.description}</h4>
                                                                <div className="text-sm text-muted-foreground mt-0.5 mb-2">
                                                                    SKU: {asset.sku} &bull; Qty: {asset.qty} &bull; Unit: {formatCurrency(asset.basePrice || asset.unitPrice)}
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                                    <div className="relative">
                                                                        <ShieldCheckIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                                        <select
                                                                            value={asset.warranty || 'Standard Warranty'}
                                                                            onChange={(e) => handleApplyWarranty(e.target.value, 'single', asset.id)}
                                                                            className="w-full sm:w-auto pl-9 pr-8 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs sm:text-sm font-medium text-foreground appearance-none hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                                        >
                                                                            <option value="Standard Warranty">Standard Warranty</option>
                                                                            <option value="Extended Warranty">Extended Warranty</option>
                                                                            <option value="Premium Protection">Premium Protection</option>
                                                                        </select>
                                                                        <ChevronDownIcon className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 sm:pl-4 sm:border-l border-zinc-100 dark:border-zinc-800 flex flex-row sm:flex-col items-center justify-between sm:justify-center">
                                                                <div className="text-xs text-muted-foreground line-through hidden sm:block">
                                                                    List: {formatCurrency((asset.basePrice || asset.unitPrice) * asset.qty)}
                                                                </div>
                                                                <div className="text-lg font-bold text-foreground">
                                                                    {formatCurrency(asset.totalPrice)}
                                                                </div>
                                                                {currentWarrantyCost > 0 && (
                                                                    <div className="text-[10px] font-bold text-green-600 mt-0.5">
                                                                        + {formatCurrency(currentWarrantyCost)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Discount Widget Section */}
                                    <div className="flex flex-col gap-6">
                                        <section className="sticky top-0">
                                            <DiscountStructureWidget
                                                subtotal={stats.totalValue}
                                                onApply={(val) => { }}
                                            />
                                        </section>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Render 'Finalize' Step Overlay */}
            {
                currentStep === 'finalize' && !isApproved && (
                    <div className="absolute inset-0 z-20 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        <div className="max-w-md w-full bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold font-brand text-foreground mb-2">Quote Ready</h2>
                            <p className="text-muted-foreground mb-6">
                                All assets have been validated. Review the final pricing summary before generating the PO.
                            </p>

                            {/* Final Pricing Summary Break-down */}
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-5 mb-8 text-left space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Base Equipment Value</span>
                                    <span className="font-medium">{formatCurrency(assets.reduce((acc, a) => acc + ((a.basePrice || a.unitPrice) * a.qty), 0))}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Warranties & Protection</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                        +{formatCurrency(assets.reduce((acc, a) => acc + ((a.unitPrice - (a.basePrice || a.unitPrice)) * a.qty), 0))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Applied Discounts</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                        -{formatCurrency(stats.totalValue * 0.02)} {/* Mock 2% discount visual */}
                                    </span>
                                </div>
                                <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                    <span className="font-bold text-foreground font-brand">Final Quote Amount</span>
                                    <span className="font-bold text-xl text-foreground">
                                        {formatCurrency(stats.totalValue * 0.98)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setIsApproved(true);
                                        if (onApprove) onApprove();
                                    }}
                                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Approve & Generate PO
                                </button>
                                <button
                                    onClick={() => setCurrentStep('review')}
                                    className="w-full py-3 text-zinc-500 hover:text-foreground font-medium transition-colors"
                                >
                                    Back to Review
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Approved State Block */}
            {
                currentStep === 'finalize' && isApproved && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-800/50 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white/90 dark:bg-zinc-900/90 p-6 rounded-2xl border border-green-200 dark:border-green-900/50 shadow-sm flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground">Quote Finalized</h4>
                                <p className="text-sm text-muted-foreground">Action has moved to the next step below.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Unified Discrepancy Resolver Modal */}
            {
                isResolverOpen && generalDiscrepancies.length > 0 && (
                    <div className="absolute inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-8 pb-32 overflow-y-auto scrollbar-micro animate-in fade-in duration-300">
                        <DiscrepancyResolverArtifact
                            title="Review Discrepancies"
                            issues={generalDiscrepancies}
                            onResolve={handleResolveDiscrepancy}
                            onClose={() => {
                                setIsResolverOpen(false);
                                if (substitutionItems.length > 0) setIsSubstitutionsOpen(true);
                            }}
                        />
                    </div>
                )
            }

            {/* Substitutions Modal */}
            {
                (isSubstitutionsOpen || (isResolverOpen && generalDiscrepancies.length === 0)) && substitutionItems.length > 0 && (
                    <div className="absolute inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-8 pb-32 overflow-y-auto scrollbar-micro animate-in fade-in duration-300">
                        <DiscrepancyResolverArtifact
                            title="Review Substitutions"
                            issues={substitutionItems}
                            onResolve={handleResolveDiscrepancy}
                            onClose={() => {
                                setIsSubstitutionsOpen(false);
                                if (isResolverOpen) setIsResolverOpen(false);
                            }}
                        />
                    </div>
                )
            }

            {/* Suggestion Modal (for direct clicks, if kept) */}
            {
                isSuggestionModalOpen && selectedSuggestionAsset && (
                    <SuggestionModal
                        isOpen={isSuggestionModalOpen}
                        onClose={() => setIsSuggestionModalOpen(false)}
                        asset={selectedSuggestionAsset}
                        onAccept={() => handleAcceptSuggestion(selectedSuggestionAsset.id)}
                        onReject={() => handleRejectSuggestion(selectedSuggestionAsset.id)}
                    />
                )
            }

            {/* Success Modal */}
            {
                showSuccess && (
                    <SuccessModal
                        isOpen={showSuccess}
                        onClose={() => setShowSuccess(false)}
                        type={finalType}
                    />
                )
            }
        </div >
    );
}
