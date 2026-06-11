# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # compile (use this to verify changes)
npm run lint    # ESLint
npm run preview # serve the dist/ build locally
```

The dev server is managed externally — do not run `npm run dev`.

## Environment

`VITE_API_URL` in `.env` sets the backend base URL (default fallback in `src/services/client.js` is `http://localhost:3000`).

## Architecture

**Stack:** React 19, Vite, React Router v7, TanStack Query v5, Axios, Gravity UI (`@gravity-ui/uikit`). `@` is an alias for `src/`.

**Provider order** (outermost → innermost in `App.jsx`):
```
QueryClientProvider → ThemeProvider → ToasterProvider → BrowserRouter → AuthProvider
```

**Routing:**
- `/login`, `/register` — public
- `/` (DashboardPage), `/keys` (KeysPage) — protected, rendered inside `AppLayout` via `RequireAuth`
- Unauthenticated users are redirected to `/login`; unknown paths redirect to `/`

**Auth flow:** JWT token stored in `localStorage`. `AuthProvider` holds `{ user, token, isLoading, login, logout }` and fetches `/users/me` on mount if a token exists. The Axios client in `src/services/client.js` attaches the token to every request and hard-redirects to `/login` on a 401.

**API services** (`src/services/api/`): plain objects with methods that call the shared Axios client and return `response.data` directly. Global HTTP error handling (toast on error, redirect on 401) lives in the client interceptors — API modules do not handle errors themselves.

**Data fetching:** TanStack Query throughout. Query keys follow a flat array convention (`['keys']`, `['marketing-accounts']`, `['marketing-campaigns', accountId]`). Mutations call `queryClient.invalidateQueries` on success to refetch.

**Styling:** CSS Modules (`.module.css`) for component-level styles. Gravity UI provides the design system tokens and components; theme (`dark`/`light`) is persisted to `localStorage` and toggled via `useTheme()`.

**UI dialogs** live in `src/ui/dialogs/` and are rendered in-page (not via a portal registry). Form submissions use the HTML `form` + `id` attribute pattern so the submit button can live outside the `<form>` element.
