# Maven Enforcer Helper

A React SPA that analyzes maven-enforcer-plugin error messages and helps resolve dependency convergence issues.

## What it does

Paste your Maven Enforcer plugin error output and this tool will:
- Parse dependency convergence violations
- Parse require upper bound dependency violations
- Visualize conflicting dependency versions
- Generate the `<dependencyManagement>` XML to fix your pom.xml

## Usage

1. Run a Maven build with the enforcer plugin to generate error output
2. Copy the error message
3. Paste it into the text input
4. Click Parse to analyze
5. Review the conflicts and copy the generated XML

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) package manager

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Build for production
pnpm build

# Run linting
pnpm lint
```

### Technology Stack

- **Framework:** React 19 with React Compiler
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9 (strict mode)
- **Testing:** Vitest with React Testing Library
- **Linting:** ESLint 9 with typescript-eslint

## How it works

The application parses Maven enforcer output to extract:
- `groupId:artifactId:version` patterns
- RequireUpperBoundDeps violations
- DependencyConvergence violations
- Dependency tree paths

It then generates valid `<dependencyManagement>` XML using the highest version for each conflict.

## License

MIT
