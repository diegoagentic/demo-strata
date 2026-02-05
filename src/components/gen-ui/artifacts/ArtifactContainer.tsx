import type { ArtifactData } from '../../../context/GenUIContext';
import ModeSelectionArtifact from './ModeSelectionArtifact';
import ERPSystemSelectorArtifact from './ERPSystemSelectorArtifact';
import ERPSelectorArtifact from './ERPSelectorArtifact';
import QuoteProposalArtifact from './QuoteProposalArtifact';
import OrderCorrectionArtifact from './OrderCorrectionArtifact';
import StockMatrixArtifact from './StockMatrixArtifact';
import WarrantyClaimArtifact from './WarrantyClaimArtifact';
import LayoutProposalArtifact from './LayoutProposalArtifact';
import FieldMappingArtifact from './FieldMappingArtifact';
import ERPConnectModal from './ERPConnectModal';
import ERPPODashboardArtifact from './ERPPODashboardArtifact';
import AssetReviewArtifact from './AssetReviewArtifact';

// Artifacts are fully implemented in separate files



const DefaultArtifact = ({ data }: { data: any }) => (
    <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        {JSON.stringify(data, null, 2)}
    </div>
);

export default function ArtifactContainer({ artifact }: { artifact: ArtifactData }) {
    const ArtifactComponent = () => {
        switch (artifact.type) {
            case 'mode_selection':
                return <ModeSelectionArtifact />;
            case 'erp_system_selector':
                return <ERPSystemSelectorArtifact />;
            case 'erp_selector':
                return <ERPSelectorArtifact />;
            case 'erp_connect_modal':
                return <ERPConnectModal data={artifact.data} />;
            case 'erp_po_dashboard':
                return <ERPPODashboardArtifact data={artifact.data} />;
            case 'asset_review':
                return <AssetReviewArtifact data={artifact.data} />;
            case 'field_mapping_request':
                return <FieldMappingArtifact data={artifact.data} />;
            case 'order_correction':
                return <OrderCorrectionArtifact data={artifact.data} />;
            case 'stock_matrix':
                return <StockMatrixArtifact data={artifact.data} />;
            case 'layout_proposal':
                return <LayoutProposalArtifact data={artifact.data} />;
            case 'warranty_claim':
                return <WarrantyClaimArtifact data={artifact.data} />;
            case 'quote_proposal':
                return <QuoteProposalArtifact data={artifact.data} />;
            default:
                return <DefaultArtifact data={artifact.data} />;
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Context Source Header */}
            {artifact.source && (
                <div className="flex items-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide">
                        Triggered from {artifact.source}
                    </span>
                </div>
            )}

            {/* The Main Artifact */}
            <ArtifactComponent />

            {/* Deep Link Footer */}
            {artifact.link && (
                <div className="flex justify-end">
                    <a
                        href="#" // Simulated link
                        className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-0.5 hover:border-primary"
                    >
                        View Permanent Record
                        <span className="font-mono text-[9px] opacity-70">({artifact.link})</span>
                    </a>
                </div>
            )}
        </div>
    );
}
