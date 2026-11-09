# Rent Nest — Frontend

React + Vite frontend for the Rent Nest property-management backend (`Rent_nest_Auth`).
Pure JavaScript: every component is `.jsx`, every other module is `.js`. No TypeScript.

**Stack:** React 18 · Vite · Tailwind CSS · Axios · React Router DOM · TanStack React Query · React Hook Form · Zod · Lucide React · Context API (auth + toasts)

## Requirements

- Node.js 18+
- The Rent Nest backend running (default `http://localhost:8000`, base path `/api/v1`)

## Installation

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:3000
```

Production build:

```bash
npm run build
npm run preview          # serves dist/ on http://localhost:3000 (also proxies /api)
```

## Configuration

| Variable            | Default                 | Purpose                                              |
| ------------------- | ----------------------- | ---------------------------------------------------- |
| `VITE_API_URL`      | `/api/v1`               | API base path (must equal the backend `BASE_URL`)    |
| `VITE_PROXY_TARGET` | `http://localhost:8000` | Where Vite proxies `/api` in dev/preview             |
| `VITE_DEV_PORT`     | `3000`                  | Dev server port                                      |

**Why a proxy?** The backend authenticates with HTTP-only cookies (`accTkn` 15 min, `refTkn` 7 days). Proxying `/api` through Vite keeps the browser on a single origin, so cookies work without any CORS/SameSite trouble. `VITE_DEV_PORT` should match the backend `CLIENT_URL` (`http://localhost:3000`) because password-reset emails link to `CLIENT_URL/reset-password/:token`.

For a separate production deployment, serve `dist/` behind a reverse proxy that forwards `/api` to the backend (same origin), **or** set `VITE_API_URL` to the full backend URL and configure the backend `CLIENT_URL`/cookie settings (`sameSite: none`, `secure`) accordingly.

## Project structure

```
src/
  App.jsx                    route table (all pages lazy-loaded)
  main.jsx                   providers: ErrorBoundary > React Query > Router > Toast > Auth
  lib/                       axios (refresh-token interceptor), query client, zod schemas, utils
  services/                  one Axios service per backend module (auth, units, payments, ...)
  context/                   AuthContext (session), ToastContext
  hooks/                     useApiMutation (toast + cache invalidation), useDebounce
  routes/                    guards (auth / role), ApprovalGate (pending tenants)
  components/
    layout/                  Sidebar, Topbar, DashboardLayout, AuthLayout
    ui/                      Button, Input, Modal, ConfirmDialog, DataTable, Pagination, ...
  features/
    auth/pages               Login, Signup, VerifyOtp, ForgotPassword, ResetPassword
    admin/pages              Dashboard, Tenants, Units, Payments, Reports, Maintenance
    tenant/pages             Dashboard, My Unit, Payments (+ receipts), Maintenance
    shared/pages             Profile, Notices, Notice detail, 404
```

## Backend API used

All paths are relative to `/api/v1`.

| Area        | Endpoints                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Auth        | `POST /auth/signup` · `/verify-otp` · `/resend-otp` · `/signin` · `/forget-password` · `/refresh-token` · `/log-out` · `PATCH /auth/reset-password/:token` · `GET /auth/get-profile` · `PUT /auth/update-profile` (multipart) |
| Admin       | `GET /admin` (stats) · `/admin/tenants` · `/admin/pending` · `DELETE /admin/tenants/:id` · `PATCH /admin/tenants/:id/toggle-active` · `PATCH /admin/tenants/:id/approval` |
| Tenant      | `GET /admin/tenant` (tenant dashboard — the backend mounts it under `/admin`)                              |
| Units       | `POST /unit/create` · `GET /unit/all-unit` · `/unit/my-unit` · `/unit/single-unit/:id` · `PATCH /unit/update-unit/:id` · `DELETE /unit/del-unit/:id` · `PATCH /unit/assign-tenant/:id` · `/unassign-tenant/:id` |
| Payments    | `POST /payment/submit` · `GET /payment/my-payments` · `/receipt/:id` · `/all-payments` · `/overdue` · `/monthly-report` · `PATCH /payment/verify/:id` · `/reject/:id` |
| Notices     | `POST /notice/create` · `GET /notice/getall` · `/single/:id` · `PATCH /notice/update/:id` · `DELETE /notice/del/:id` · `POST /notice/comment/:id` · `DELETE /notice/del-comment/:id/:commentId` |
| Maintenance | `POST /maintenance/create` (multipart) · `GET /maintenance/getmy` · `/getall` · `/single/:id` · `PATCH /maintenance/update/:id` · `DELETE /maintenance/del/:id` |

## Roles & access

- **Admin** — `/admin/*` pages. Admin accounts can't be created through the API (see limitations).
- **Tenant** — `/tenant/*` pages. Tenants who are `pending` or `rejected` can sign in and edit their profile but see an approval-status screen instead of tenant pages (the backend's `requireApproved` returns 403 for them).
- Sessions persist across reloads via the HTTP-only cookies; an expired access token is renewed transparently through `POST /auth/refresh-token`, and a failed refresh signs the user out.
