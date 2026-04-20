import type { Invoice } from './types';

// 12 invoices Kathy's morning queue — mix of EDI, non-EDI, HealthTrust
export const MBI_INVOICES: Invoice[] = [
    { id: 'INV-0482', vendor: 'Allsteel', poNumber: 'PO-2026-0047', amount: 41400, received: '2026-04-19T06:15:00Z', isEDI: true, ocrConfidence: 98 },
    { id: 'INV-0483', vendor: 'The HON Company', poNumber: 'PO-2026-0049', amount: 17850, received: '2026-04-19T06:22:00Z', isEDI: true, ocrConfidence: 99 },
    { id: 'INV-0484', vendor: 'Herman Miller', poNumber: 'PO-2026-0051', amount: 12900, received: '2026-04-19T07:04:00Z', isEDI: false, ocrConfidence: 92, hasException: true, exceptionReason: 'Quantity mismatch: PO 6, invoice 5' },
    { id: 'INV-0485', vendor: 'Steelcase', poNumber: 'PO-2026-0052', amount: 38250, received: '2026-04-19T07:30:00Z', isEDI: false, ocrConfidence: 94, hasException: true, exceptionReason: 'Missing freight line' },
    { id: 'INV-0486', vendor: 'HealthTrust Mercy', poNumber: 'PO-2026-0053', amount: 62400, received: '2026-04-19T08:00:00Z', isEDI: true, isHealthTrust: true, has3PctRoyalty: true, ocrConfidence: 97 },
    { id: 'INV-0487', vendor: 'Gunlocke', poNumber: 'PO-2026-0055', amount: 8750, received: '2026-04-19T08:15:00Z', isEDI: true, ocrConfidence: 99 },
    { id: 'INV-0488', vendor: 'Knoll', poNumber: 'PO-2026-0056', amount: 16800, received: '2026-04-19T08:22:00Z', isEDI: false, ocrConfidence: 91 },
    { id: 'INV-0489', vendor: 'Kimball International', poNumber: 'PO-2026-0058', amount: 22450, received: '2026-04-19T08:45:00Z', isEDI: true, ocrConfidence: 98 },
    { id: 'INV-0490', vendor: 'Humanscale', poNumber: 'PO-2026-0059', amount: 4250, received: '2026-04-19T09:01:00Z', isEDI: false, ocrConfidence: 88 },
    { id: 'INV-0491', vendor: 'HBF', poNumber: 'PO-2026-0060', amount: 6800, received: '2026-04-19T09:15:00Z', isEDI: false, ocrConfidence: 89 },
    { id: 'INV-0492', vendor: 'HealthTrust BJC', poNumber: 'PO-2026-0061', amount: 48200, received: '2026-04-19T09:30:00Z', isEDI: true, isHealthTrust: true, has3PctRoyalty: true, ocrConfidence: 96 },
    { id: 'INV-0493', vendor: 'The HON Company', poNumber: 'PO-2026-0062', amount: 11250, received: '2026-04-19T09:55:00Z', isEDI: true, ocrConfidence: 99 },
];
