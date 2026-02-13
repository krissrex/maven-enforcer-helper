# AGENTS.md

Guidelines for agentic coding agents working on this Maven Enforcer Helper project.

## Project Overview

A React + TypeScript + Vite SPA that analyzes maven-enforcer-plugin error messages (dependency convergence and require upper limit violations), visualizes issues, and generates XML for maven dependencyConvergence in pom.xml.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run ESLint
pnpm lint

# Run tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Preview production build
pnpm preview
```

**Testing:** Vitest is configured with jsdom environment and React Testing Library.

## Technology Stack

- **Framework:** React 19 with React Compiler
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9 (strict mode)
- **Package Manager:** pnpm
- **Linting:** ESLint 9 with typescript-eslint
- **Styling:** Vanilla CSS (no CSS-in-JS framework)

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - all strict compiler options must be followed
- Target: ES2022, Module: ESNext
- Always use explicit types for function parameters and return types
- Enable `noUnusedLocals` and `noUnusedParameters` - no unused variables allowed
- Use type-only imports: `import type { Foo } from './foo'`

### Imports & File Extensions

- Use `.tsx` extension when importing TypeScript files: `import App from './App.tsx'`
- Group imports: React/libs first, then local modules, then CSS
- Use ES module syntax only

### Naming Conventions

- Components: PascalCase (e.g., `DependencyGraph.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useParser.ts`)
- Utilities: camelCase (e.g., `parseMavenOutput.ts`)
- Types/Interfaces: PascalCase (e.g., `MavenConflict`)
- CSS files: Match component name (e.g., `DependencyGraph.css`)

### React Patterns

- Use functional components with hooks
- React Compiler is enabled - memoization handled automatically
- Use `StrictMode` in development
- Prefer `useState` and `useCallback` for event handlers
- Always provide `key` props when rendering lists

### CSS/Styling

- Use vanilla CSS files alongside components
- Prefer CSS custom properties (variables) for theming
- Support both light and dark color schemes via `prefers-color-scheme`
- Use semantic class names (e.g., `.dependency-card`, `.conflict-list`)

### Error Handling

- Parse errors should return structured error objects, not throw
- Display user-friendly error messages in the UI
- Use TypeScript discriminated unions for error states: `{ type: 'success', data: T } | { type: 'error', message: string }`

### Parser Implementation

- Maven enforcer output follows specific patterns for dependency conflicts
- Parse both "RequireUpperBoundDeps" and "DependencyConvergence" violations
- Extract: groupId, artifactId, conflicting versions, and dependency paths
- Generate valid XML for `<dependencyManagement>` section

## Project Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Root component
├── App.css           # App styles
├── index.css         # Global styles
├── components/       # React components (to be created)
├── hooks/           # Custom React hooks (to be created)
├── parsers/         # Maven output parsers (to be created)
├── types/           # TypeScript type definitions (to be created)
└── utils/           # Utility functions (to be created)
```

## ESLint Configuration

Configured in `eslint.config.js`:
- typescript-eslint recommended rules
- react-hooks recommended rules
- react-refresh plugin for Vite
- Ignores `dist/` directory

## Important Notes

- Always run `pnpm lint` before committing changes
- The React Compiler may impact build performance - this is expected
- Application is client-side only - no server-side rendering
- Output should be copy-paste ready XML for pom.xml
