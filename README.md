<p align="center">
  <h1 align="center">🚛 ENSTO — Delivery Management Platform</h1>
  <p align="center">
    A full-stack delivery management application with <strong>strict GDPR compliance</strong> and <strong>5-year data traceability</strong>.<br/>
    Built with a modern Turborepo monorepo architecture.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5-000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Turborepo-2.8-EF4444?logo=turborepo" alt="Turborepo" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone & Install](#1-clone--install)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Start PostgreSQL](#3-start-postgresql)
  - [4. Generate Prisma Client & Run Migrations](#4-generate-prisma-client--run-migrations)
  - [5. Run the Development Servers](#5-run-the-development-servers)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Security & GDPR Compliance](#security--gdpr-compliance)
- [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**ENSTO** is a delivery management platform designed for industrial sites. It manages companies, delivery drivers, vehicles, visitors, and all access events — while enforcing **GDPR** regulations for personal data protection and maintaining a **5-year audit trail** for full traceability.

### Key Features

- 🔐 **AES-256-GCM encryption** of personal data (driver/visitor names) at rest
- 📜 **5-year access log retention** with `BigInt` primary keys and optimised indexes
- 🛡️ **RBAC** with 2 roles, 14 fine-grained permissions, and both API + UI guards
- 🔑 **bcrypt password hashing** (12 rounds) with timing-safe authentication
- 📦 **Monorepo architecture** — shared types, DB layer, and UI components
- 🌗 **Light / Dark mode** with Shadcn UI component library

---

## Architecture

```
turborepo/
├── apps/
│   ├── api              → Express.js REST API (TypeScript)
│   └── web              → Next.js 15 frontend (App Router)
│
├── packages/
│   ├── database         → @repo/db — Prisma schema, repositories, domain errors
│   ├── types            → @repo/types — Shared RBAC types (Role, Permission, can())
│   ├── ui               → @workspace/ui — Shadcn UI component library
│   ├── eslint-config    → Shared ESLint configurations
│   └── typescript-config → Shared tsconfig presets
│
├── docker-compose.yml   → PostgreSQL 16 + pgAdmin
├── turbo.json           → Turborepo pipeline configuration
└── pnpm-workspace.yaml  → Workspace definition
```

### Data Flow

```
┌──────────┐     fetch + Bearer token     ┌──────────┐     Repository pattern     ┌────────────┐
│  Next.js │ ──────────────────────────── │ Express  │ ──────────────────────────── │ PostgreSQL │
│  (web)   │    { status, data } JSON     │  (api)   │    Prisma + pg adapter      │   (Docker) │
└──────────┘                               └──────────┘                             └────────────┘
     │                                          │
     │  reads @repo/types                       │  reads @repo/types
     │  reads @repo/db (Server Components)      │  reads @repo/db (Repositories)
     │  reads @workspace/ui (Shadcn)            │
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 15 |
| **UI** | Shadcn UI + Tailwind CSS | v4 |
| **Backend** | Express.js | 5 |
| **Language** | TypeScript | 5.9 |
| **ORM** | Prisma Client | 7.4 |
| **Database** | PostgreSQL | 16 (Alpine) |
| **Auth** | JWT + bcrypt | — |
| **Encryption** | AES-256-GCM (Node.js Crypto) | — |
| **Validation** | Zod | 3.25 |
| **Monorepo** | Turborepo + pnpm workspaces | 2.8 |
| **Containerisation** | Docker Compose | — |

---

## Prerequisites

Ensure the following are installed on your machine:

| Tool | Minimum Version | Check |
|---|---|---|
| **Node.js** | 20+ | `node -v` |
| **pnpm** | 10.4+ | `pnpm -v` |
| **Docker** & Docker Compose | Latest | `docker compose version` |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url> ensto
cd ensto
pnpm install
```

### 2. Environment Variables

The project requires environment variables at **three** locations. Example files are provided.

#### Root (Docker Compose)

```bash
cp .env.example .env
```

```dotenv
# .env (root) — used by docker-compose.yml
POSTGRES_USER=ensto
POSTGRES_PASSWORD=ensto_secret
POSTGRES_DB=ensto_db
POSTGRES_PORT=5432
```

#### API (`apps/api`)

```bash
cp apps/api/.env.example apps/api/.env
```

```dotenv
# apps/api/.env
DATABASE_URL="postgresql://ensto:ensto_secret@localhost:5432/ensto_db"

# Auth
JWT_SECRET="change_me_to_a_long_random_secret"    # openssl rand -base64 48
JWT_EXPIRES_IN="8h"

# GDPR Encryption — CRITICAL: back this up!
ENCRYPTION_KEY="your_64_char_hex_string"           # openssl rand -hex 32

# CORS
WEB_ORIGIN="http://localhost:3000"
PORT=3001
```

#### Database (`packages/database`)

```bash
echo 'DATABASE_URL="postgresql://ensto:ensto_secret@localhost:5432/ensto_db"' > packages/database/.env
```

> ⚠️ **Important:** The `ENCRYPTION_KEY` is used to encrypt personal data (driver/visitor names) via AES-256-GCM. If lost, **all encrypted data becomes permanently unrecoverable**. Store it securely (e.g., in a secrets manager).

### 3. Start PostgreSQL

```bash
# Start just PostgreSQL
pnpm db:up

# (Optional) Start PostgreSQL + pgAdmin at http://localhost:5050
pnpm db:tools
```

### 4. Generate Prisma Client & Run Migrations

```bash
# Generate the Prisma Client from the schema
pnpm db:generate

# Apply all migrations to the database
pnpm db:migrate
```

### 5. Run the Development Servers

```bash
pnpm dev
```

This starts both apps concurrently via Turborepo:

| App | URL |
|---|---|
| **Next.js (web)** | [http://localhost:3000](http://localhost:3000) |
| **Express (api)** | [http://localhost:3001](http://localhost:3001) |
| **Health Check** | [http://localhost:3001/health](http://localhost:3001/health) |

---

## Available Scripts

All scripts are run from the **monorepo root**.

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode (hot reload) |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages and apps |
| `pnpm db:up` | Start PostgreSQL container |
| `pnpm db:down` | Stop all Docker containers |
| `pnpm db:logs` | Tail PostgreSQL container logs |
| `pnpm db:tools` | Start PostgreSQL + pgAdmin |
| `pnpm db:generate` | Generate Prisma Client from schema |
| `pnpm db:migrate` | Create & apply a new migration (interactive) |
| `pnpm db:migrate:deploy` | Apply pending migrations (CI/production) |
| `pnpm db:push` | Push schema to DB without migration (prototyping) |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate, returns JWT + user |
| `POST` | `/api/auth/register` | Public | Create a new personnel account |
| `GET` | `/api/auth/me` | Bearer | Get current user info + permissions |
| `POST` | `/api/auth/change-password` | Bearer | Change password (verifies current) |

### Companies (`/api/entreprises`)

| Method | Path | Permission |
|---|---|---|
| `GET` | `/api/entreprises` | `entreprise:read` |
| `GET` | `/api/entreprises/:id` | `entreprise:read` |
| `POST` | `/api/entreprises` | `entreprise:create` |
| `PATCH` | `/api/entreprises/:id` | `entreprise:update` |
| `DELETE` | `/api/entreprises/:id` | `entreprise:delete` |

### Drivers (`/api/livreurs`)

| Method | Path | Permission |
|---|---|---|
| `GET` | `/api/livreurs` | `livreur:read` *(supports `?entrepriseId=` filter)* |
| `GET` | `/api/livreurs/:id` | `livreur:read` |
| `POST` | `/api/livreurs` | `livreur:create` |
| `PATCH` | `/api/livreurs/:id` | `livreur:update` |
| `DELETE` | `/api/livreurs/:id` | `livreur:delete` |

> All endpoints except auth return a unified JSON envelope: `{ status: "success", data }` or `{ status: "error", message }`.

---

## Security & GDPR Compliance

This project is designed to meet **EU GDPR Article 32** requirements for data protection.

### 🔐 Encryption at Rest (AES-256-GCM)

Personal data (driver names, visitor names) is **never stored in cleartext** in the database.

```
                    ┌───────────────────────────────────────────┐
  "Jean Dupont" ──→ │ IV (12B) │ AuthTag (16B) │ CipherText    │ ──→ bytea column
                    └───────────────────────────────────────────┘
```

- **Algorithm:** AES-256-GCM (authenticated encryption with associated data)
- **Key:** 32-byte key loaded from `ENCRYPTION_KEY` env var
- **IV:** Random 12-byte nonce generated per encryption call (never reused)
- **Auth Tag:** 16-byte GCM tag providing tamper detection
- **Fail-fast:** The API refuses to start if the key is missing or malformed
- **Encrypted fields:** `Livreur.nomChiffre`, `Livreur.prenomChiffre`, `Visiteur.nomCompletChiffre`

### 🔑 Password Security

- **bcrypt** with **12 salt rounds** (not SHA-256)
- **Timing-safe** login — `bcrypt.compare` runs even when the user doesn't exist, preventing user enumeration attacks

### 🛡️ API Security

- All non-auth routes require a valid **Bearer JWT** token
- Fine-grained **permission-based middleware** (`requirePermission("livreur:create")`)
- Global error handler **never leaks internal details** to the client
- CORS restricted to the configured `WEB_ORIGIN`

### 📜 5-Year Data Traceability

- `Historique_Log` uses **`BigInt`** primary keys (`BIGSERIAL`) for high-volume writes
- Composite indexes on `(dateHeure DESC)`, `(dateHeure, typeAction)` and all FK columns
- Optional foreign keys track **who** triggered each event (Vehicle, Visitor, or Personnel)

---

## RBAC (Role-Based Access Control)

Permissions are defined in `packages/types` and enforced at **both** the API and UI layers.

### Roles

| Role | Description |
|---|---|
| **Admin** | Full access to all features (14/14 permissions) |
| **Magasinier** | Read companies, read/create/update drivers, read logs (5/14 permissions) |

### Permission Matrix

| Permission | Admin | Magasinier |
|---|---|---|
| `entreprise:read` | ✅ | ✅ |
| `entreprise:create` | ✅ | ❌ |
| `entreprise:update` | ✅ | ❌ |
| `entreprise:delete` | ✅ | ❌ |
| `livreur:read` | ✅ | ✅ |
| `livreur:create` | ✅ | ✅ |
| `livreur:update` | ✅ | ✅ |
| `livreur:delete` | ✅ | ❌ |
| `personnel:read` | ✅ | ❌ |
| `personnel:create` | ✅ | ❌ |
| `personnel:delete` | ✅ | ❌ |
| `log:read` | ✅ | ✅ |
| `settings:manage` | ✅ | ❌ |

### Enforcement Layers

| Layer | Mechanism |
|---|---|
| **API middleware** | `authenticate` → `requirePermission("...")` chain on every route |
| **UI components** | `<PermissionGuard>` hides buttons/links; `<PageGuard>` redirects entire pages |
| **Shared logic** | `can(role, permission)` function from `@repo/types` (single source of truth) |

---

## Project Structure

```
turborepo/
│
├── apps/
│   ├── api/                          # Express.js REST API
│   │   ├── src/
│   │   │   ├── controllers/          # HTTP layer — Zod validation, response formatting
│   │   │   ├── services/             # Business logic — encryption, auth, CRUD
│   │   │   ├── routes/               # Route definitions with middleware chains
│   │   │   ├── middlewares/           # authenticate, requirePermission, errorHandler, logger
│   │   │   ├── lib/                  # crypto.ts (AES-256), errors.ts, logger.ts
│   │   │   ├── app.ts               # Express app factory
│   │   │   └── index.ts             # Entry point (dotenv, listen, graceful shutdown)
│   │   └── .env.example
│   │
│   └── web/                          # Next.js 15 (App Router)
│       ├── app/
│       │   ├── (auth)/               # Auth group layout (login, register)
│       │   ├── entreprises/          # Companies CRUD page
│       │   ├── livreurs/             # Drivers CRUD page
│       │   ├── admin/                # RBAC dashboard
│       │   ├── settings/             # Admin-only settings
│       │   ├── profile/              # User profile + change password
│       │   └── page.tsx              # Home (Server Component — direct Prisma query)
│       ├── components/               # AppHeader, guards, UserMenu, ThemeSwitcher
│       ├── hooks/                    # useAuth, useUser, usePermission, useRole
│       └── lib/                      # api.ts (typed fetch client), rbac.ts
│
├── packages/
│   ├── database/                     # @repo/db
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 6 models, 2 enums, optimised indexes
│   │   │   └── migrations/           # SQL migration history
│   │   ├── generated/prisma/         # Auto-generated Prisma Client
│   │   └── src/
│   │       ├── interfaces/           # IBaseRepository, IPersonnelRepository
│   │       ├── repositories/         # EntrepriseRepo, LivreurRepo, PersonnelRepo
│   │       ├── prisma.service.ts     # Singleton PrismaService
│   │       ├── client.ts             # Raw prisma singleton (pg adapter)
│   │       └── errors.ts             # DatabaseError, RecordNotFoundError, etc.
│   │
│   ├── types/                        # @repo/types
│   │   └── src/index.ts              # Role, Permission, ROLE_PERMISSIONS, can(), AuthUser
│   │
│   ├── ui/                           # @workspace/ui (Shadcn)
│   │   └── src/components/           # Avatar, Badge, Button, Card, Dialog, Table, etc.
│   │
│   ├── eslint-config/                # Shared lint rules
│   └── typescript-config/            # Shared tsconfig presets
│
├── docker-compose.yml                # PostgreSQL 16 + pgAdmin
├── turbo.json                        # Pipeline: build, dev, db:generate, db:migrate
├── pnpm-workspace.yaml               # apps/* + packages/*
└── package.json                      # Root scripts (db:up, db:down, dev, build)
```

---

## Adding Shadcn UI Components

To add new Shadcn components to the shared UI package:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

Components are placed in `packages/ui/src/components/` and imported as:

```tsx
import { Button } from "@workspace/ui/components/button"
```

---

## License

This project is developed as part of an academic / professional exercise. All rights reserved.
