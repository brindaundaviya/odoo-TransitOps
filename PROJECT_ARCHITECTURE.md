# TransitOps – Smart Transport Operations Platform

## Project Architecture Document

| Field | Value |
|---|---|
| **Project** | TransitOps – Smart Transport Operations Platform |
| **Event** | Odoo Business Challenge 2026 |
| **Duration** | 8-hour hackathon |
| **Document Version** | 1.0 |
| **Status** | Pre-development architecture baseline |
| **Author Role** | Senior Solution Architect / Tech Lead |

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Frontend Folder Structure](#2-frontend-folder-structure)
3. [Backend Folder Structure](#3-backend-folder-structure)
4. [Folder Structure Explanation](#4-folder-structure-explanation)
5. [Coding Conventions](#5-coding-conventions)
6. [Naming Conventions](#6-naming-conventions)
7. [API Naming Conventions](#7-api-naming-conventions)
8. [Complete Module Breakdown](#8-complete-module-breakdown)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Database Modules](#10-database-modules)
11. [API Modules](#11-api-modules)
12. [Frontend Pages & Components](#12-frontend-pages--components)
13. [Backend Architecture Layers](#13-backend-architecture-layers)
14. [Validation Strategy](#14-validation-strategy)
15. [Error Handling Strategy](#15-error-handling-strategy)
16. [Logging Strategy](#16-logging-strategy)
17. [Security Strategy](#17-security-strategy)
18. [Authentication Flow](#18-authentication-flow)
19. [Folder Dependency Rules](#19-folder-dependency-rules)
20. [Git Branch Strategy (Team of 2)](#20-git-branch-strategy-team-of-2)
21. [Hourly Development Roadmap (8 Hours)](#21-hourly-development-roadmap-8-hours)
22. [Priority Order of Implementation](#22-priority-order-of-implementation)
23. [Future Scalability Suggestions](#23-future-scalability-suggestions)
24. [Project Presentation Strategy](#24-project-presentation-strategy)

---

## 1. High-Level System Architecture

TransitOps is a **modular, full-stack fleet management platform** designed for real-time transport operations, compliance tracking, and financial oversight. The system follows a **client–server architecture** with a clear separation between presentation, application, and data layers.

### 1.1 Architecture Diagram (Logical View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  React 19 SPA (Vite + TypeScript + Tailwind CSS)                  │  │
│  │  • React Router (page routing)                                    │  │
│  │  • Axios (HTTP client + interceptors)                             │  │
│  │  • React Hook Form + Zod (form validation)                        │  │
│  │  • Recharts (analytics visualizations)                            │  │
│  │  • Role-aware UI (RBAC-gated routes & components)                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    │ Authorization: Bearer JWT
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Node.js + Express + TypeScript API Server                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │ Routes   │→│Middleware│→│Controller│→│ Service  │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘             │  │
│  │                                               │                    │  │
│  │                                    ┌──────────▼──────────┐         │  │
│  │                                    │ Repository (Prisma) │         │  │
│  │                                    └──────────┬──────────┘         │  │
│  └───────────────────────────────────────────────┼───────────────────┘  │
└──────────────────────────────────────────────────┼──────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA TIER                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                              │  │
│  │  • Relational schema (vehicles, drivers, trips, expenses, etc.)   │  │
│  │  • Audit & soft-delete columns on core entities                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Architectural Principles

| Principle | Application in TransitOps |
|---|---|
| **Separation of Concerns** | Frontend handles UI/UX; backend handles business logic, authorization, and persistence |
| **Modular Monolith** | Single deployable API with feature modules (auth, fleet, trips, finance) — ideal for hackathon velocity |
| **Layered Backend** | Routes → Middleware → Controllers → Services → Repositories → Database |
| **API-First Design** | REST endpoints defined before UI wiring; enables parallel frontend/backend development |
| **RBAC Everywhere** | Permissions enforced at API layer; UI reflects but never replaces server-side checks |
| **Fail Secure** | Unauthenticated/unauthorized requests rejected; no silent privilege escalation |
| **Convention over Configuration** | Shared patterns for naming, errors, validation, and folder layout reduce cognitive load |

### 1.3 Deployment Topology (Hackathon Target)

```
[Browser] ──→ [Vite Dev Server :5173] ──→ [Express API :3000] ──→ [PostgreSQL :5432]
```

For demo/production: frontend static build served via CDN or reverse proxy; API behind same domain with `/api` prefix.

### 1.4 Cross-Cutting Concerns

- **Authentication:** JWT access tokens; optional refresh token pattern if time permits
- **Authorization:** Role + permission middleware per route group
- **Validation:** Zod schemas shared conceptually (frontend forms, backend request bodies)
- **Error Handling:** Standardized error response envelope across all endpoints
- **Logging:** Structured request/audit logging on backend; client-side error boundary on frontend
- **Audit Trail:** Created/updated timestamps and actor references on mutable entities

---

## 2. Frontend Folder Structure

```
transitops-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Pagination/
│   │   │   ├── Badge/
│   │   │   ├── Card/
│   │   │   ├── Spinner/
│   │   │   ├── EmptyState/
│   │   │   └── ConfirmDialog/
│   │   ├── layout/
│   │   │   ├── AppLayout/
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── PageHeader/
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   └── ProtectedRoute/
│   │   ├── dashboard/
│   │   │   ├── KpiCard/
│   │   │   ├── RecentTripsWidget/
│   │   │   └── AlertsWidget/
│   │   ├── vehicles/
│   │   │   ├── VehicleTable/
│   │   │   ├── VehicleForm/
│   │   │   └── VehicleStatusBadge/
│   │   ├── drivers/
│   │   │   ├── DriverTable/
│   │   │   ├── DriverForm/
│   │   │   └── LicenseExpiryAlert/
│   │   ├── trips/
│   │   │   ├── TripTable/
│   │   │   ├── TripForm/
│   │   │   └── TripStatusStepper/
│   │   ├── maintenance/
│   │   │   ├── MaintenanceTable/
│   │   │   └── MaintenanceForm/
│   │   ├── fuel/
│   │   │   ├── FuelLogTable/
│   │   │   └── FuelLogForm/
│   │   ├── expenses/
│   │   │   ├── ExpenseTable/
│   │   │   └── ExpenseForm/
│   │   ├── reports/
│   │   │   └── ReportFilters/
│   │   └── analytics/
│   │       ├── FleetUtilizationChart/
│   │       ├── FuelTrendChart/
│   │       └── ExpenseBreakdownChart/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── vehicles/
│   │   │   ├── VehicleListPage.tsx
│   │   │   ├── VehicleDetailPage.tsx
│   │   │   └── VehicleCreateEditPage.tsx
│   │   ├── drivers/
│   │   │   ├── DriverListPage.tsx
│   │   │   ├── DriverDetailPage.tsx
│   │   │   └── DriverCreateEditPage.tsx
│   │   ├── trips/
│   │   │   ├── TripListPage.tsx
│   │   │   ├── TripDetailPage.tsx
│   │   │   └── TripCreateEditPage.tsx
│   │   ├── maintenance/
│   │   │   ├── MaintenanceListPage.tsx
│   │   │   └── MaintenanceCreateEditPage.tsx
│   │   ├── fuel/
│   │   │   ├── FuelLogListPage.tsx
│   │   │   └── FuelLogCreateEditPage.tsx
│   │   ├── expenses/
│   │   │   ├── ExpenseListPage.tsx
│   │   │   └── ExpenseCreateEditPage.tsx
│   │   ├── reports/
│   │   │   └── ReportsPage.tsx
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── usePagination.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── axiosClient.ts
│   │   │   ├── authService.ts
│   │   │   ├── vehicleService.ts
│   │   │   ├── driverService.ts
│   │   │   ├── tripService.ts
│   │   │   ├── maintenanceService.ts
│   │   │   ├── fuelService.ts
│   │   │   ├── expenseService.ts
│   │   │   ├── reportService.ts
│   │   │   └── analyticsService.ts
│   │   └── storage/
│   │       └── tokenStorage.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── vehicle.types.ts
│   │   ├── driver.types.ts
│   │   ├── trip.types.ts
│   │   ├── maintenance.types.ts
│   │   ├── fuel.types.ts
│   │   ├── expense.types.ts
│   │   ├── report.types.ts
│   │   ├── analytics.types.ts
│   │   └── api.types.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── vehicle.schema.ts
│   │   ├── driver.schema.ts
│   │   ├── trip.schema.ts
│   │   ├── maintenance.schema.ts
│   │   ├── fuel.schema.ts
│   │   └── expense.schema.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   └── statusEnums.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   └── cn.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── postcss.config.js
├── .env.example
├── .eslintrc.cjs
└── package.json
```

---

## 3. Backend Folder Structure

```
transitops-backend/
├── prisma/
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── cors.ts
│   │   └── jwt.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.validator.ts
│   │   │   └── user.types.ts
│   │   ├── vehicles/
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── vehicle.service.ts
│   │   │   ├── vehicle.repository.ts
│   │   │   ├── vehicle.validator.ts
│   │   │   └── vehicle.types.ts
│   │   ├── drivers/
│   │   │   ├── driver.routes.ts
│   │   │   ├── driver.controller.ts
│   │   │   ├── driver.service.ts
│   │   │   ├── driver.repository.ts
│   │   │   ├── driver.validator.ts
│   │   │   └── driver.types.ts
│   │   ├── trips/
│   │   │   ├── trip.routes.ts
│   │   │   ├── trip.controller.ts
│   │   │   ├── trip.service.ts
│   │   │   ├── trip.repository.ts
│   │   │   ├── trip.validator.ts
│   │   │   └── trip.types.ts
│   │   ├── maintenance/
│   │   │   ├── maintenance.routes.ts
│   │   │   ├── maintenance.controller.ts
│   │   │   ├── maintenance.service.ts
│   │   │   ├── maintenance.repository.ts
│   │   │   ├── maintenance.validator.ts
│   │   │   └── maintenance.types.ts
│   │   ├── fuel/
│   │   │   ├── fuel.routes.ts
│   │   │   ├── fuel.controller.ts
│   │   │   ├── fuel.service.ts
│   │   │   ├── fuel.repository.ts
│   │   │   ├── fuel.validator.ts
│   │   │   └── fuel.types.ts
│   │   ├── expenses/
│   │   │   ├── expense.routes.ts
│   │   │   ├── expense.controller.ts
│   │   │   ├── expense.service.ts
│   │   │   ├── expense.repository.ts
│   │   │   ├── expense.validator.ts
│   │   │   └── expense.types.ts
│   │   ├── reports/
│   │   │   ├── report.routes.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── report.service.ts
│   │   │   ├── report.repository.ts
│   │   │   └── report.types.ts
│   │   ├── analytics/
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.repository.ts
│   │   │   └── analytics.types.ts
│   │   └── dashboard/
│   │       ├── dashboard.routes.ts
│   │       ├── dashboard.controller.ts
│   │       ├── dashboard.service.ts
│   │       └── dashboard.repository.ts
│   ├── middlewares/
│   │   ├── authenticate.middleware.ts
│   │   ├── authorize.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── requestLogger.middleware.ts
│   │   └── notFound.middleware.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── password.util.ts
│   │   ├── jwt.util.ts
│   │   └── pagination.util.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── common.types.ts
│   └── routes/
│       └── index.ts
├── tests/
│   └── (post-hackathon)
├── .env.example
├── tsconfig.json
├── nodemon.json
└── package.json
```

---

## 4. Folder Structure Explanation

### 4.1 Frontend

| Folder | Purpose |
|---|---|
| `app/` | Application shell: root component, router configuration, global providers (Auth, theme) |
| `assets/` | Static media not imported as modules |
| `components/common/` | Design-system primitives reused across all features |
| `components/layout/` | Structural UI: sidebar, header, page wrappers |
| `components/{feature}/` | Feature-specific presentational components co-located by domain |
| `pages/` | Route-level page components; thin orchestrators that compose feature components |
| `hooks/` | Reusable React hooks (auth state, permissions, pagination) |
| `services/api/` | Axios-based API clients; one service file per backend module |
| `services/storage/` | Token persistence abstraction (localStorage/sessionStorage) |
| `types/` | TypeScript interfaces matching API response/request shapes |
| `schemas/` | Zod validation schemas for forms |
| `constants/` | Enums, route paths, role/permission maps — single source of truth for UI |
| `utils/` | Pure helper functions (formatting, className merging) |
| `contexts/` | React Context for global auth/session state |
| `styles/` | Global CSS and Tailwind entry |

### 4.2 Backend

| Folder | Purpose |
|---|---|
| `config/` | Environment validation, database connection, CORS, JWT settings |
| `modules/{feature}/` | Vertical slice per domain; each module owns its full stack layer |
| `middlewares/` | Cross-cutting Express middleware (auth, validation, logging, errors) |
| `utils/` | Shared utilities not tied to a single module |
| `types/` | Global TypeScript augmentations and shared type definitions |
| `routes/index.ts` | Central route registry mounting all module routers under `/api/v1` |
| `prisma/` | Database migrations and seed data for demo |

### 4.3 Module Internal Pattern (Backend)

Every backend module follows the same internal contract:

```
routes → controller → service → repository → Prisma
         ↑              ↑
    validator      business rules
    (middleware)   authorization checks
```

This consistency allows any team member to navigate unfamiliar modules instantly.

---

## 5. Coding Conventions

### 5.1 General

- **Language:** TypeScript strict mode enabled on both frontend and backend
- **Line length:** Soft limit of 100 characters
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings (except JSX attributes where double is acceptable)
- **Semicolons:** Required
- **Imports:** Absolute paths via `@/` alias; group order: external → internal → relative → types
- **Exports:** Named exports preferred; default export only for page components and `App.tsx`

### 5.2 Frontend Conventions

- **Components:** Functional components only; no class components
- **File naming:** PascalCase for components (`VehicleTable.tsx`); camelCase for hooks/utils
- **Props:** Define explicit `interface` or `type` for every component's props
- **State:** Local state for UI; Context for auth; avoid prop drilling beyond 2 levels
- **Forms:** React Hook Form + Zod resolver for all data-entry forms
- **API calls:** Never call Axios directly from pages — always go through `services/api/`
- **Styling:** Tailwind utility classes; extract repeated patterns into component variants
- **Loading/Error:** Every async page must handle loading, empty, and error states explicitly

### 5.3 Backend Conventions

- **Async:** All route handlers wrapped in `asyncHandler` to propagate errors to global handler
- **Controllers:** Thin — parse request, call service, return standardized response
- **Services:** Contain all business logic; never import Express types
- **Repositories:** Only layer that imports Prisma client; no business logic
- **Environment:** All secrets and config loaded via validated `env.ts`; never use raw `process.env` elsewhere
- **HTTP status codes:** Use semantically correct codes (201 for create, 204 for delete, etc.)
- **Idempotency:** PUT for full updates; PATCH for partial updates where applicable

### 5.4 Documentation Within Code

- JSDoc on public service methods and complex utility functions
- README per package (frontend/backend) with setup instructions
- No inline comments explaining obvious code; comments only for non-obvious business rules

---

## 6. Naming Conventions

### 6.1 Files & Directories

| Artifact | Convention | Example |
|---|---|---|
| React component file | PascalCase | `TripStatusStepper.tsx` |
| React hook file | camelCase with `use` prefix | `usePermissions.ts` |
| Backend module files | `{domain}.{layer}.ts` | `trip.service.ts` |
| Type definition files | `{domain}.types.ts` | `vehicle.types.ts` |
| Zod schema files | `{domain}.schema.ts` | `driver.schema.ts` |
| Test files | `{name}.test.ts` | `auth.service.test.ts` |
| Constants files | camelCase or descriptive | `statusEnums.ts` |

### 6.2 Variables & Functions

| Artifact | Convention | Example |
|---|---|---|
| Variables | camelCase | `vehicleCount` |
| Constants (immutable) | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Functions | camelCase, verb-first | `getVehicleById` |
| React components | PascalCase | `FuelLogForm` |
| TypeScript interfaces | PascalCase, no `I` prefix | `TripResponse` |
| Enums | PascalCase name, UPPER_SNAKE values | `TripStatus.IN_PROGRESS` |
| Database tables | snake_case plural | `fuel_logs` |
| Database columns | snake_case | `license_expiry_date` |
| API route segments | kebab-case plural nouns | `/api/v1/fuel-logs` |

### 6.3 Domain Terminology Glossary

| Term | Meaning |
|---|---|
| **Fleet** | Collective term for all registered vehicles |
| **Trip** | A scheduled or completed journey assigned to a driver and vehicle |
| **Maintenance Record** | Scheduled or unscheduled service/repair event for a vehicle |
| **Fuel Log** | Record of fuel purchase/consumption tied to a vehicle (and optionally a trip) |
| **Expense** | Financial cost entry (fuel, toll, repair, insurance, misc.) |
| **Compliance Alert** | System-generated warning (license expiry, overdue maintenance, etc.) |

---

## 7. API Naming Conventions

### 7.1 Base URL & Versioning

```
Base: /api/v1
```

All endpoints are versioned under `v1` to allow future breaking changes without disrupting clients.

### 7.2 Resource Naming Rules

| Rule | Example |
|---|---|
| Use plural nouns for collections | `/vehicles`, `/drivers`, `/trips` |
| Use kebab-case for multi-word resources | `/fuel-logs`, `/maintenance-records` |
| Nested resources express relationships | `/vehicles/:vehicleId/maintenance-records` |
| Actions that aren't CRUD use verb sub-paths | `/trips/:id/start`, `/trips/:id/complete` |
| Query params for filtering/sorting/pagination | `?status=active&page=1&limit=20&sort=-createdAt` |

### 7.3 HTTP Method Semantics

| Method | Usage |
|---|---|
| `GET` | Retrieve resource(s); never mutates state |
| `POST` | Create new resource or trigger action |
| `PUT` | Full replacement of a resource |
| `PATCH` | Partial update of a resource |
| `DELETE` | Soft-delete or hard-delete (document which) |

### 7.4 Response Envelope

All successful responses follow:

```
{
  "success": true,
  "message": "Human-readable summary",
  "data": { ... } | [ ... ],
  "meta": { pagination info when applicable }
}
```

All error responses follow:

```
{
  "success": false,
  "message": "Error summary",
  "errors": [ { "field": "email", "message": "..." } ]
}
```

---

## 8. Complete Module Breakdown

### 8.1 Authentication Module

**Purpose:** User identity management — registration (admin-only), login, token issuance, session profile retrieval, password management.

**Key Entities:** User, Role, RefreshToken (optional)

**Capabilities:**
- Email/password login with JWT issuance
- Password hashing via bcrypt
- Role assignment at user creation
- Profile retrieval for authenticated user
- Logout (client-side token discard; optional server-side token blacklist)

**Dependencies:** Users module, RBAC middleware

---

### 8.2 Dashboard Module

**Purpose:** Operational command center displaying KPIs, alerts, and recent activity aggregated across all modules.

**Key Metrics:**
- Total/active vehicles
- Drivers on duty vs. available
- Trips in progress / completed today
- Pending maintenance alerts
- Monthly fuel spend summary
- Open expense approvals

**Capabilities:**
- Role-aware widget visibility (drivers see personal stats; managers see fleet-wide)
- Quick links to critical actions
- Compliance alert feed (license expiry, overdue maintenance)

**Dependencies:** Aggregates data from vehicles, drivers, trips, maintenance, fuel, expenses

---

### 8.3 Vehicle Registry Module

**Purpose:** Central registry of all fleet vehicles with status tracking, assignment history, and document metadata.

**Key Attributes:** Registration number, make/model, year, VIN, fuel type, capacity, odometer, status (active, maintenance, retired), insurance expiry, registration expiry

**Capabilities:**
- CRUD operations on vehicles
- Status lifecycle management
- Odometer tracking
- Document expiry alerts
- Vehicle-to-driver assignment history
- Filter/search by status, type, depot

**Dependencies:** Drivers (assignment), Maintenance, Fuel Logs, Trips

---

### 8.4 Driver Management Module

**Purpose:** Manage driver profiles, licenses, certifications, availability, and vehicle assignments.

**Key Attributes:** Name, employee ID, license number, license class, license expiry, phone, email (linked to user account), status (active, on-leave, suspended)

**Capabilities:**
- CRUD operations on drivers
- License expiry tracking and alerts
- Link driver to user account for portal access
- Assign/unassign vehicle
- View driver trip history and performance summary

**Dependencies:** Users (auth account), Vehicles, Trips

---

### 8.5 Trip Management Module

**Purpose:** Plan, assign, track, and close transport trips linking drivers, vehicles, routes, and schedules.

**Key Attributes:** Trip code, origin, destination, scheduled start/end, actual start/end, assigned driver, assigned vehicle, status (scheduled, in-progress, completed, cancelled), distance, cargo/passenger count

**Capabilities:**
- Create and schedule trips
- Assign driver + vehicle (with conflict detection)
- Start/complete/cancel trip lifecycle actions
- Record actual vs. planned metrics
- Trip history and status filtering
- Driver self-service: view assigned trips, update status (driver role)

**Dependencies:** Drivers, Vehicles, Fuel Logs, Expenses

---

### 8.6 Maintenance Module

**Purpose:** Track scheduled and unscheduled vehicle maintenance to ensure fleet reliability and compliance.

**Key Attributes:** Vehicle reference, maintenance type (scheduled, repair, inspection), description, scheduled date, completed date, cost, service provider, status (pending, in-progress, completed, overdue), odometer at service

**Capabilities:**
- CRUD maintenance records
- Schedule upcoming service based on date or odometer threshold
- Mark maintenance complete (updates vehicle status)
- Overdue maintenance alerts
- Maintenance cost roll-up per vehicle

**Dependencies:** Vehicles, Expenses (optional link)

---

### 8.7 Fuel Logs Module

**Purpose:** Record fuel purchases and consumption to monitor efficiency, detect anomalies, and support cost reporting.

**Key Attributes:** Vehicle reference, trip reference (optional), date, fuel type, quantity (liters/gallons), cost, odometer reading, station/location, filled by (driver)

**Capabilities:**
- CRUD fuel log entries
- Calculate fuel efficiency (km/l or mpg) per vehicle
- Filter by vehicle, date range, driver
- Flag abnormal consumption patterns
- Aggregate fuel spend for reporting

**Dependencies:** Vehicles, Trips, Drivers, Expenses (auto-expense option)

---

### 8.8 Expense Management Module

**Purpose:** Track all fleet-related financial expenditures with categorization, approval workflow, and reporting support.

**Key Attributes:** Category (fuel, maintenance, toll, insurance, fine, misc.), amount, currency, date, vehicle reference, trip reference, description, receipt reference, status (pending, approved, rejected), submitted by, approved by

**Capabilities:**
- CRUD expense entries
- Approval workflow (submit → approve/reject)
- Category-based filtering and totals
- Link expenses to vehicles/trips/maintenance records
- Export-ready data for financial reports

**Dependencies:** Vehicles, Trips, Maintenance, Fuel Logs, Users (approval actors)

---

### 8.9 Reports Module

**Purpose:** Generate structured, filterable reports for operational and financial stakeholders.

**Report Types:**
- Fleet utilization report
- Trip summary report
- Maintenance history report
- Fuel consumption report
- Expense summary report
- Driver activity report
- Compliance report (expiring licenses, overdue maintenance)

**Capabilities:**
- Date-range and entity filters
- Tabular data export (CSV — if time permits)
- Role-scoped data visibility
- Pre-built report templates

**Dependencies:** All data modules (read-only aggregation)

---

### 8.10 Analytics Module

**Purpose:** Visual data insights via charts and trend analysis for strategic decision-making.

**Analytics Views:**
- Fleet utilization over time
- Fuel cost trends
- Expense breakdown by category
- Maintenance cost trends
- Trip completion rates
- Top-performing vs. underutilized vehicles

**Capabilities:**
- Time-series aggregations
- Comparison periods (month-over-month)
- Chart-ready JSON payloads for Recharts frontend
- Role-scoped analytics (Financial Analyst sees cost focus; Safety Officer sees compliance focus)

**Dependencies:** Reports module data; direct repository aggregations

---

## 9. Role-Based Access Control

### 9.1 RBAC Model

TransitOps implements **Role-Based Access Control** with five predefined roles. Permissions are mapped to roles and enforced at the **API middleware layer**. The frontend mirrors permissions for UX (hide/disable actions) but never relies on UI alone for security.

```
User ──has──→ Role ──grants──→ Permissions ──guard──→ API Endpoints + UI Actions
```

### 9.2 Role Definitions & Responsibilities

#### Admin

**Responsibility:** Full system governance. Manages users, roles, and global configuration.

| Capability Area | Access Level |
|---|---|
| User management | Full CRUD |
| All fleet modules | Full CRUD |
| Reports & Analytics | Full access |
| Expense approval | Full |
| System settings | Full |

**Typical Actions:** Create user accounts, assign roles, deactivate users, view audit logs, override approvals.

---

#### Fleet Manager

**Responsibility:** Day-to-day fleet operations — vehicles, drivers, trips, and maintenance scheduling.

| Capability Area | Access Level |
|---|---|
| Vehicles | Full CRUD |
| Drivers | Full CRUD |
| Trips | Full CRUD + lifecycle actions |
| Maintenance | Full CRUD |
| Fuel Logs | Create, read, update |
| Expenses | Create, read; submit for approval |
| Reports | Operational reports |
| Analytics | Fleet utilization, trip metrics |
| User management | None |

**Typical Actions:** Register new vehicles, schedule trips, assign drivers, plan maintenance, monitor fleet KPIs on dashboard.

---

#### Driver

**Responsibility:** Execute assigned trips and log operational data relevant to their work.

| Capability Area | Access Level |
|---|---|
| Own profile | Read, limited update (phone, etc.) |
| Assigned trips | Read; start/complete own trips |
| Fuel Logs | Create for assigned vehicle; read own |
| Expenses | Create (submit toll/misc.); read own |
| Vehicles | Read assigned vehicle only |
| Maintenance | Read for assigned vehicle |
| Dashboard | Personal stats widget |
| Reports/Analytics | None |

**Typical Actions:** View today's trips, mark trip started/completed, log fuel after refueling, submit expense claims.

---

#### Safety Officer

**Responsibility:** Compliance, safety audits, license tracking, maintenance compliance, incident oversight.

| Capability Area | Access Level |
|---|---|
| Vehicles | Read; update compliance fields |
| Drivers | Read; flag/suspend; license tracking |
| Trips | Read all; audit trail |
| Maintenance | Read; create inspection records |
| Fuel Logs | Read (anomaly review) |
| Expenses | Read |
| Reports | Compliance & safety reports |
| Analytics | Compliance dashboards |
| User management | None |

**Typical Actions:** Review expiring licenses, flag overdue maintenance, generate compliance reports, audit trip records.

---

#### Financial Analyst

**Responsibility:** Financial oversight — expense approval, cost analysis, budget tracking.

| Capability Area | Access Level |
|---|---|
| Expenses | Full read; approve/reject |
| Fuel Logs | Read all |
| Maintenance | Read (cost fields) |
| Trips | Read (cost-related) |
| Vehicles | Read |
| Drivers | Read |
| Reports | Financial reports |
| Analytics | Cost/expense analytics |
| Operational CRUD | None |

**Typical Actions:** Approve/reject expenses, analyze fuel spend trends, export expense summaries, review maintenance costs.

---

### 9.3 Permission Matrix (Summary)

| Module / Action | Admin | Fleet Mgr | Driver | Safety Off. | Fin. Analyst |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| CRUD vehicles | ✅ | ✅ | ❌ | Read | Read |
| CRUD drivers | ✅ | ✅ | Own | Read/Flag | Read |
| CRUD trips | ✅ | ✅ | Own lifecycle | Read | Read |
| CRUD maintenance | ✅ | ✅ | Read | Create/Read | Read |
| CRUD fuel logs | ✅ | ✅ | Create/Read own | Read | Read |
| CRUD expenses | ✅ | Create | Create own | Read | Approve |
| Reports | All | Operational | ❌ | Compliance | Financial |
| Analytics | All | Fleet | ❌ | Compliance | Financial |
| Dashboard | Full | Fleet | Personal | Compliance | Financial |

---

## 10. Database Modules

> **Note:** Table names listed below describe the logical data model. Prisma schema and SQL are intentionally excluded from this document per scope constraints.

### 10.1 Core / Identity

| Table | Purpose |
|---|---|
| `users` | Application login accounts with email, hashed password, status, and last login timestamp |
| `roles` | Enum-like reference table for the five system roles (Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst) |
| `user_roles` | Junction table linking users to one or more roles (typically one role per user in hackathon scope) |
| `refresh_tokens` | Optional stored refresh tokens for extended sessions with expiry and revocation support |

### 10.2 Fleet

| Table | Purpose |
|---|---|
| `vehicles` | Master vehicle registry with identification, specifications, status, and odometer |
| `vehicle_documents` | Metadata for vehicle-related documents (insurance, registration) with expiry dates |
| `vehicle_assignments` | Historical record of which driver was assigned to which vehicle and when |

### 10.3 Personnel

| Table | Purpose |
|---|---|
| `drivers` | Driver profile linked to a user account; stores license info, contact, and employment status |
| `driver_certifications` | Optional additional certifications (hazmat, defensive driving) with expiry tracking |

### 10.4 Operations

| Table | Purpose |
|---|---|
| `trips` | Trip records with route, schedule, assignment, status lifecycle, and distance metrics |
| `trip_status_history` | Audit log of trip status transitions with timestamp and actor |
| `maintenance_records` | Vehicle maintenance events with type, schedule, cost, and completion status |
| `fuel_logs` | Fuel purchase/consumption entries tied to vehicles and optionally trips |

### 10.5 Finance

| Table | Purpose |
|---|---|
| `expenses` | Financial expenditure records with category, amount, approval status, and references |
| `expense_categories` | Reference table for standardized expense categories |
| `expense_approvals` | Approval action history (who approved/rejected, when, notes) |

### 10.6 System / Audit

| Table | Purpose |
|---|---|
| `audit_logs` | System-wide audit trail for sensitive mutations (who did what, when, on which entity) |
| `notifications` | In-app alerts for compliance events, approvals, and trip assignments |
| `system_settings` | Key-value configuration store for application-level settings |

### 10.7 Entity Relationship Overview

```
users ──1:1── drivers
users ──M:N── roles (via user_roles)

vehicles ──1:N── vehicle_documents
vehicles ──1:N── vehicle_assignments ──N:1── drivers
vehicles ──1:N── maintenance_records
vehicles ──1:N── fuel_logs
vehicles ──1:N── expenses

drivers ──1:N── trips
vehicles ──1:N── trips
trips ──1:N── trip_status_history
trips ──0:N── fuel_logs
trips ──0:N── expenses

expenses ──N:1── expense_categories
expenses ──1:N── expense_approvals
```

---

## 11. API Modules

> Endpoint names only. Base prefix: `/api/v1`

### 11.1 Authentication

| Method | Endpoint |
|---|---|
| POST | `/auth/login` |
| POST | `/auth/logout` |
| POST | `/auth/refresh-token` |
| GET | `/auth/me` |
| PATCH | `/auth/change-password` |

### 11.2 Users (Admin)

| Method | Endpoint |
|---|---|
| GET | `/users` |
| POST | `/users` |
| GET | `/users/:id` |
| PATCH | `/users/:id` |
| DELETE | `/users/:id` |
| PATCH | `/users/:id/role` |
| PATCH | `/users/:id/status` |

### 11.3 Dashboard

| Method | Endpoint |
|---|---|
| GET | `/dashboard/summary` |
| GET | `/dashboard/alerts` |
| GET | `/dashboard/recent-activity` |

### 11.4 Vehicles

| Method | Endpoint |
|---|---|
| GET | `/vehicles` |
| POST | `/vehicles` |
| GET | `/vehicles/:id` |
| PUT | `/vehicles/:id` |
| PATCH | `/vehicles/:id` |
| DELETE | `/vehicles/:id` |
| GET | `/vehicles/:id/documents` |
| POST | `/vehicles/:id/documents` |
| GET | `/vehicles/:id/assignments` |
| POST | `/vehicles/:id/assignments` |
| GET | `/vehicles/:id/maintenance-records` |
| GET | `/vehicles/:id/fuel-logs` |
| GET | `/vehicles/:id/trips` |

### 11.5 Drivers

| Method | Endpoint |
|---|---|
| GET | `/drivers` |
| POST | `/drivers` |
| GET | `/drivers/:id` |
| PUT | `/drivers/:id` |
| PATCH | `/drivers/:id` |
| DELETE | `/drivers/:id` |
| GET | `/drivers/:id/trips` |
| GET | `/drivers/:id/fuel-logs` |
| PATCH | `/drivers/:id/status` |
| GET | `/drivers/expiring-licenses` |

### 11.6 Trips

| Method | Endpoint |
|---|---|
| GET | `/trips` |
| POST | `/trips` |
| GET | `/trips/:id` |
| PUT | `/trips/:id` |
| PATCH | `/trips/:id` |
| DELETE | `/trips/:id` |
| POST | `/trips/:id/start` |
| POST | `/trips/:id/complete` |
| POST | `/trips/:id/cancel` |
| GET | `/trips/:id/status-history` |

### 11.7 Maintenance

| Method | Endpoint |
|---|---|
| GET | `/maintenance-records` |
| POST | `/maintenance-records` |
| GET | `/maintenance-records/:id` |
| PUT | `/maintenance-records/:id` |
| PATCH | `/maintenance-records/:id` |
| DELETE | `/maintenance-records/:id` |
| PATCH | `/maintenance-records/:id/complete` |
| GET | `/maintenance-records/overdue` |

### 11.8 Fuel Logs

| Method | Endpoint |
|---|---|
| GET | `/fuel-logs` |
| POST | `/fuel-logs` |
| GET | `/fuel-logs/:id` |
| PUT | `/fuel-logs/:id` |
| PATCH | `/fuel-logs/:id` |
| DELETE | `/fuel-logs/:id` |
| GET | `/fuel-logs/efficiency/:vehicleId` |

### 11.9 Expenses

| Method | Endpoint |
|---|---|
| GET | `/expenses` |
| POST | `/expenses` |
| GET | `/expenses/:id` |
| PUT | `/expenses/:id` |
| PATCH | `/expenses/:id` |
| DELETE | `/expenses/:id` |
| POST | `/expenses/:id/submit` |
| POST | `/expenses/:id/approve` |
| POST | `/expenses/:id/reject` |
| GET | `/expense-categories` |

### 11.10 Reports

| Method | Endpoint |
|---|---|
| GET | `/reports/fleet-utilization` |
| GET | `/reports/trip-summary` |
| GET | `/reports/maintenance-history` |
| GET | `/reports/fuel-consumption` |
| GET | `/reports/expense-summary` |
| GET | `/reports/driver-activity` |
| GET | `/reports/compliance` |

### 11.11 Analytics

| Method | Endpoint |
|---|---|
| GET | `/analytics/fleet-utilization` |
| GET | `/analytics/fuel-trends` |
| GET | `/analytics/expense-breakdown` |
| GET | `/analytics/maintenance-costs` |
| GET | `/analytics/trip-completion-rates` |
| GET | `/analytics/vehicle-performance` |

---

## 12. Frontend Pages & Components

### 12.1 Pages

| Page | Route | Access Roles |
|---|---|---|
| Login | `/login` | Public |
| Unauthorized | `/unauthorized` | Authenticated |
| Dashboard | `/dashboard` | All authenticated |
| Vehicle List | `/vehicles` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| Vehicle Detail | `/vehicles/:id` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| Vehicle Create/Edit | `/vehicles/new`, `/vehicles/:id/edit` | Admin, Fleet Manager |
| Driver List | `/drivers` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| Driver Detail | `/drivers/:id` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| Driver Create/Edit | `/drivers/new`, `/drivers/:id/edit` | Admin, Fleet Manager |
| Trip List | `/trips` | All authenticated (scoped) |
| Trip Detail | `/trips/:id` | All authenticated (scoped) |
| Trip Create/Edit | `/trips/new`, `/trips/:id/edit` | Admin, Fleet Manager |
| Maintenance List | `/maintenance` | Admin, Fleet Manager, Safety Officer |
| Maintenance Create/Edit | `/maintenance/new`, `/maintenance/:id/edit` | Admin, Fleet Manager, Safety Officer |
| Fuel Log List | `/fuel-logs` | Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst |
| Fuel Log Create/Edit | `/fuel-logs/new`, `/fuel-logs/:id/edit` | Admin, Fleet Manager, Driver |
| Expense List | `/expenses` | All authenticated (scoped) |
| Expense Create/Edit | `/expenses/new`, `/expenses/:id/edit` | Admin, Fleet Manager, Driver |
| Reports | `/reports` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| Analytics | `/analytics` | Admin, Fleet Manager, Safety Officer, Financial Analyst |
| User Management | `/users` | Admin |
| Not Found | `*` | Public |

### 12.2 Reusable Components

#### Layout & Navigation
- `AppLayout` — Main shell with sidebar + content area
- `Sidebar` — Role-aware navigation menu
- `Header` — Top bar with user menu and notifications
- `PageHeader` — Page title, breadcrumbs, and action buttons
- `ProtectedRoute` — Route guard checking auth + role

#### Common / Design System
- `Button` — Primary, secondary, danger, ghost variants
- `Input` — Text input with label and error display
- `Select` — Dropdown with search
- `Textarea` — Multi-line input
- `DatePicker` — Date selection
- `Modal` — Dialog overlay
- `Table` — Sortable data table with column config
- `Pagination` — Page navigation controls
- `Badge` — Status and category labels
- `Card` — Content container with optional header/footer
- `Spinner` — Loading indicator
- `EmptyState` — No-data placeholder with optional action
- `ConfirmDialog` — Destructive action confirmation
- `Toast` / `AlertBanner` — Feedback notifications
- `SearchBar` — Debounced search input
- `FilterPanel` — Collapsible filter controls
- `StatCard` — KPI metric display
- `Tabs` — Tabbed content navigation
- `DropdownMenu` — Context/action menu
- `Avatar` — User/driver avatar placeholder
- `Tooltip` — Hover information

#### Feature-Specific
- `LoginForm`
- `KpiCard`, `RecentTripsWidget`, `AlertsWidget`
- `VehicleTable`, `VehicleForm`, `VehicleStatusBadge`, `VehicleDetailPanel`
- `DriverTable`, `DriverForm`, `LicenseExpiryAlert`, `DriverDetailPanel`
- `TripTable`, `TripForm`, `TripStatusStepper`, `TripTimeline`
- `MaintenanceTable`, `MaintenanceForm`, `MaintenanceStatusBadge`
- `FuelLogTable`, `FuelLogForm`, `FuelEfficiencyIndicator`
- `ExpenseTable`, `ExpenseForm`, `ExpenseApprovalActions`, `ExpenseStatusBadge`
- `ReportFilters`, `ReportTable`
- `FleetUtilizationChart`, `FuelTrendChart`, `ExpenseBreakdownChart`, `MaintenanceCostChart`, `TripCompletionChart`
- `RoleGuard` — Conditional render based on permission
- `NotificationBell` — Alert indicator in header

---

## 13. Backend Architecture Layers

### 13.1 Routes

**Responsibility:** Define HTTP endpoints, attach middleware chain, delegate to controllers.

- One router file per module (`vehicle.routes.ts`)
- Mount under `/api/v1/{resource}` in central `routes/index.ts`
- Apply `authenticate` and `authorize` middleware at route-group level where possible
- Apply `validate` middleware with Zod schema before controller

**Flow:** `HTTP Request → Route → Middleware Chain → Controller`

---

### 13.2 Controllers

**Responsibility:** HTTP adapter layer — extract request data, invoke service, format response.

- No business logic
- No direct database access
- Uses `asyncHandler` wrapper
- Returns `ApiResponse` utility for consistent shape
- Maps service errors to appropriate HTTP exceptions via `ApiError`

---

### 13.3 Services

**Responsibility:** Business logic orchestration — the heart of the application.

- Validates business rules (e.g., cannot assign retired vehicle to trip)
- Coordinates across repositories when operations span entities
- Enforces role-scoped data access at logic level (e.g., driver sees only own trips)
- Throws domain-specific `ApiError` instances with meaningful messages
- Independent of Express — testable in isolation

---

### 13.4 Repositories

**Responsibility:** Data access abstraction over Prisma ORM.

- Single responsibility: CRUD and query operations for one aggregate
- Accepts typed filter/sort/pagination parameters
- Returns plain data objects (no Express response formatting)
- Handles soft-delete filtering where applicable
- No business rule validation

---

### 13.5 Middlewares

| Middleware | Purpose |
|---|---|
| `authenticate` | Verify JWT, attach `req.user` payload |
| `authorize(roles[])` | Check user role against allowed roles for route |
| `validate(schema)` | Parse and validate request body/params/query via Zod |
| `requestLogger` | Log method, path, status, duration |
| `errorHandler` | Catch all errors; format standardized error response |
| `notFound` | Handle unmatched routes with 404 |

---

### 13.6 Validators

**Responsibility:** Zod schema definitions for request validation per module.

- Separate files per module (`trip.validator.ts`)
- Schemas for: create body, update body, query params, route params
- Exported schema objects consumed by `validate` middleware
- Mirror frontend Zod schemas conceptually (field names and rules aligned)

---

### 13.7 Utils

| Utility | Purpose |
|---|---|
| `ApiError` | Custom error class with statusCode and message |
| `ApiResponse` | Standardized success response builder |
| `asyncHandler` | Wraps async route handlers for error propagation |
| `password.util` | Bcrypt hash and compare wrappers |
| `jwt.util` | Sign and verify JWT tokens |
| `pagination.util` | Parse page/limit/sort from query; build meta object |

---

### 13.8 Config

| Config File | Purpose |
|---|---|
| `env.ts` | Validate and export environment variables (port, DB URL, JWT secret, bcrypt rounds) |
| `database.ts` | Prisma client singleton with connection lifecycle |
| `cors.ts` | CORS origin and credentials configuration |
| `jwt.ts` | JWT expiry durations and algorithm settings |

---

## 14. Validation Strategy

### 14.1 Layered Validation Model

```
┌─────────────────────────────────────────────┐
│  Layer 1: Frontend (React Hook Form + Zod)  │  → Immediate UX feedback
├─────────────────────────────────────────────┤
│  Layer 2: Backend Middleware (Zod)          │  → Request shape & type enforcement
├─────────────────────────────────────────────┤
│  Layer 3: Service Layer (Business Rules)    │  → Domain integrity (conflicts, state)
├─────────────────────────────────────────────┤
│  Layer 4: Database (Constraints)            │  → Uniqueness, FK integrity, NOT NULL
└─────────────────────────────────────────────┘
```

### 14.2 Frontend Validation

- Every form uses React Hook Form with `zodResolver`
- Schemas live in `src/schemas/{module}.schema.ts`
- Display field-level errors inline below inputs
- Disable submit button while form is invalid or submitting
- Client-side validation covers: required fields, formats (email, date), min/max, enums

### 14.3 Backend Validation

- Zod schemas in `{module}.validator.ts` for every mutating endpoint
- `validate` middleware runs before controller
- Returns 400 with field-level error array on failure
- Service layer validates cross-entity rules (e.g., vehicle not already on active trip)

### 14.4 Shared Validation Rules

| Field Type | Rules |
|---|---|
| Email | Valid format, lowercase normalized |
| Password | Min 8 chars, at least one uppercase + number |
| Dates | ISO 8601; end date must be after start date |
| Currency amounts | Positive decimal, max 2 decimal places |
| Odometer | Non-negative integer; must be ≥ previous reading |
| Enums | Must match defined status/type values |
| Pagination | page ≥ 1, limit 1–100 |

---

## 15. Error Handling Strategy

### 15.1 Error Classification

| Category | HTTP Status | Example |
|---|---|---|
| Validation Error | 400 | Missing required field, invalid email |
| Authentication Error | 401 | Missing/expired JWT |
| Authorization Error | 403 | Driver accessing admin endpoint |
| Not Found | 404 | Vehicle ID does not exist |
| Conflict | 409 | Duplicate registration number |
| Business Rule Violation | 422 | Assigning vehicle already on active trip |
| Internal Server Error | 500 | Unhandled exception |

### 15.2 Backend Error Flow

1. Service/repository throws `ApiError` with status code and message
2. Unhandled errors caught by `asyncHandler` and forwarded to `errorHandler`
3. `errorHandler` middleware formats consistent JSON response
4. 500 errors log full stack trace server-side; client receives generic message
5. Prisma errors mapped to appropriate HTTP codes (P2002 → 409, P2025 → 404)

### 15.3 Frontend Error Handling

- Axios response interceptor catches API errors globally
- 401 → redirect to login, clear token
- 403 → redirect to `/unauthorized`
- 4xx → display error message via toast or inline form errors
- 5xx → generic "Something went wrong" with retry option
- React Error Boundary wraps app shell for unhandled render errors

### 15.4 Error Response Contract

All errors return:

```
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    { "field": "registrationNumber", "message": "Already exists" }
  ]
}
```

---

## 16. Logging Strategy

### 16.1 Backend Logging

| Log Type | Content | Level |
|---|---|---|
| Request Log | Method, URL, status, response time, user ID | INFO |
| Auth Log | Login success/failure, token refresh | INFO / WARN |
| Business Log | Trip started, expense approved, maintenance completed | INFO |
| Error Log | Stack trace, request context, user ID | ERROR |
| Audit Log | Entity type, action, actor, before/after snapshot | INFO (persisted to DB) |

**Implementation (hackathon scope):**
- `requestLogger` middleware using structured JSON to stdout
- Critical business events written to `audit_logs` table
- No external log aggregator required for demo; design supports future integration with ELK/Datadog

### 16.2 Frontend Logging

- Console errors in development only
- API failure messages surfaced to user via toast
- No sensitive data logged client-side

### 16.3 Log Format (Structured)

```
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "module": "trip",
  "action": "trip.started",
  "userId": "uuid",
  "metadata": { "tripId": "uuid" }
}
```

---

## 17. Security Strategy

### 17.1 Authentication Security

- Passwords hashed with bcrypt (minimum 10 salt rounds)
- JWT signed with strong secret (min 256-bit); short-lived access tokens (15–60 min)
- Tokens transmitted via `Authorization: Bearer` header only
- No sensitive data encoded in JWT payload (only user ID, email, role)

### 17.2 Authorization Security

- Every protected route requires `authenticate` middleware
- Role checks via `authorize` middleware — never trust client-sent role
- Resource-level scoping in services (driver can only access own trips)
- Admin actions logged to audit trail

### 17.3 Input Security

- All inputs validated via Zod before processing
- Prisma parameterized queries prevent SQL injection
- Request body size limit configured on Express
- No raw HTML rendering of user input (XSS prevention)

### 17.4 Transport & Headers

- CORS restricted to frontend origin
- Helmet middleware for security headers (X-Content-Type-Options, X-Frame-Options)
- HTTPS in production; HTTP acceptable for local hackathon dev

### 17.5 Data Security

- Soft-delete on core entities (vehicles, drivers) to preserve audit history
- Environment variables for all secrets; `.env` in `.gitignore`
- No passwords or tokens in API responses or logs

### 17.6 Rate Limiting (Stretch Goal)

- Login endpoint rate-limited to prevent brute force
- General API rate limit per IP (optional for hackathon)

---

## 18. Authentication Flow

### 18.1 Login Flow

```
┌────────┐    POST /auth/login     ┌─────────┐    verify bcrypt    ┌──────────┐
│ Client │ ─────────────────────→ │ Auth    │ ──────────────────→ │ Database │
│        │   { email, password }  │ Service │                     │ (users)  │
│        │ ←───────────────────── │         │ ←────────────────── │          │
│        │   { accessToken, user }  └─────────┘    user + role       └──────────┘
└────────┘
     │
     ▼
 Store accessToken (localStorage via tokenStorage)
 Set AuthContext user state
 Redirect to /dashboard
```

### 18.2 Authenticated Request Flow

```
Client Request
     │
     ▼
Axios Interceptor ── attaches Authorization: Bearer {token}
     │
     ▼
authenticate middleware ── verifies JWT signature + expiry
     │                        │
     │ valid                  │ invalid/expired
     ▼                        ▼
authorize middleware      401 Unauthorized
     │
     ▼
Controller → Service → Repository → Response
```

### 18.3 Token Lifecycle

| Event | Action |
|---|---|
| Login success | Issue access token; store client-side |
| API request | Interceptor attaches token |
| Token expired | 401 response → client clears token → redirect to login |
| Logout | Client clears token; optional POST `/auth/logout` |
| Password change | Optionally invalidate existing tokens |

### 18.4 Role Resolution at Login

1. Authenticate credentials
2. Fetch user with role(s) from `user_roles` join
3. Embed role in JWT payload
4. Frontend reads role from token/context to gate UI
5. Backend re-validates role from DB on each request (or trusts signed JWT role claim)

---

## 19. Folder Dependency Rules

### 19.1 Frontend Dependency Direction

```
pages → components → hooks/services → types/schemas/constants → utils
```

| Rule | Description |
|---|---|
| Pages import components, hooks, services | Pages never imported by components |
| Components import other components, hooks, utils | Feature components don't import pages |
| Services import axiosClient, types | Services never import components or pages |
| Hooks import services, contexts | Hooks never import pages |
| Contexts import services, types | Contexts never import pages |
| Utils are leaf nodes | Utils import nothing from app layers |
| No circular imports | Enforced via ESLint import rules |

### 19.2 Backend Dependency Direction

```
routes → controllers → services → repositories → Prisma
          ↑              ↑
     middlewares     validators
          ↑
        utils, config
```

| Rule | Description |
|---|---|
| Routes import controllers, middlewares, validators | Routes never import repositories |
| Controllers import services, utils | Controllers never import Prisma |
| Services import repositories, utils, other services | Services never import Express types |
| Repositories import Prisma client only | Repositories never import services |
| Middlewares import utils, config | Middlewares never import controllers |
| Validators are standalone Zod schemas | No upward imports |
| Config is imported by app entry and middlewares | Config imports nothing from modules |
| Modules must not cross-import repositories | Cross-module access goes through services |

### 19.3 Cross-Module Communication (Backend)

When Trip module needs Vehicle data:
- ✅ Trip Service → Vehicle Service → Vehicle Repository
- ❌ Trip Repository → Vehicle Repository (direct)

---

## 20. Git Branch Strategy (Team of 2)

### 20.1 Branch Model

```
main (protected, demo-ready)
  └── develop (integration branch)
        ├── feature/auth-setup
        ├── feature/vehicle-module
        ├── feature/trip-module
        └── fix/login-validation
```

### 20.2 Branch Naming

| Prefix | Usage | Example |
|---|---|---|
| `feature/` | New functionality | `feature/expense-approval` |
| `fix/` | Bug fixes | `fix/trip-status-update` |
| `chore/` | Tooling, config | `chore/eslint-setup` |

### 20.3 Workflow for 2 Developers

| Developer | Primary Ownership | Secondary |
|---|---|---|
| **Dev A** | Backend (API, Prisma, auth, services) | Frontend integration |
| **Dev B** | Frontend (pages, components, charts) | API contract review |

**Rules:**
1. Never commit directly to `main`
2. Branch from `develop` for every task
3. Keep branches short-lived (< 2 hours in hackathon)
4. Pull `develop` before starting new branch
5. Merge to `develop` via PR (even with 2 people — forces review)
6. Merge `develop` → `main` only at demo checkpoints (hour 4, hour 7)
7. Resolve conflicts in the developer's own branch before merging

### 20.4 Commit Message Convention

```
type(scope): short description

feat(auth): add JWT login endpoint
fix(trips): prevent double-assignment of vehicle
chore(deps): add zod and bcrypt packages
docs(readme): add setup instructions
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`

### 20.5 Hackathon Git Checkpoints

| Hour | Action |
|---|---|
| 0:30 | Initial commit: project scaffolding on `develop` |
| 2:00 | Merge auth + layout to `develop` |
| 4:00 | Merge `develop` → `main` (midpoint demo) |
| 6:00 | Merge remaining modules to `develop` |
| 7:30 | Final merge `develop` → `main` |
| 8:00 | Tag release: `v1.0.0-demo` |

---

## 21. Hourly Development Roadmap (8 Hours)

### Hour 0 – Project Setup & Architecture (0:00 – 0:45)

| Task | Owner | Deliverable |
|---|---|---|
| Initialize frontend (Vite + React + TS + Tailwind) | Dev B | Running dev server |
| Initialize backend (Express + TS + Prisma) | Dev A | Running API server |
| Configure ESLint, path aliases, env files | Both | `.env.example` files |
| Create folder structures per this document | Both | Scaffolded directories |
| Define shared API contract (endpoint list) | Both | Agreed interface |
| PostgreSQL database running locally | Dev A | Connected Prisma |

### Hour 1 – Authentication & Core Layout (0:45 – 1:45)

| Task | Owner | Deliverable |
|---|---|---|
| Prisma schema: users, roles, user_roles | Dev A | Migration applied |
| Auth module: login, me, JWT middleware | Dev A | Working `/auth/login` |
| Seed script: admin + sample roles/users | Dev A | Demo accounts |
| Login page + AuthContext + ProtectedRoute | Dev B | Login flow working |
| AppLayout: Sidebar, Header, routing skeleton | Dev B | Navigable shell |
| Axios client with auth interceptor | Dev B | Token attachment |

### Hour 2 – Vehicle & Driver Modules (1:45 – 2:45)

| Task | Owner | Deliverable |
|---|---|---|
| Vehicle CRUD API (full stack) | Dev A | 5 vehicle endpoints |
| Driver CRUD API (full stack) | Dev A | 5 driver endpoints |
| RBAC middleware on routes | Dev A | Role enforcement |
| Vehicle list + create/edit pages | Dev B | Working vehicle UI |
| Driver list + create/edit pages | Dev B | Working driver UI |
| Common Table, Form, Badge components | Dev B | Reusable primitives |

### Hour 3 – Trip Management (2:45 – 3:45)

| Task | Owner | Deliverable |
|---|---|---|
| Trip CRUD + lifecycle API (start/complete/cancel) | Dev A | Trip endpoints |
| Trip-driver-vehicle assignment validation | Dev A | Conflict detection |
| Trip list + detail + create/edit pages | Dev B | Trip UI |
| TripStatusStepper component | Dev B | Visual status flow |
| Driver-scoped trip view | Both | Driver role demo path |

### Hour 4 – Midpoint Integration & Dashboard (3:45 – 4:45)

| Task | Owner | Deliverable |
|---|---|---|
| Dashboard summary API (aggregated KPIs) | Dev A | `/dashboard/summary` |
| Dashboard alerts API | Dev A | `/dashboard/alerts` |
| Dashboard page with KPI cards + widgets | Dev B | Role-aware dashboard |
| Merge to `main` — midpoint demo | Both | Stable checkpoint |
| Bug fixes from integration testing | Both | Clean demo path |

### Hour 5 – Maintenance & Fuel Logs (4:45 – 5:45)

| Task | Owner | Deliverable |
|---|---|---|
| Maintenance CRUD API + overdue query | Dev A | Maintenance endpoints |
| Fuel log CRUD API + efficiency calc | Dev A | Fuel endpoints |
| Maintenance list + form pages | Dev B | Maintenance UI |
| Fuel log list + form pages | Dev B | Fuel UI |
| Vehicle detail tabs (maintenance, fuel history) | Dev B | Nested views |

### Hour 6 – Expense Management (5:45 – 6:45)

| Task | Owner | Deliverable |
|---|---|---|
| Expense CRUD + approval workflow API | Dev A | Expense + approve/reject |
| Expense categories seed data | Dev A | Reference data |
| Expense list + form + approval UI | Dev B | Financial Analyst flow |
| ExpenseStatusBadge + approval actions | Dev B | Workflow UI |
| RBAC: Financial Analyst approval path | Both | End-to-end approval demo |

### Hour 7 – Reports, Analytics & Polish (6:45 – 7:45)

| Task | Owner | Deliverable |
|---|---|---|
| Report aggregation endpoints (top 3 reports) | Dev A | Report APIs |
| Analytics endpoints (3 chart payloads) | Dev A | Analytics APIs |
| Reports page with filters | Dev B | Report UI |
| Analytics page with Recharts | Dev B | 3 working charts |
| Error handling, loading states, empty states | Both | Polished UX |
| Seed demo data (vehicles, trips, expenses) | Dev A | Rich demo dataset |

### Hour 8 – Demo Prep & Presentation (7:45 – 8:00)

| Task | Owner | Deliverable |
|---|---|---|
| Final merge to `main`, tag release | Both | `v1.0.0-demo` |
| Demo script rehearsal (3 roles, 3 flows) | Both | Presentation ready |
| README with setup instructions | Both | Documentation |
| Fix any last-minute blockers | Both | Stable demo |

---

## 22. Priority Order of Implementation

### Tier 1 — Must Have (Demo Blockers)

| Priority | Module | Rationale |
|---|---|---|
| P0 | Project scaffolding + DB connection | Foundation |
| P0 | Authentication + RBAC | Gates everything |
| P0 | App layout + routing | Navigation shell |
| P1 | Vehicle Registry | Core fleet entity |
| P1 | Driver Management | Required for trip assignment |
| P1 | Trip Management | Core business workflow |
| P1 | Dashboard (basic KPIs) | First impression for judges |

### Tier 2 — Should Have (Strong Demo)

| Priority | Module | Rationale |
|---|---|---|
| P2 | Maintenance | Fleet reliability story |
| P2 | Fuel Logs | Operational cost tracking |
| P2 | Expense Management + Approval | Financial workflow demo |
| P2 | Role-specific views (Driver, Financial Analyst) | RBAC showcase |

### Tier 3 — Nice to Have (Differentiators)

| Priority | Module | Rationale |
|---|---|---|
| P3 | Reports (top 3) | Data export credibility |
| P3 | Analytics charts (3) | Visual impact for judges |
| P3 | Compliance alerts | Safety Officer role demo |
| P3 | Audit logs | Enterprise maturity signal |

### Tier 4 — Stretch Goals

| Priority | Module | Rationale |
|---|---|---|
| P4 | Refresh tokens | Better auth UX |
| P4 | CSV export | Report utility |
| P4 | Notifications bell | Real-time feel |
| P4 | Dark mode | UI polish |

### Implementation Dependency Graph

```
Auth + RBAC
    ├── Vehicles
    │     ├── Maintenance
    │     └── Fuel Logs
    ├── Drivers
    │     └── Trips (requires Vehicles + Drivers)
    │           ├── Fuel Logs (optional link)
    │           └── Expenses (optional link)
    ├── Expenses (requires Vehicles; links to Trips/Maintenance)
    ├── Dashboard (requires all Tier 1 + partial Tier 2)
    ├── Reports (requires Tier 2 data)
    └── Analytics (requires Reports aggregations)
```

---

## 23. Future Scalability Suggestions

### 23.1 Short-Term (Post-Hackathon)

| Area | Suggestion |
|---|---|
| **Testing** | Unit tests for services; integration tests for auth and trip lifecycle |
| **API Documentation** | OpenAPI/Swagger auto-generated from route definitions |
| **Refresh Tokens** | HttpOnly cookie-based refresh for improved security |
| **File Uploads** | Receipt images for expenses; document scans for vehicles |
| **Email Notifications** | License expiry and maintenance reminders via email |

### 23.2 Medium-Term (Production Readiness)

| Area | Suggestion |
|---|---|
| **Microservices Split** | Extract analytics/reporting into read-replica service |
| **Event-Driven Architecture** | Trip completion events trigger expense auto-creation, notifications |
| **Caching Layer** | Redis for dashboard KPIs and session management |
| **Background Jobs** | Bull/BullMQ for overdue maintenance scans, report generation |
| **Multi-Tenancy** | Organization/depot-level data isolation for SaaS model |
| **Mobile App** | React Native driver app for trip updates and fuel logging |
| **GPS Integration** | Real-time vehicle tracking via telematics API |
| **CI/CD Pipeline** | GitHub Actions for lint, test, build, deploy |

### 23.3 Long-Term (Enterprise Scale)

| Area | Suggestion |
|---|---|
| **Odoo ERP Integration** | Sync expenses, invoices, and HR data with Odoo modules |
| **Data Warehouse** | ETL pipeline to analytics warehouse for BI dashboards |
| **AI/ML** | Predictive maintenance based on odometer and usage patterns |
| **Geofencing** | Automated trip start/complete based on location |
| **Multi-Region Deployment** | Database sharding by geography |
| **SSO/SAML** | Enterprise identity provider integration |
| **Audit Compliance** | SOC 2 / ISO 27001 aligned logging and access controls |

### 23.4 Architecture Evolution Path

```
Hackathon: Modular Monolith (single Express app)
    ↓
MVP: Monolith + Redis cache + background workers
    ↓
Growth: Read replicas + dedicated analytics service
    ↓
Scale: Domain-driven microservices with event bus
    ↓
Enterprise: Multi-tenant SaaS with Odoo ERP sync
```

---

## 24. Project Presentation Strategy

### 24.1 Presentation Structure (10 Minutes)

| Segment | Duration | Content |
|---|---|---|
| **Problem Statement** | 1 min | Pain points in manual fleet management |
| **Solution Overview** | 1 min | TransitOps value proposition + architecture diagram |
| **Live Demo** | 5 min | Three role-based demo flows (see below) |
| **Technical Highlights** | 2 min | RBAC, modular architecture, validation, security |
| **Roadmap & Scalability** | 1 min | Future vision + Odoo integration potential |

### 24.2 Demo Flows (Prepare 3)

#### Flow 1: Fleet Manager — Daily Operations (2 min)
1. Login as Fleet Manager
2. Dashboard: show fleet KPIs and alerts
3. Register a new vehicle
4. Create a driver and assign to vehicle
5. Schedule a trip → start → complete
6. Show trip on dashboard recent activity

#### Flow 2: Driver — Field Operations (1.5 min)
1. Login as Driver
2. View assigned trips on dashboard
3. Start an assigned trip
4. Log a fuel entry after trip
5. Submit a toll expense

#### Flow 3: Financial Analyst — Approval & Analytics (1.5 min)
1. Login as Financial Analyst
2. Review pending expenses → approve one
3. Navigate to Analytics → show expense breakdown chart
4. Open compliance report (Safety Officer angle if time)

### 24.3 Demo Data Preparation

Pre-seed the database with:
- 5 vehicles (mixed statuses: active, maintenance, retired)
- 4 drivers (one with expiring license for alert demo)
- 8 trips (mix of scheduled, in-progress, completed)
- 3 maintenance records (one overdue)
- 6 fuel logs across vehicles
- 5 expenses (2 pending approval)
- 4 user accounts (one per key demo role)

### 24.4 Judging Criteria Alignment

| Likely Criteria | How TransitOps Addresses It |
|---|---|
| **Functionality** | End-to-end trip lifecycle with 10 modules |
| **Technical Quality** | Layered architecture, TypeScript strict, validation at every layer |
| **UI/UX** | Tailwind design system, role-aware navigation, charts |
| **Business Value** | Cost tracking, compliance alerts, approval workflows |
| **Scalability** | Modular monolith ready for microservice extraction |
| **Security** | JWT + RBAC + bcrypt + input validation |
| **Odoo Relevance** | Fleet ops complement Odoo ERP (HR, accounting, inventory) |

### 24.5 Presentation Tips

- Lead with the **problem**, not the tech stack
- Show **role switching** to demonstrate RBAC — judges notice security awareness
- Have **one recovery path** if live demo fails (screenshots or recorded GIF)
- Mention **Odoo integration vision** — aligns with Business Challenge context
- Keep architecture slide visible for technical judges
- Assign speaking roles: Dev A covers backend/security, Dev B covers UI/demo flows

### 24.6 Slide Deck Outline (8 Slides)

1. **Title** — TransitOps: Smart Transport Operations Platform
2. **Problem** — Fleet management challenges (cost, compliance, visibility)
3. **Solution** — Platform overview with architecture diagram
4. **Features** — Module map with icons
5. **RBAC** — Role matrix visual
6. **Tech Stack** — Frontend + Backend + Database
7. **Live Demo** — Transition slide (minimal text)
8. **Future Vision** — Scalability + Odoo ERP integration roadmap

---

## Appendix A: Environment Variables

| Variable | Package | Purpose |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Token signing key |
| `JWT_EXPIRES_IN` | Backend | Access token TTL |
| `BCRYPT_SALT_ROUNDS` | Backend | Password hashing cost |
| `PORT` | Backend | API server port |
| `CORS_ORIGIN` | Backend | Allowed frontend origin |
| `NODE_ENV` | Backend | development / production |
| `VITE_API_BASE_URL` | Frontend | Backend API base URL |

## Appendix B: Demo User Accounts

| Role | Email | Purpose |
|---|---|---|
| Admin | admin@transitops.demo | User management demo |
| Fleet Manager | fleet@transitops.demo | Primary operational demo |
| Driver | driver@transitops.demo | Field operations demo |
| Safety Officer | safety@transitops.demo | Compliance demo |
| Financial Analyst | finance@transitops.demo | Approval + analytics demo |

---

*End of Architecture Document*

*This document serves as the single source of truth for TransitOps development during the Odoo Business Challenge 2026 hackathon. All implementation decisions should align with the patterns, conventions, and priorities defined herein.*
