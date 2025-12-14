# Programming Conventions & Rules

## TypeScript Standards

### Strict Typing (MANDATORY)

- **Always enable strict mode** in `tsconfig.json`
- **No `any` types** - use `unknown` if type is truly unknown, then narrow it
- **No type assertions (`as`)** unless absolutely necessary and well-justified
- **No `@ts-ignore` or `@ts-expect-error`** - fix the underlying type issue
- **Explicit return types** on all exported functions
- **No implicit any** - all parameters must have explicit types

### Modern TypeScript Best Practices

#### Use `type` Over `interface` (Default)

- **Prefer `type` aliases** for most declarations
- Use `interface` ONLY when:
  - You need declaration merging (rare)
  - Creating a public API that others will extend
  - Working with object-oriented patterns that require `extends`
- **Rationale**: `type` is more flexible, supports unions/intersections, and aligns with functional programming

```typescript
// ✅ GOOD - Use type
type Person = {
  id: string;
  name: string;
  birthDate: Date | null;
};

type Result<T> = { success: true; data: T } | { success: false; error: string };

// ❌ AVOID - Unnecessary interface
interface Person {
  id: string;
  name: string;
}
```

#### Avoid Classes When Unnecessary

- **Don't use classes for simple data structures** - use types/plain objects
- **Don't use classes for namespacing** - use modules/namespaces
- Use classes ONLY when you need:
  - Actual inheritance hierarchies
  - Private fields with encapsulation
  - Instance methods with `this` binding
  - Integration with OOP frameworks

```typescript
// ✅ GOOD - Simple data structure
type User = {
  id: string;
  email: string;
};

const createUser = (email: string): User => ({
  id: generateId(),
  email,
});

// ❌ AVOID - Unnecessary class
class User {
  constructor(public id: string, public email: string) {}
}
```

## Tooling & Research Requirements

### No Guessing Policy (MANDATORY)

#### Always Use Context7 for External Libraries

- **NEVER guess** about library APIs, versions, or implementation details
- **ALWAYS check** library documentation using Context7 before implementing
- **Verify version-specific** features and deprecations
- **Check migration guides** when updating dependencies

```typescript
// ❌ BAD - Guessing about React Query API
const { data } = useQuery('key', fetcher);

// ✅ GOOD - Verified with Context7 for React Query v5
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

#### Version-Specific Implementation

- **Lock versions** in `package.json` (no `^` or `~` for production)
- **Document version requirements** in code comments when using specific features
- **Test after upgrades** - don't assume backwards compatibility
- **Check breaking changes** in changelogs before upgrading

#### Proper Tool Usage

- Use **ESLint** with strict rules - fix all warnings
- Use **Prettier** for consistent formatting
- Use **TypeScript Language Server** - don't ignore red squiggles
- Run **type checking** as part of CI/CD (`tsc --noEmit`)
- Use **official debugging tools** - no console.log debugging in production code

## Code Organization

### Module Structure

- **One component per file** (except tightly coupled sub-components)
- **Co-locate types** with the code that uses them
- **Export types explicitly** - no default exports for types
- **Use barrel exports** (`index.ts`) sparingly - they impact tree-shaking

### Naming Conventions

- **Types/Interfaces**: PascalCase (`PersonData`, `ApiResponse`)
- **Functions/Variables**: camelCase (`getUserById`, `personData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Files**: kebab-case (`person-card.tsx`, `use-person-data.ts`)
- **Components**: PascalCase files (`PersonCard.tsx`, `SearchBar.tsx`)

## Error Handling

### Explicit Error Types

```typescript
// ✅ GOOD - Explicit error handling
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function fetchPerson(id: string): Promise<Result<Person>> {
  try {
    const response = await fetch(`/api/people/${id}`);
    if (!response.ok) {
      return { ok: false, error: new Error('Failed to fetch') };
    }
    const data = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

### Never Swallow Errors

- **Always handle or propagate** errors
- **Log errors** with context (user ID, timestamp, request details)
- **Don't use empty catch blocks**
- **Provide user-friendly messages** while logging technical details

## API & Data Handling

### Validate External Data

- **Never trust external input** (API responses, user input, URL params)
- **Use validation libraries** (Zod, Yup) - don't write manual validators
- **Validate at boundaries** (API routes, form submissions)
- **Type guard functions** for runtime checks

```typescript
// ✅ GOOD - Runtime validation with Zod
import { z } from 'zod';

const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  birthDate: z.string().datetime().nullable(),
});

type Person = z.infer<typeof PersonSchema>;

// Validate at API boundary
export async function GET(request: Request) {
  const data = await fetchFromDB();
  const validData = PersonSchema.parse(data); // Throws if invalid
  return Response.json(validData);
}
```

## React/Next.js Specific

### Component Patterns

- **Prefer function components** over class components
- **Use hooks** - don't reinvent React patterns
- **Extract custom hooks** for reusable logic
- **Keep components focused** - single responsibility

### State Management

- **Server components by default** (Next.js App Router)
- **Client components** only when needed (`'use client'`)
- **Co-locate state** - lift only when necessary
- **Use URL state** for shareable/bookmarkable state

### Styling with Tailwind CSS (MANDATORY)

- **Tailwind-first approach** - use Tailwind utility classes for all styling
- **NO inline styles** - inline styles (`style={{ ... }}`) are prohibited
  - Exception: Only when programmatically calculated values are absolutely necessary (e.g., dynamic animations based on runtime data)
- **NO CSS modules** - Tailwind provides all necessary styling capabilities
- **Use Tailwind's configuration** for custom design tokens (colors, spacing, etc.)
- **Leverage Tailwind variants** for responsive, hover, focus states
- **Use `@apply` sparingly** - prefer utility classes directly in JSX
- **Extract repeated patterns** into components, not CSS classes

```tsx
// ✅ GOOD - Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// ❌ BAD - Inline styles (laziness)
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Title</h2>
</div>

// ⚠️ ACCEPTABLE - Programmatic values only when necessary
<div
  className="absolute"
  style={{
    left: `${calculatedPosition}px`,
    transform: `rotate(${dynamicAngle}deg)`
  }}
>
  Content
</div>
```

### Performance

- **Memoize expensive calculations** (`useMemo`, `useCallback`)
- **Lazy load** heavy components (`React.lazy`, `next/dynamic`)
- **Optimize images** (always use `next/image`)
- **Profile before optimizing** - don't guess at bottlenecks

## Database & Backend

### Type Safety Across Layers

- **Share types** between frontend and backend
- **Validate at API boundaries** - server-side validation is mandatory
- **Use ORMs/Query Builders** that provide type safety (Prisma, Drizzle)
- **Generate types** from database schema when possible

### Neo4j Specific (for this project)

- **Parameterized queries ONLY** - prevent Cypher injection
- **Type returned data** explicitly
- **Handle connection errors** gracefully with retries
- **Use transactions** for multi-step operations

## Documentation

### Code Comments

- **Explain WHY, not WHAT** - code should be self-documenting
- **Document complex algorithms** or business logic
- **Add JSDoc** for public APIs and exported functions
- **Keep comments updated** - outdated comments are worse than none

### README & Docs

- **Document setup steps** clearly
- **Include environment variables** with examples
- **Explain architecture decisions** in `/docs`
- **Keep dependencies documented** with version requirements

## Testing (TODO)

### Coverage Requirements

- **Unit tests** for business logic and utilities
- **Integration tests** for API routes
- **E2E tests** for critical user flows
- **Type tests** for complex type utilities

### Testing Principles

- **Test behavior, not implementation**
- **Use meaningful test descriptions**
- **Mock external dependencies**
- **Keep tests fast** and independent

## Git & Version Control

### Commit Messages

- **Use conventional commits** (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Be specific** in commit messages
- **Reference issues** when applicable (#123)
- **Keep commits atomic** - one logical change per commit

### Branch Strategy

- **Feature branches** for all changes
- **Never commit directly** to main/master
- **Squash or rebase** before merging to keep history clean
- **Delete branches** after merging

## Security

### Never Commit Secrets

- **Use environment variables** for all secrets
- **Use `.env.local`** for local development (gitignored)
- **Rotate exposed credentials** immediately
- **Use secret management** tools for production

### Input Sanitization

- **Sanitize user input** before storing or displaying
- **Use parameterized queries** - never string concatenation
- **Validate and escape** data in UI
- **Implement rate limiting** on public APIs

## Performance & Optimization

### Optimization Rules

1. **Measure first** - use profiling tools
2. **Optimize the bottleneck** - not random code
3. **User-perceived performance** matters most
4. **Document optimizations** - explain the tradeoff

### Bundle Size

- **Monitor bundle size** in CI
- **Tree-shake unused code**
- **Code-split** large dependencies
- **Lazy load** non-critical features

---

## Review Checklist

Before submitting code, verify:

- [ ] TypeScript strict mode passes with no errors
- [ ] ESLint and Prettier pass
- [ ] All functions have explicit return types
- [ ] No `any`, `as`, or `@ts-ignore` usage
- [ ] External library usage verified with Context7
- [ ] Error handling is explicit and complete
- [ ] Runtime validation for external data
- [ ] Tests added/updated (when testing is set up)
- [ ] Documentation updated if API changed
- [ ] No console.logs or debug code
- [ ] Git commit message follows conventions

---

**Last Updated**: December 14, 2025
**Project**: Genealogy App
**Stack**: Next.js 15, TypeScript, Neo4j
