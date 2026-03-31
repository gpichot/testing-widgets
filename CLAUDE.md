# CLAUDE.md

This file provides context for Claude Code when working on this repository.

## Project overview

`testing-widgets` is a monorepo for a Widget Object Model (WOM) library that provides framework and runner-agnostic UI testing abstractions. It allows defining widget objects once and using them across React Testing Library (RTL) and Playwright.

## Monorepo structure

- `packages/testing-ui/` -- Core library published as `testing-widgets`. Contains the `widget()` factory, locator types, enhanced locators with role shortcuts, and RTL/Playwright adapters.
- `packages/example-react/` -- A React app (ContactForm) demonstrating the library. Has vitest+RTL tests and Playwright e2e tests sharing the same widget definition.
- `packages/docs/` -- Astro + Starlight documentation site.

## Build & tooling

- **Package manager**: pnpm (workspaces)
- **Task runner**: Turborepo (`turbo.json`)
- **Linting/formatting**: Biome (uses tabs for indentation)
- **TypeScript**: strict mode, ES2022 target, bundler module resolution
- **Build**: `tsc` for core library, `vite build` for example-react, `astro build` for docs

## Common commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages (via turbo)
pnpm check                # Lint + format check (biome)
pnpm check:fix            # Auto-fix lint/format issues
pnpm test                 # Run unit tests (vitest, via turbo)
pnpm test:e2e             # Run e2e tests (playwright, via turbo)
```

## Testing

- **Unit tests**: Vitest with jsdom environment. Located in `packages/testing-ui/src/__tests__/` and `packages/example-react/tests/`.
- **E2E tests**: Playwright (chromium). Located in `packages/example-react/e2e/`. Requires `playwright install chromium` before first run.
- The unit and e2e tests for example-react share the same widget definition (`packages/example-react/src/ContactForm.widgets.ts`).

## CI pipeline

Defined in `.github/workflows/ci.yml`. Two jobs:
1. **check** -- installs deps, runs `pnpm check` (biome), `pnpm build`, `pnpm test`
2. **e2e** -- installs deps, builds, installs Playwright chromium, runs `pnpm test:e2e`

## Code style

- Biome handles formatting and linting. Run `pnpm check` before committing.
- Indentation: tabs (configured in `biome.json`).
- Imports are auto-sorted by Biome (organize imports enabled).
- No ESLint or Prettier -- Biome replaces both.

## Key architectural patterns

- **Widget factory**: `widget((l) => ({ elements, actions }))` creates adapter-agnostic widget definitions. The `l` parameter is an enhanced locator.
- **Adapters**: `rtl(container, userEvent)` and `playwright(page)` bridge widget definitions to specific test runners.
- **Type inference**: The native element type (HTMLElement or Playwright Locator) is inferred at the `.from()` call site and propagated through all returned locators via the `Retype<T, N>` utility type.
