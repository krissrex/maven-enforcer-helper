# Architecture

Simple architecture for the Maven Enforcer Helper SPA.

## Core Components

```
App
├── TextInput          # Paste maven enforcer output
├── ParseButton        # Trigger parsing
├── ErrorDisplay       # Show parse errors
├── ConflictList       # Display found conflicts
│   └── ConflictCard   # Individual conflict details
└── XmlOutput          # Generated dependencyManagement XML
```

## Data Flow

1. User pastes maven enforcer output into TextInput
2. ParseButton triggers parser
3. Parser extracts conflicts (returns Result type)
4. On success: render ConflictList + XmlOutput
5. On error: render ErrorDisplay

## Key Modules

### parsers/mavenParser.ts
Parse maven-enforcer-plugin output:
- Extract groupId:artifactId:version
- Identify RequireUpperBoundDeps violations
- Identify DependencyConvergence violations
- Build dependency tree paths

Types:
```typescript
type Conflict = {
  groupId: string
  artifactId: string
  versions: string[]
  selectedVersion: string
  paths: DependencyPath[]
}

type ParseResult = 
  | { type: 'success'; conflicts: Conflict[] }
  | { type: 'error'; message: string }
```

### utils/xmlGenerator.ts
Generate `<dependencyManagement>` XML from conflicts:
- Use highest version for each conflict
- Output valid Maven XML

### components/ConflictList.tsx
Display conflicts in readable format:
- Group by artifact
- Show version conflicts
- Show dependency paths

### components/XmlOutput.tsx
Display generated XML with:
- Copy to clipboard button
- Syntax highlighting (optional, can be simple)

## State Management

Simple useState in App.tsx:
```typescript
const [input, setInput] = useState('')
const [result, setResult] = useState<ParseResult | null>(null)
```

## Styling

Vanilla CSS:
- `App.css` - layout
- `TextInput.css` - input styling
- `ConflictList.css` - conflict display
- `XmlOutput.css` - code block styling

Use CSS custom properties for colors, support dark mode.

## Dependencies

Only React (already installed). No state management libraries needed.
