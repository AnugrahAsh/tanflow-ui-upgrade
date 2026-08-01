# Tanflow — Vite + React migration

Idiomatic React (JavaScript) port of the original single-file `index.html`
Tanflow Identity Security Cloud prototype.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## What was migrated

- **Design system** — the full CSS is preserved verbatim in
  `src/styles/global.css` (no visual drift).
- **Shell** — header, sidebar navigation (collapsible groups), status bar with
  live UTC clock, breadcrumbs, command palette (⌘K), notification/user flyouts,
  slide-over drawer and toast system — all as React components driven by
  `AppContext` (`src/context/AppContext.jsx`).
- **Routing** — hash-based routing via `react-router-dom` (`HashRouter`), so the
  built app works from any sub-path on static hosting. The nav model lives in
  `src/router/nav.js`.
- **Chart engine** — `Sparkline`, `AreaChart`, `BarChart`, `RingGauge`,
  `SegBar`, `Heatmap` rewritten as SVG React components with a shared
  `TooltipProvider` replacing the original global `#viz-tip` handler.
- **Data** — all mock datasets ported to `src/data/mockData.js`. Generation is
  deterministic (seeded), so output matches the original exactly.
- **Views** — **all 25 views are fully migrated** (Overview, Access Analytics,
  Users, Groups, Roles, Directory, Provisioning, Access Requests,
  Certifications, Policies & SoD, Compliance, Credential Vault, Live Sessions,
  Recordings, Just-in-Time, Command Policies, SSO, MFA, AAA, Adaptive Access,
  Audit Log, Alerts, Reports, Integrations, Settings) — including interactive
  behaviour: filterable tables, the user detail drawer, request approve/reject,
  certification retain/revoke, the recordings player, toggles and the settings
  section switcher. `StubView` remains as a fallback for any unknown route id.

## Structure

```
src/
  main.jsx            entry
  App.jsx             router + providers
  styles/global.css   design system (verbatim)
  lib/                icons, series (seeded), format helpers
  data/mockData.js    all datasets
  components/
    Icon.jsx  primitives.jsx  ui.jsx
    charts/           Tooltip + chart components
    shell/            TopBar, Sidebar, StatusBar, Drawer, Flyout,
                      Toaster, CommandPalette, AppShell
  context/AppContext.jsx
  router/nav.js
  views/              Overview, Users, UserDrawer, StubView, index.js
public/assets/        brand + vendor logos (copied from the original)
```

## Adding a new view

1. Add its id + label to the relevant group in `src/router/nav.js`.
2. Create `src/views/<Name>.jsx` following any existing view.
3. Register it in `src/views/index.js` under its route id.

The sidebar entry, breadcrumb, document title and route are wired automatically
from `src/router/nav.js`.
