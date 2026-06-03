# Happy2Clean Admin Portal — Angular 17 Frontend

Admin portal SPA for the Happy2Clean cleaning service management platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone components) |
| Language | TypeScript 5.2 |
| Styling | SCSS with CSS custom properties |
| HTTP | Angular HttpClient + functional interceptors |
| Auth | JWT stored in localStorage |
| Forms | Reactive Forms (login, booking) |

## Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/login` | Login | Full-page auth form |
| `/dashboard` | Dashboard | KPI cards + recent bookings |
| `/worker-applications` | Worker Applications | Review, approve, reject workers |
| `/live-jobs` | Live Job Board | Real-time job tracking (auto-refresh 30s) |
| `/bookings` | Booking Management | Full CRUD with pagination |
| `/extension-requests` | Extension Requests | Allow / Deny / Ask worker |

## Project Structure

```
src/app/
├── core/
│   ├── guards/         auth.guard.ts          — route protection
│   ├── interceptors/   jwt.interceptor.ts     — auto-attach Bearer token
│   ├── models/         *.model.ts             — TypeScript interfaces
│   └── services/       *.service.ts           — HTTP + business logic
├── features/           one folder per screen
├── layout/
│   └── admin-layout/   sidebar + header shell
├── shared/
│   └── components/     status-badge, confirm-dialog
├── app.config.ts       providers (router, http, interceptor)
└── app.routes.ts       route definitions
```

## Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI: `npm install -g @angular/cli@17`
- The Happy2Clean API running on `http://localhost:5000`

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start

# 3. Open browser
# http://localhost:4200
```

> Login with: **admin@happy2clean.com** / **Admin123!**

## Environment Configuration

`src/environments/environment.ts` — development:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

`src/environments/environment.prod.ts` — production:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.happy2clean.com/api'
};
```

## Build for Production

```bash
npm run build
# Output: dist/happy2clean-admin/
```

## Design Tokens (CSS Custom Properties)

Defined in `src/styles.scss`:

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#10b981` | Brand green, buttons, active states |
| `--sidebar-bg` | `#111827` | Left navigation background |
| `--background` | `#f9fafb` | Page background |
| `--card-bg` | `#ffffff` | Card / panel background |
| `--danger` | `#ef4444` | Reject / deny actions |
| `--warning` | `#f59e0b` | Pending status badges |

## Key Architecture Decisions

**Standalone Components** — No NgModules; each component declares its own imports.

**Class-based HTTP Interceptor** — `JwtInterceptor` attaches `Authorization: Bearer <token>` to every request except `/auth/login`. Registered via `HTTP_INTERCEPTORS` token with `withInterceptorsFromDi()`.

**Auth Guard** — `canActivate: [authGuard]` on all routes under `AdminLayoutComponent`; redirects to `/login` if no token in localStorage.

**Auto-refresh** — Live Jobs board polls the API every 30 seconds using `interval()` + `takeUntilDestroyed()` for clean teardown.

**Fallback data** — All components show sensible placeholder data if the API is unreachable, so the UI is always browsable during development.

## Running Both Projects Together

```bash
# Terminal 1 — API (port 5000)
cd Happy2CleanAPI && dotnet run

# Terminal 2 — Angular (port 4200)
cd happy2clean-admin && npm start
```
