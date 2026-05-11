import { useState } from 'react'

// DS Reference page — shows all Strata DS tokens & components for dev reference
// Route: /ds-reference  (accessible without auth)

type Mode = 'light' | 'dark'

const TOKEN_SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">{title}</h2>
    {children}
  </section>
)

const Swatch = ({ bg, label, token, textClass = 'text-zinc-900' }: {
  bg: string; label: string; token: string; textClass?: string
}) => (
  <div className="flex flex-col gap-1">
    <div className={`${bg} h-14 w-full rounded-md border border-border/40`} />
    <p className={`text-xs font-medium text-foreground`}>{label}</p>
    <p className="text-xs text-muted-foreground font-mono">{token}</p>
  </div>
)

const StatusBadge = ({ bg, fg, label, token }: {
  bg: string; fg: string; label: string; token: string
}) => (
  <div className="flex items-center gap-3">
    <span className={`${bg} ${fg} px-3 py-1.5 rounded-full text-xs font-medium`}>{label}</span>
    <span className="text-xs text-muted-foreground font-mono">{token}</span>
  </div>
)

export default function DSReference() {
  const [mode, setMode] = useState<Mode>('light')

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light'
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Strata DS — Token Reference</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Connected to <span className="font-mono">github.com/diegoagentic/strata-ds</span> · 207 tokens</p>
        </div>
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card text-card-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Semantic Colors */}
        <TOKEN_SECTION title="Semantic Colors">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Swatch bg="bg-background" label="Background" token="--color-background" />
            <Swatch bg="bg-foreground" label="Foreground" token="--color-foreground" textClass="text-white" />
            <Swatch bg="bg-card" label="Card" token="--color-card" />
            <Swatch bg="bg-muted" label="Muted" token="--color-muted" />
            <Swatch bg="bg-primary" label="Primary (Brand)" token="--color-primary" />
            <Swatch bg="bg-secondary" label="Secondary" token="--color-secondary" />
            <Swatch bg="bg-accent" label="Accent" token="--color-accent" />
            <Swatch bg="bg-destructive" label="Destructive" token="--color-destructive" textClass="text-white" />
            <Swatch bg="bg-border" label="Border" token="--color-border" />
            <Swatch bg="bg-ring" label="Ring" token="--color-ring" />
          </div>
        </TOKEN_SECTION>

        {/* Status Tokens — New DS v2 */}
        <TOKEN_SECTION title="Status Tokens (DS v2 · --color-status-*)">
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Nueva nomenclatura en <span className="font-mono font-medium">strata-ds v2</span>. Usar <span className="font-mono">bg-status-success</span>, <span className="font-mono">text-status-success-foreground</span>, etc.
            </p>
            <div className="flex flex-col gap-3">
              <StatusBadge bg="bg-status-success" fg="text-status-success-foreground" label="Success" token="--color-status-success · bg-status-success" />
              <StatusBadge bg="bg-status-warning" fg="text-status-warning-foreground" label="Warning" token="--color-status-warning · bg-status-warning" />
              <StatusBadge bg="bg-status-error" fg="text-status-error-foreground" label="Error" token="--color-status-error · bg-status-error" />
              <StatusBadge bg="bg-status-info" fg="text-status-info-foreground" label="Info" token="--color-status-info · bg-status-info" />
              <StatusBadge bg="bg-status-ai" fg="text-status-ai-foreground" label="AI" token="--color-status-ai · bg-status-ai" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Swatch bg="bg-status-success" label="Status Success" token="#16a34a" textClass="text-white" />
            <Swatch bg="bg-status-warning" label="Status Warning" token="#b45309" textClass="text-white" />
            <Swatch bg="bg-status-error" label="Status Error" token="#C11736" textClass="text-white" />
            <Swatch bg="bg-status-info" label="Status Info" token="#2563eb" textClass="text-white" />
            <Swatch bg="bg-status-ai" label="Status AI" token="#8b5cf6" textClass="text-white" />
          </div>
        </TOKEN_SECTION>

        {/* Legacy Status Tokens */}
        <TOKEN_SECTION title="Status Tokens (legacy · --color-success / --color-warning…)">
          <p className="text-xs text-muted-foreground mb-4">
            Tokens de 2026-04. Siguen funcionando. Migrar a <span className="font-mono">--color-status-*</span> en componentes nuevos.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Swatch bg="bg-success" label="Success" token="--color-success" textClass="text-white" />
            <Swatch bg="bg-warning" label="Warning" token="--color-warning" textClass="text-white" />
            <Swatch bg="bg-info" label="Info" token="--color-info" textClass="text-white" />
            <Swatch bg="bg-ai" label="AI" token="--color-ai" textClass="text-white" />
            <Swatch bg="bg-danger" label="Danger" token="--color-danger" textClass="text-white" />
          </div>
        </TOKEN_SECTION>

        {/* Brand Scale */}
        <TOKEN_SECTION title="Brand Scale (Volt Lime)">
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-foreground">Regla:</strong> brand-300/400 NUNCA como texto sobre fondo blanco (contraste 1.8:1 — FALLA). Usar solo como fondo de CTA.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(shade => (
              <div key={shade} className="flex flex-col gap-1">
                <div className={`bg-brand-${shade} h-10 rounded border border-border/30`} />
                <span className="text-xs text-muted-foreground font-mono">{shade}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <div className="bg-brand-300 text-zinc-900 px-4 py-2 rounded-md text-sm font-medium">CTA Light ✓</div>
            <div className="bg-brand-400 text-zinc-900 px-4 py-2 rounded-md text-sm font-medium">CTA Dark ✓</div>
            <div className="bg-brand-500 text-zinc-900 px-4 py-2 rounded-md text-sm font-medium">brand-500</div>
          </div>
        </TOKEN_SECTION>

        {/* Violet Scale — New */}
        <TOKEN_SECTION title="Violet Scale (Nuevo en DS v2 · usado por AI tokens)">
          <div className="grid grid-cols-5 gap-3">
            {[300, 400, 500, 600, 700].map(shade => (
              <div key={shade} className="flex flex-col gap-1">
                <div className={`bg-violet-${shade} h-10 rounded border border-border/30`} />
                <span className="text-xs text-muted-foreground font-mono">violet-{shade}</span>
              </div>
            ))}
          </div>
        </TOKEN_SECTION>

        {/* Zinc Scale */}
        <TOKEN_SECTION title="Zinc Scale (Neutrales)">
          <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(shade => (
              <div key={shade} className="flex flex-col gap-1">
                <div className={`bg-zinc-${shade} h-8 rounded border border-border/20`} />
                <span className="text-[10px] text-muted-foreground font-mono">{shade}</span>
              </div>
            ))}
          </div>
        </TOKEN_SECTION>

        {/* Typography */}
        <TOKEN_SECTION title="Typography">
          <div className="space-y-4 bg-card border border-border rounded-lg p-6">
            <div><h1 className="text-foreground">H1 — Page Title</h1><span className="text-xs text-muted-foreground font-mono">h1 · text-2xl · font-medium</span></div>
            <div><h2 className="text-foreground">H2 — Section Heading</h2><span className="text-xs text-muted-foreground font-mono">h2 · text-xl · font-medium</span></div>
            <div><h3 className="text-foreground">H3 — Card Heading</h3><span className="text-xs text-muted-foreground font-mono">h3 · text-lg · font-medium</span></div>
            <div><h4 className="text-foreground">H4 — Sub Heading</h4><span className="text-xs text-muted-foreground font-mono">h4 · text-base · font-medium</span></div>
            <div><p className="text-foreground">Body — Regular paragraph text for content areas.</p><span className="text-xs text-muted-foreground font-mono">p · text-base · font-normal</span></div>
            <div><p className="text-sm text-muted-foreground">Muted text — Secondary information, labels, hints.</p><span className="text-xs text-muted-foreground font-mono">text-sm text-muted-foreground</span></div>
            <div><p className="text-xs text-muted-foreground font-mono">Mono · code · tokens · identifiers</p><span className="text-xs text-muted-foreground font-mono">text-xs font-mono</span></div>
          </div>
        </TOKEN_SECTION>

        {/* Buttons */}
        <TOKEN_SECTION title="Buttons">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="bg-primary text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-400 transition-colors">
                Primary
              </button>
              <button className="bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Secondary
              </button>
              <button className="bg-transparent text-foreground border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Outline
              </button>
              <button className="bg-transparent text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Ghost
              </button>
              <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Destructive
              </button>
              <button disabled className="bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                Disabled
              </button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-mono font-medium">Primary:</span> bg-primary text-zinc-900 hover:bg-brand-400</p>
              <p><span className="font-mono font-medium">Secondary:</span> bg-secondary text-secondary-foreground border border-border</p>
              <p><span className="font-mono font-medium">Destructive:</span> bg-destructive text-destructive-foreground</p>
            </div>
          </div>
        </TOKEN_SECTION>

        {/* Cards */}
        <TOKEN_SECTION title="Cards & Surfaces">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-foreground">Card Default</p>
              <p className="text-xs text-muted-foreground mt-1">bg-card border-border shadow-sm</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium text-foreground">Muted Surface</p>
              <p className="text-xs text-muted-foreground mt-1">bg-muted</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <p className="text-sm font-medium text-white">Inverted (Sidebar)</p>
              <p className="text-xs text-zinc-400 mt-1">bg-zinc-900 text-white</p>
            </div>
          </div>
        </TOKEN_SECTION>

        {/* Shadows */}
        <TOKEN_SECTION title="Shadows">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['shadow-sm', 'shadow-base', 'shadow-md', 'shadow-lg'].map(s => (
              <div key={s} className={`bg-card rounded-lg p-4 ${s}`}>
                <p className="text-xs font-mono text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </TOKEN_SECTION>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>Strata DS · <span className="font-mono">github.com/diegoagentic/strata-ds</span> · 207 tokens · Sincronizado {new Date().toLocaleDateString('es-CO')}</p>
          <p className="mt-1">Usar solo tokens semánticos. Nunca hardcodear colores. brand-300/400 nunca como texto.</p>
        </footer>
      </main>
    </div>
  )
}
