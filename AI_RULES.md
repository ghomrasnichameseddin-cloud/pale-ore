# AI Rules — Pale Ore Progress OS

## Tech Stack

- **React 19** — Primary UI framework. All components are functional components using hooks (`useState`, `useEffect`, `useRef`, `useContext`, `useMemo`). Context API (`createContext`) is used for global state management via `POSContext`.
- **TypeScript** — Strict type safety throughout. All interfaces and types are defined in `src/types.ts`. Use `tsx` for TypeScript execution in scripts.
- **Vite** — Build tool and development server. Configured in `vite.config.ts`. Uses `@vitejs/plugin-react` for JSX/TSX support and `@tailwindcss/vite` for Tailwind CSS processing.
- **Tailwind CSS v4** — All styling uses Tailwind utility classes exclusively. Custom design tokens are applied via CSS variables and `data-*` attributes on the root element. No custom CSS files for component styling.
- **shadcn/ui** — Component library built on Radix UI primitives. Use prebuilt components from `src/components/ui/`. Do not edit shadcn/ui source files; create new components in `src/components/` when needed.
- **Radix UI** — Accessible primitive components (dialogs, dropdowns, tabs, etc.) used under the hood by shadcn/ui. Import directly from `@radix-ui/react-*` when shadcn wrappers are insufficient.
- **lucide-react** — Icon library. All icons are imported from `lucide-react` and rendered as React components. Use named exports (e.g., `import { Activity, Target } from 'lucide-react'`).
- **motion/react** — Animation library. Use `motion` and `AnimatePresence` from `motion/react` for page transitions, overlays, and micro-interactions.
- **React Router** — Client-side routing. All routes are defined in `src/App.tsx`. Use `useState` for tab-based navigation within the single-page app (no traditional route switching).
- **Vite PWA Plugin** — Progressive Web App support via `vite-plugin-pwa`. Service worker registration is handled in `src/main.tsx` using `registerSW` from `virtual:pwa-register`.
- **LocalStorage** — Primary persistence mechanism. All app state is serialized to `localStorage` under the key `pale_ore_pos_state`. Focus sessions use a separate key `pale_ore_pos_focus_session`. No server-side database.
- **Web Battery API** — Used in `POSContext.tsx` to detect low battery and auto-enable battery saver mode via `navigator.getBattery()`.

## Library Usage Rules

| Purpose | Library | Notes |
|---|---|---|
| UI Framework | React 19 | Functional components + hooks only |
| Type System | TypeScript | All files `.tsx` or `.ts`; strict mode |
| Build/Dev | Vite | `vite --port=3000` for dev |
| Styling | Tailwind CSS v4 | Utility classes only; no custom CSS |
| Components | shadcn/ui | Prebuilt; don't edit source |
| Primitives | Radix UI | Accessible base components |
| Icons | lucide-react | Named imports only |
| Animations | motion/react | `motion` + `AnimatePresence` |
| Routing | React Router | Defined in `src/App.tsx` |
| PWA | vite-plugin-pwa | Service worker in `main.tsx` |
| State/Context | React Context API | `POSContext` for global state |
| Persistence | localStorage | JSON serialization |
| Battery | Web Battery API | `navigator.getBattery()` |

## File Structure Conventions

- **Pages**: `src/pages/` — Not heavily used; main app is `src/App.tsx`
- **Components**: `src/components/` — Organized by feature (e.g., `spiritual/`, `matrix/`, `frameworks/`)
- **Context**: `src/POSContext.tsx` — Single global state provider
- **Types**: `src/types.ts` — All TypeScript interfaces
- **Data**: `src/data/`, `src/initialState.ts` — Default data and initial state
- **Utils**: `src/utils/` — Pure utility functions
- **Lib**: `src/lib/` — Library integrations (currently empty after Firebase removal)
- **Styles**: `src/index.css` — Global CSS with Tailwind directives

## Key Patterns

- **State Management**: All state lives in `POSContext` via `useState`. The `POSProvider` wraps the entire app. State is persisted to `localStorage` on every change via `useEffect`.
- **Date System**: The app has a simulated date system (`systemDate`) that can be manually adjusted. Midnight transitions trigger penalties and quest resets.
- **Weekly Muhāsabah Cycle**: Runs strictly on a Saturday 00:00:00 to Friday 23:59:59 window. Sundays trigger automated archival and active slip resets. Deterministic multi-week reconciliation (`reconcileMissedWeeks` in `src/utils/weeklyCycle.ts`) handles catch-up idempotently when app is opened days or weeks later.
- **XP System**: All XP flows through `xpHistory` (array of `XPHistoryEntry`). Levels are calculated dynamically from cumulative XP.
- **Component Composition**: Views are composed in `AppContent()` based on `activeTab` state. Each view is a separate component in `src/components/`.
- **No Server**: This is a fully client-side application. No API routes, no server code, no backend dependencies.
