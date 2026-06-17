# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # verify correctness (do not run dev server — user runs it separately)
npm run lint    # ESLint
```

The dev server is managed by the user. Use `npm run build` to confirm changes compile.

## Architecture

**Stack:** React 19, Vite, JavaScript (no TypeScript), CSS Modules. Path alias `@` maps to `src/`.

**Provider tree** (outermost → innermost in `App.jsx`):
`QueryClientProvider` → `ThemeProvider` → `ToasterProvider` → `BrowserRouter` → `AuthProvider`

**Auth flow:** `AuthProvider` stores a JWT in `localStorage`. The axios client in `src/services/client.js` attaches it as a `Bearer` token on every request and redirects to `/login` on 401. `RequireAuth` wraps all protected routes.

**API layer** (`src/services/api/`): One file per domain (`auth.js`, `keys.js`, `marketing.js`), each exporting a plain object of functions that call the shared axios `client`. Add new domains here following the same pattern.

**UI component library:** `@gravity-ui/uikit` — use its components (`Button`, `Select`, `Table`, `Text`, `Loader`, etc.) for all UI elements. Icons come from `lucide-react` (not `@gravity-ui/icons`).

**Server state:** All remote data fetched via `@tanstack/react-query`. Query keys follow the pattern `['resource-name', ...params]`.

**Routing:** React Router v7. Protected pages nest under the `AppLayout` / `RequireAuth` route. Current routes: `/` (Dashboard), `/keys`, `/login`, `/register`.

**Themes:** Dark by default, toggled via `useTheme()` from `ThemeProvider`. Value persisted to `localStorage`.

**Error toasts:** The axios response interceptor in `src/services/client.js` automatically shows a `danger` toast for any failed request — no manual error handling needed in components for network errors.

## Environment

`VITE_API_URL` sets the backend base URL (default `http://localhost:3000`; `.env` overrides to `http://localhost:8000`).
