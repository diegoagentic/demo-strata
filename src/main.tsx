import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DSReference from './DSReference.tsx'
import { TenantProvider } from './TenantContext'
import { AuthProvider } from './context/AuthContext'
import { DemoProfileProvider } from './context/DemoProfileContext'
import { DemoProvider } from './context/DemoContext'
import { ThemeProvider } from 'strata-design-system'

const isDSReference = window.location.pathname === '/ds-reference'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDSReference ? (
      <DSReference />
    ) : (
      <AuthProvider>
        <DemoProfileProvider>
          <DemoProvider>
            <TenantProvider>
              <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <App />
              </ThemeProvider>
            </TenantProvider>
          </DemoProvider>
        </DemoProfileProvider>
      </AuthProvider>
    )}
  </StrictMode>,
)
