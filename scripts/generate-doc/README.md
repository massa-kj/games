# Core Documentation Generator

Script to automatically generate Markdown documentation from TypeScript/TSDoc comments.

## Overview

- **Target**: TypeScript files under `core/`
- **Input**: TSDoc comments (`/** */` format)
- **Output**: Structured Markdown files
- **Libraries**: `react-docgen-typescript`, `commander`

## File Structure

```
scripts/generate-doc/
├── generate-core-docs.ts    # CLI entry point
├── README.md               # This file
└── lib/
    ├── types.ts           # Type definitions
    ├── extractDocs.ts     # TSDoc parsing & extraction
    └── renderMarkdown.ts  # Markdown generation
```

## Usage

### Basic Execution
```bash
pnpm run build:docs
```

### Execution with Options
```bash
# Specify output destination
pnpm run build:docs --out docs/api.md

# Specify target files
pnpm run build:docs --modules "core/ui/**/*.tsx"

# With verbose logging
pnpm run build:docs --verbose
```

### All Options
| Option | Description | Default |
|--------|-------------|---------|
| `--modules <patterns...>` | Glob patterns for target files | `core/{ui,hooks,utils}/**/*.{ts,tsx}` |
| `--out <path>` | Output destination | `docs/core.md` |
| `--verbose` | Verbose logging | `false` |

## How to Write TSDoc

Please refer to the [Document Comment Guide (TSDoc Style)](../../docs/doc-comment-guide.md).

### Supported Tags
- `@param` - Property description
- `@returns` - Return value description
- `@remarks` - Additional information
- `@example` - Usage examples (multiple allowed)

## Maintenance

### Common Issues and Solutions

#### 1. Components not being extracted
- Verify that TSDoc comments (`/** */`) are being used
- Re-exports from `index.ts` are automatically excluded

#### 2. Examples not displayed
- Check if there's a blank line after `@example`
- Verify code is wrapped in code blocks (` ```tsx `)

#### 3. Duplicate components displayed
- Check if the same component is defined in multiple files
- Review the duplicate removal logic in `lib/extractDocs.ts`

### Role of Each File

#### `generate-core-docs.ts`
- CLI interface
- Option parsing
- File output

#### `lib/extractDocs.ts`
- File parsing with `react-docgen-typescript`
- Data extraction from TSDoc tags
- Module classification and duplicate removal

#### `lib/renderMarkdown.ts`
- Convert extracted data to Markdown format
- Generate tables and code blocks

#### `lib/types.ts`
- Type definitions used throughout

## Extension Methods

### Intermediate JSON Output (for integration with other tools)
1. Add a function in `lib/extractDocs.ts` to export intermediate JSON structure
2. Add `--json` option to `generate-core-docs.ts`

### Adding New Output Formats (HTML, etc.)
1. Create `lib/renderHtml.ts`
2. Add `--format` option to `generate-core-docs.ts`
3. Call appropriate render function based on output format

### Adding New TSDoc Tags
1. Update types in `lib/types.ts`
2. Add extraction logic in `lib/extractDocs.ts`
3. Add output logic in `lib/renderMarkdown.ts`

## Troubleshooting

### Script not working
```bash
# Check dependencies
pnpm install

# Check TypeScript errors
npx tsc --noEmit scripts/generate-doc/generate-core-docs.ts
```

### Empty output
```bash
# Check if target files are found
pnpm run build:docs --verbose
```

### Out of memory errors
- Narrow down the number of target files with `--modules`
- Add large files to exclusion patterns
