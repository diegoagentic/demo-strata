import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { DEMO_PROFILES, type DemoProfile, type DemoProfileId } from '../config/demoProfiles';

interface DemoProfileContextType {
    activeProfile: DemoProfile;
    profiles: DemoProfile[];
    switchProfile: (id: DemoProfileId) => void;
}

const DemoProfileContext = createContext<DemoProfileContextType | undefined>(undefined);

export function DemoProfileProvider({ children }: { children: ReactNode }) {
    const [activeProfileId, setActiveProfileId] = useState<DemoProfileId>(
        () => (localStorage.getItem('demo-profile') as DemoProfileId) || 'acme'
    );

    useEffect(() => {
        localStorage.setItem('demo-profile', activeProfileId);
    }, [activeProfileId]);

    const activeProfile = DEMO_PROFILES.find(p => p.id === activeProfileId) || DEMO_PROFILES[0];

    const switchProfile = (id: DemoProfileId) => {
        setActiveProfileId(id);
    };

    return (
        <DemoProfileContext.Provider value={{ activeProfile, profiles: DEMO_PROFILES, switchProfile }}>
            {children}
        </DemoProfileContext.Provider>
    );
}

export function useDemoProfile() {
    const context = useContext(DemoProfileContext);
    if (!context) throw new Error('useDemoProfile must be used within DemoProfileProvider');
    return context;
}
