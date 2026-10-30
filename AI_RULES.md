# Project AI Rules

## Technology stack
- React 19 with TypeScript; write application code in `src/` and prefer explicit, narrow types at boundaries.
- TanStack Start and TanStack Router provide the server-rendered app and file-based routing; routes live in `src/routes/` and the route tree is generated.
- Vite 8 runs the development server and production build; preserve the existing Vite/framework plugin configuration.
- Tailwind CSS 4 provides styling, with the existing shadcn/ui component wrappers built on Radix UI primitives.
- TanStack React Query manages client-side asynchronous data and caching; the root route supplies its provider and router context.
- Supabase provides authentication and client integration; Drizzle ORM/schema tooling and PostgreSQL (`postgres`) are present for database access and migrations.
- React Hook Form and Zod are installed for form state and validation; use the resolver package when combining them.
- Vitest, Testing Library, and jsdom are installed for automated tests; ESLint and Prettier are available for code quality and formatting.

## Practical conventions
- Add pages as TanStack file routes under `src/routes/`; do not manually edit `src/routeTree.gen.ts`. Preserve the root route shell, its `<Outlet />`, and configured framework plugins.
- Put reusable application components in `src/components/`. Prefer existing shadcn/ui wrappers in `src/components/ui/` for interface primitives; customize usage and styles rather than editing those prebuilt wrappers for ordinary design changes.
- Use Tailwind utility classes for styling. Use the existing `cn` helper from `src/lib/utils.ts` when conditional classes need merging.
- Use React Query for client-side data fetching and cache invalidation, following established query patterns in `src/lib/queries.ts`. Use TanStack Start server functions for server work where appropriate.
- Keep privileged database access and secrets server-only; never expose credentials or privileged operations in browser code. Reuse the existing Supabase authentication middleware and authorization checks for protected server functions—do not bypass or broaden them, or invent new access policies.
- Validate untrusted input at server/API boundaries with Zod and follow existing error-handling and data-access patterns. Do not treat client-side checks as authorization.
- Use React Hook Form with Zod for forms that need structured validation. For simpler controls, prefer native React state and existing UI components.
- Add or update focused Vitest/Testing Library tests for behavior changes; avoid generated route-tree edits and unrelated configuration changes.
- SEO canonical production origin is `https://achadinhos-do-cal.vercel.app`; use `src/lib/seo.ts` for SEO URLs. Auth redirects remain current app origin.
