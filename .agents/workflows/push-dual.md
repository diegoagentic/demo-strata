---
description: Push la rama local `demo` simultaneamente a los 2 repositorios de GitHub de UI-Dealer (devs + stakeholders)
---

# Push Dual-Remote — UI-Dealer

Este workflow actualiza simultáneamente los 2 repositorios de GitHub que usa UI-Dealer.

## Contexto de los repositorios

| Remote | URL | Audiencia | Rama destino |
|--------|-----|-----------|-------------|
| `origin` | https://github.com/diegoagentic/UI-Dealer | Desarrolladores | `demo` |
| `demo-strata` | https://github.com/diegoagentic/demo-strata | Stakeholders / Vercel | `main` |

> La rama local activa siempre es `demo`. No se trabaja directamente en `main` local.

## Prerequisitos

- Estar posicionado en la rama `demo` localmente
- Tener cambios commiteados (working tree limpio)
- Tener acceso push a ambos repos en GitHub

## Pasos

Verificar rama y estado antes del push:

```bash
git branch --show-current
git status
```

// turbo
Push al repositorio de **desarrolladores** (`origin/demo`):

```bash
git push origin demo
```

// turbo
Push al repositorio de **stakeholders** (`demo-strata/main`):

```bash
git push demo-strata demo:main
```

Verificar que ambos pushes llegaron:

```bash
git log --oneline -3 --decorate
```

## Notas

- `demo:main` → empuja la rama local `demo` a la rama `main` del remote `demo-strata`, sin modificar ninguna rama local.
- Si el push a `demo-strata/main` falla por divergencia de historial (forzado externo), usar `git push demo-strata demo:main --force-with-lease` con precaución.
- Para agregar o cambiar los remotes: `git remote set-url <nombre> <nueva-url>`
