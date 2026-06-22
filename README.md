# Kindred

Build and keep your family tree. Kindred is a multi-tenant genealogy app: each
account holds its own private family graph, stored in **Neo4j** and presented
through a **Next.js** interface with a warm, timeless "Heirloom" design.

## Why a graph

Family history *is* a graph: people connected by birth and marriage across
generations. So relationships live only as edges in Neo4j, and everything
derived — siblings, ancestors, descendants, generations — is found by walking
the graph rather than copied onto nodes.

```
(parent)-[:PARENT_OF {role}]->(child)
(a)-[:MARRIED_TO {status, since, until}]-(b)
```

Every `:Person` belongs to a `:User` via an `ownerId`, and **every query is
scoped by it**, so accounts are fully isolated from one another.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Neo4j** graph database via `neo4j-driver`
- **Zod** for validation — the single source of truth for domain types
- **Accounts:** email/password with scrypt hashing and signed-cookie sessions
  (`jose`), gated by a `proxy.ts` (Edge) — no external auth service required
- **Tailwind CSS v4** — the "Heirloom" design system (Fraunces + Inter)
- **react-force-graph-2d** for the interactive tree (canvas)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Run Neo4j

Any local instance works. For a single instance use the direct `bolt://`
scheme — `neo4j://` expects cluster routing and fails locally.

```bash
docker run --name neo4j-kindred -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password -d neo4j:latest
```

### 3. Configure env

```bash
cp .env.example .env.local
# set NEO4J_* to match your instance, and generate AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 4. Initialise / seed

```bash
npm run db:init   # apply constraints & indexes
npm run seed      # optional: create a demo account with a sample family
```

The seed prints demo credentials (`demo@kindred.app` / `demo12345`).

### 5. Develop

```bash
npm run dev       # http://localhost:3000
```

Sign up to create your own empty tree, or log in with the demo account.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:init` | Verify connection, apply constraints/indexes |
| `npm run seed` | Reset the DB and seed a demo account + sample family |

## Project structure

```
src/
  app/
    (public)       /, /about, /login, /signup
    (gated)        /people, /people/[id], /tree   (scoped to the signed-in user)
    api/           people, relationships, graph, auth (signup/login/logout)
  components/
    ui/            primitives (button, dialog, input, badge, avatar, field)
    layout/        header, footer, brand mark, page heading
    people/        cards, form, explorer, relatives, relationship manager
    tree/          the force-graph family tree (client)
    auth/          sign-in / sign-up form
  lib/
    auth/          jwt (Edge-safe), session, password (scrypt), current-user
    neo4j/         lazy driver + schema/constraints
    users.ts       account records
    people.ts · relationships.ts · graph.ts   (all ownerId-scoped)
    validation.ts  Zod schemas → inferred types
  proxy.ts         Edge auth gate (redirects unauthenticated users)
  scripts/         init-db, seed
```

## Auth & security notes

Sessions are JWTs (`jose`, HS256) in an httpOnly, SameSite=Lax cookie signed
with `AUTH_SECRET`; passwords are scrypt-hashed with a per-user salt and
compared in constant time. This is a solid MVP. Before a real production launch,
add: rate limiting on auth routes, email verification, password reset, and CSRF
tokens for state-changing requests.

## CI

Every push to `master` and every pull request runs type-check, lint and build
on Node 24 (`.github/workflows/ci.yml`). `master` is protected: changes land
through PRs with a passing build.

## Design

The current look is "Heirloom" (warm, timeless). A previous bold, geometric
"Ndebele Modernism" design is preserved on the `design/ndebele-modernism` branch
(tag `ndebele-modernism-v1`) with a portable spec.

## Conventions

Engineering conventions live in [`rules.md`](./rules.md).
