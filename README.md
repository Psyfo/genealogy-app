# Genealogy App (Work in Progress)

An experimental genealogy visualizer that stores family data in a Neo4j graph database and renders an interactive force-directed graph in a Next.js (App Router) frontend.

> Status: **Actively evolving / WIP**. APIs, schema, and UI are subject to change. Not production-hardened.

## Goals

- Model people and family relationships as a property graph.
- Expose clean API endpoints (people, relationships, graph views).
- Provide interactive visualization (pan, zoom, hover highlighting).
- Build a foundation for ancestor/descendant traversal, analytics, and future editing UI.

## Implemented So Far

- Next.js (App Router) + TypeScript project scaffold.
- Neo4j driver integration with typed query helper (`runQuery`).
- People CRUD (currently: list + create).
- Relationship creation (parent, married, sibling variants internally mapped).
- Ancestors / descendants API endpoints (depth parameter supported).
- Seed script to populate sample dataset.
- Force-directed 2D graph visualization (`react-force-graph-2d`) with:
  - Custom node coloring
  - Hover highlighting
  - Label pills
  - Arrowed relationship links
- Basic logging for DB connectivity and API route diagnostics.
- Improved TypeScript safety (removal of explicit `any`, safer Record usage).

## Tech Stack

- Framework: **Next.js (App Router)** + React 18
- Language: **TypeScript**
- Database: **Neo4j** (Aura / local)
- Visualization: **react-force-graph-2d** (Canvas rendering)
- Styling: **Tailwind CSS**
- Runtime / Tooling: Node.js, `tsx` for running TypeScript scripts (seeding)

## Architecture Overview

```bash
/src
  /app
    /api
      /people
        route.ts        (GET all, POST create)
        [id]/
          ancestors/    (GET ancestors?depth=n)
          descendants/  (GET descendants?depth=n)
    page.tsx            (Home page with graph)
  /components
    GraphViewer.tsx
  /lib
    neo4.ts             (Neo4j driver + query runner)
    people.ts           (People operations)
    relationships.ts    (Relationship queries)
    seed.ts             (Seed script)
  /types
    person.ts
    relationship.ts
```

## Data Model (Current)

Node (Label: `Person`)

- id (string)
- name (string)
- birthYear? (number)
- deathYear? (number)
- gender? (string) – used in seed data

Relationships

- `PARENT_OF` (directional)
- `MARRIED_TO` (stored bidirectionally as two directed edges)
- (Planned) `SIBLING_OF`, derived paths, etc.

## Seeding Data

1. Set environment variables (see below).
2. Run:

   ```bash
   npm run seed
   ```

3. The script:
   - Connects & logs timing.
   - Clears existing graph (`MATCH (n) DETACH DELETE n`).
   - Inserts sample people and relationships.

## Environment Variables

Create `.env.local` (never commit secrets):

```bash
NEO4J_URI=neo4j+s://<your-aura-instance>.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=<your-password>
```

For local Neo4j:

```bash
NEO4J_URI=bolt://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<local-password>
```

(If encryption issues arise locally, driver config can set `encrypted: 'ENCRYPTION_OFF'`.)

## Running the App

```bash
npm install
npm run dev
```

Navigate to: <http://localhost:3000>

## API Highlights

- `GET /api/people`
- `POST /api/people`  (body: { id, name, birthYear?, deathYear? })
- `GET /api/people/:id/ancestors?depth=n`
- `GET /api/people/:id/descendants?depth=n`
- (Planned) POST relationship endpoints returning updated graph fragments.

## Graph Visualization

Rendered with `react-force-graph-2d`:

- Custom node painter adds color + pill labels.
- Hover state amplifies node radius, link width, and color.
- Future enhancements: filtering, legend, clustering, dynamic layout controls.

## Roadmap (Planned)

- Input forms to add/edit people directly in UI.
- Derive sibling relationships algorithmically.
- Caching layer or persisted projections for performance.
- Unit/integration tests for graph traversal functions.
- Authentication & multi-user trees.
- Export / import (GEDCOM or JSON).
- UI editing of relationships (drag to connect).
- Accessibility improvements (keyboard navigation, ARIA).

## Development Notes

- Avoid committing real credentials.
- Prefer parameterized Cypher (`$param`) for all queries (already followed).
- Strict TypeScript mode encouraged—continue refining types for graph response transforms.
- Logging currently minimal—can add structured logger if needed later.

## Contributing (Future)

Not open for external contributions yet; internal iteration phase. Will add guidelines later.

## License

(Choose a license – MIT? Pending.)

## Disclaimer

This is a **work in progress** prototype. Expect rapid changes, breaking schema updates, and incomplete validation. Not production-ready.

---
