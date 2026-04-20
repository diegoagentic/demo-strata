import type { Manufacturer } from './types';

export const MBI_MANUFACTURERS: Manufacturer[] = [
    { id: 'allsteel', name: 'Allsteel', isEDI: true, compassValidated: true, color: '#FF6B35' },
    { id: 'hni', name: 'HNI', isEDI: true, compassValidated: true },
    { id: 'gunlocke', name: 'Gunlocke', isEDI: true, compassValidated: true },
    { id: 'hon', name: 'The HON Company', isEDI: true, compassValidated: true },
    { id: 'kimball', name: 'Kimball International', isEDI: true },
    { id: 'steelcase', name: 'Steelcase', isEDI: false, color: '#297C46' },
    { id: 'herman-miller', name: 'Herman Miller', isEDI: false, color: '#CC3333' },
    { id: 'knoll', name: 'Knoll', isEDI: false },
    { id: 'humanscale', name: 'Humanscale', isEDI: false },
    { id: 'hbf', name: 'HBF', isEDI: false },
];

export const getManufacturer = (id: string): Manufacturer | undefined =>
    MBI_MANUFACTURERS.find(m => m.id === id);
