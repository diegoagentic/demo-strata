import { useState, useEffect } from 'react';
import { useGenUI, GenUIProvider } from '../../context/GenUIContext';
import ModeSelectionArtifact from '../gen-ui/artifacts/ModeSelectionArtifact';
import AssetReviewArtifact from '../gen-ui/artifacts/AssetReviewArtifact';
import ERPSystemSelectorArtifact from '../gen-ui/artifacts/ERPSystemSelectorArtifact';
import { CheckCircleIcon, DocumentPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Wrapper to intercept context messages
function SmartQuoteHubContent({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const { messages, sendMessage } = useGenUI();
    const [mode, setMode] = useState<'selection' | 'erp_selection' | 'processing' | 'review' | 'success'>('selection');
    const [reviewData, setReviewData] = useState<any>(null);

    // Intercept messages to drive state
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        // We removed the check for ignoring user messages because the Artifacts use sendMessage (as user)
        // to communicate selections. SmartQuoteHub needs to react to these "User" actions.

        // Actually, we want to listen to the artifacts triggering "sendMessage"
        // ModeSelectionArtifact triggers: "Mode Selected: File", "Mode Selected: Connect ERP" etc (via context)
        // Since we are wrapping it in a local provider, we can see these messages.

        const content = lastMsg.content.toLowerCase();

        // 1. Transition: Selection -> Processing/Review OR ERP Selection
        if (mode === 'selection') {
            // Logic extracted from GenUIContext intent engine mock, but specialized for this widget
            if (content.includes('mode selected: file') || content.includes('upload request')) {
                setMode('processing');
                // Simulate processing delay
                setTimeout(() => {
                    setReviewData({
                        source: 'upload',
                        fileName: 'Request_Upload.pdf',
                        assets: [
                            { id: '1', description: 'Executive Task Chair', sku: 'CH-EXEC-24', qty: 150, unitPrice: 895.00, totalPrice: 134250.00, status: 'validated' },
                            { id: '2', description: 'Conf Chair (Leather)', sku: 'CH-CONF-L', qty: 8, unitPrice: 850.00, totalPrice: 6800.00, status: 'review', issues: ['Needs review'] }
                        ]
                    });
                    setMode('review');
                }, 2000);
            } else if (content.includes('processed upload')) {
                // ModeSelectionArtifact sends "Processed Upload: filename"
                setMode('processing');
                setTimeout(() => {
                    setReviewData({
                        source: 'upload',
                        fileName: 'Request_Upload.pdf',
                        assets: [
                            { id: '1', description: 'Executive Task Chair', sku: 'CH-EXEC-24', qty: 150, unitPrice: 895.00, totalPrice: 134250.00, status: 'validated' },
                            { id: '2', description: 'Conf Chair (Leather)', sku: 'CH-CONF-L', qty: 8, unitPrice: 850.00, totalPrice: 6800.00, status: 'review', issues: ['Needs review'] }
                        ]
                    });
                    setMode('review');
                }, 1000);
            } else if (content.includes('mode selected: connect erp')) {
                setMode('erp_selection');
            }
        }

        // 2. Transition: ERP Selection -> Processing -> Review
        if (mode === 'erp_selection') {
            if (content.includes('system selected')) {
                setMode('processing');
                setTimeout(() => {
                    setReviewData({
                        source: 'erp',
                        fileName: 'NetSuite Import #4921',
                        assets: [
                            { id: '1', description: 'Herman Miller Aeron', sku: 'HM-AER-B', qty: 45, unitPrice: 1250.00, totalPrice: 56250.00, status: 'validated' },
                            { id: '2', description: 'Steelcase Gesture', sku: 'SC-GES-01', qty: 12, unitPrice: 1100.00, totalPrice: 13200.00, status: 'validated' }
                        ]
                    });
                    setMode('review');
                }, 1500);
            }
        }

        // 3. Transition: Review -> Success/Redirect
        if (mode === 'review') {
            if (content.includes('purchase order') && content.includes('submitted')) {
                // SuccessModal in AssetReviewArtifact sends this when user clicks "View in Transactions" or closes modal (triggers redirect logic)
                // If they click "Create New Quote", it sends "Start New Quote" which we handle separately
                if (!content.includes('start new quote')) {
                    // Only transition to success/redirect if it wasn't a reset request
                    // Actually, AssetReviewArtifact sends "Purchase Order... submitted" OR "Start New Quote"
                    // So we can keep this for the redirect case
                    setMode('success');
                    setTimeout(() => {
                        if (onNavigate) onNavigate('transactions');
                    }, 1500);
                }
            } else if (content.includes('quote') && content.includes('created')) {
                setMode('success');
                setTimeout(() => {
                    if (onNavigate) onNavigate('transactions');
                }, 1500);
            } else if (content.includes('start new quote')) {
                // Reset Flow
                setMode('selection');
                setReviewData(null);
            }
        }

    }, [messages, mode, onNavigate]);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[600px] flex flex-col">
            {/* Header (Shared) */}
            {mode === 'selection' && (
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <DocumentPlusIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-brand font-semibold text-foreground">Quick Quote</h3>
                            <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Essential</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Upload files or start from scratch</p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden relative">
                {mode === 'selection' && (
                    <div className="h-full overflow-y-auto p-4 scrollbar-micro">
                        <ModeSelectionArtifact />
                    </div>
                )}

                {mode === 'erp_selection' && (
                    <div className="h-full overflow-y-auto p-4 animate-in slide-in-from-right duration-500 scrollbar-micro">
                        <ERPSystemSelectorArtifact />
                    </div>
                )}

                {mode === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                        <h3 className="text-lg font-semibold text-foreground">Analyzing Documents...</h3>
                        <p className="text-muted-foreground mt-2">Extracting line items and validating SKUs.</p>
                    </div>
                )}

                {mode === 'review' && reviewData && (
                    <div className="h-full animate-in slide-in-from-right duration-500">
                        {/* We reuse AssetReviewArtifact but inject mocked data */}
                        <AssetReviewArtifact data={reviewData} source={reviewData.source} />
                    </div>
                )}

                {mode === 'success' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircleIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Order Submitted!</h3>
                        <p className="text-muted-foreground mb-8">Redirecting to Transactions...</p>
                        <button onClick={() => onNavigate && onNavigate('transactions')} className="flex items-center gap-2 text-primary font-medium hover:underline">
                            Go to Transactions Now <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SmartQuoteHub(props: { onNavigate?: (page: string) => void }) {
    // We wrap the content in a LOCAL GenUIProvider so it has its own "message stream"
    // This allows the artifacts (which use runGenUI()) to function autonomously within this widget
    // without polluting the global chat
    return (
        <GenUIProvider>
            <SmartQuoteHubContent {...props} />
        </GenUIProvider>
    );
}
