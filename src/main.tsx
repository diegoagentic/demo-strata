import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TenantProvider } from './TenantContext'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import { ThemeProvider } from 'strata-design-system'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <DemoProvider>
        <TenantProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <App />
          </ThemeProvider>
        </TenantProvider>
      </DemoProvider>
    </AuthProvider>
  </StrictMode>,
)
