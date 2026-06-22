# Mahlangu

A living record of the Mahlangu family — a genealogy app that stores people and
their relationships in a **Neo4j** graph and presents them through a **Next.js**
interface drawn in the bold geometry of **Ndebele** art.

> The data that ships is an illustrative sample family (four invented
> generations rooted in KwaNdebele and Pretoria). Replace it with your own.

## Why a graph

Family history *is* a graph: people connected by birth and marriage across
generations. So relationships live only as edges in Neo4j and everything derived
— siblings, ancestors, descendants, generations — is found by walking the graph,
never copied onto nodes or kept in sync by hand.

```
(parent)-[:PARENT_OF {role}]->(child)
(a)-[:MARRIED_TO {status, since, until}]-(b)
```

A `:Person` node holds only intrinsic facts (names, dates, places, occupation,
clan praise, a short story). Siblings are people who share a parent; ancestors
and descendants are variable-length `PARENT_OF` walks.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Neo4j** graph database via `neo4j-driver`
- **Zod** for validation — the single source of truth for domain types
- **Tailwind CSS v4** (CSS-first tokens) — the "Ndebele Modernism" design system
- **react-force-graph-2d** for the interactive tree (canvas)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Run Neo4j

Any local instance works (Neo4j Desktop, Docker, etc.). For a single instance
use the direct `bolt://` scheme — `neo4j://` expects cluster routing and will
fail to connect locally.

```bash
docker run --name neo4j-mahlangu -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password -d neo4j:latest
```

### 3. Configure env

```bash
cp .env.example .env.local
# then edit NEO4J_* to match your instance
```

### 4. Seed the sample family

```bash
npm run seed     # applies constraints, clears the graph, inserts the sample family
```

### 5. Develop

```bash
npm run dev      # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:init` | Verify connection and apply constraints/indexes |
| `npm run seed` | Reset and seed the sample family |

## Project structure

```
src/
  app/                 routes (home, /people, /people/[id], /tree, /about) + /api
  components/
    ui/                primitives (button, dialog, input, badge, avatar, field)
    layout/            header, footer, the Ndebele band motif, page heading
    people/            cards, form, explorer, relatives, relationship manager
    tree/              the force-graph family tree (client)
  lib/
    neo4j/             lazy driver + schema/constraints
    validation.ts      Zod schemas → inferred types
    people.ts          person CRUD (parameterised Cypher)
    relationships.ts   edges + derived parents/siblings/spouses/ancestors
    graph.ts           graph projection + generation layout
    format.ts          name/date/age helpers (shared client + server)
  scripts/             init-db, seed
```

## API

All routes return `{ data }` on success and `{ error: { message, issues? } }`
on failure. Validation errors are `400`, relationship cycles `409`.

| Method | Route | |
| --- | --- | --- |
| `GET` / `POST` | `/api/people` | list (`?search=`) / create |
| `GET` / `PATCH` / `DELETE` | `/api/people/[id]` | read (with relatives) / update / delete |
| `GET` | `/api/people/[id]/ancestors?depth=n` | ancestor walk |
| `GET` | `/api/people/[id]/descendants?depth=n` | descendant walk |
| `POST` / `DELETE` | `/api/relationships` | add / remove a parent or marriage edge |
| `GET` | `/api/graph` | nodes + links for the tree |

## CI

Every push to `master` and every pull request runs type-check, lint and build
via GitHub Actions (`.github/workflows/ci.yml`). `master` is protected: changes
land through PRs with a passing build.

## Conventions

Engineering conventions for the project live in [`rules.md`](./rules.md).
