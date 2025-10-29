import { globby } from 'globby';
import { parse } from 'react-docgen-typescript';
import { readFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import type {
  ComponentDocumentation,
  ModuleDocumentation,
  DocumentationResult,
  PropInfo,
  ExampleInfo,
  GenerateOptions
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');

/**
 * Extract documentation from TypeScript files using react-docgen-typescript
 */
export async function extractDocumentation(options: GenerateOptions): Promise<DocumentationResult> {
  const { modules: modulePatterns, verbose } = options;

  if (verbose) {
    console.log('🔍 Searching for files with patterns:', modulePatterns);
  }

  // Find all matching files
  const filePaths = await globby(modulePatterns, {
    cwd: PROJECT_ROOT,
    absolute: true,
    ignore: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/node_modules/**',
      '**/index.{ts,tsx}' // Exclude index files to avoid re-export duplicates
    ]
  });

  if (verbose) {
    console.log(`📁 Found ${filePaths.length} files to process`);
  }

  // Parse TypeScript files
  const parser = parse(filePaths, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => {
      // Skip built-in HTML props for React components
      if (prop.declarations !== undefined && prop.declarations.length > 0) {
        const hasPropAdditionalDescription = prop.declarations.find(declaration => {
          return !declaration.fileName.includes('node_modules');
        });
        return Boolean(hasPropAdditionalDescription);
      }
      return true;
    }
  });

  // Group by module
  const moduleMap = new Map<string, ComponentDocumentation[]>();
  const processedComponents = new Set<string>();

  for (const componentInfo of parser) {
    // Use the filePath property from react-docgen-typescript
    const absolutePath = (componentInfo as any).filePath || '';
    const filePath = absolutePath ? relative(PROJECT_ROOT, absolutePath) : '';
    const moduleName = extractModuleName(filePath);

    // Create unique key to avoid duplicates
    const uniqueKey = `${componentInfo.displayName}:${filePath}`;
    if (processedComponents.has(uniqueKey)) {
      continue;
    }
    processedComponents.add(uniqueKey);

    if (verbose) {
      console.log(`📄 Processing: ${componentInfo.displayName} in ${filePath}`);
    }

    const doc: ComponentDocumentation = {
      displayName: componentInfo.displayName,
      filePath,
      description: componentInfo.description || undefined,
      props: extractProps(componentInfo.props || {}),
      examples: extractExamplesFromTags((componentInfo as any).tags || {}),
      type: determineComponentType(componentInfo.displayName, filePath),
      remarks: extractRemarksFromTags((componentInfo as any).tags || {}),
      returns: extractReturnsFromTags((componentInfo as any).tags || {})
    };



    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, []);
    }
    moduleMap.get(moduleName)!.push(doc);
  }

  // Convert to structured result
  const modulesList: ModuleDocumentation[] = Array.from(moduleMap.entries()).map(([name, components]) => ({
    moduleName: name,
    components: components.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }));

  const totalComponents = modulesList.reduce((sum, mod) => sum + mod.components.length, 0);

  return {
    modules: modulesList.sort((a, b) => a.moduleName.localeCompare(b.moduleName)),
    metadata: {
      generatedAt: new Date().toISOString(),
      version: getPackageVersion(),
      totalComponents
    }
  };
}

function extractModuleName(filePath: string): string {
  const parts = filePath.split('/');
  const coreIndex = parts.indexOf('core');
  if (coreIndex >= 0 && coreIndex + 1 < parts.length) {
    return parts[coreIndex + 1];
  }
  return 'unknown';
}

function extractProps(propsInfo: any): PropInfo[] {
  return Object.entries(propsInfo).map(([name, info]: [string, any]) => ({
    name,
    type: info.type?.name || 'unknown',
    defaultValue: info.defaultValue?.value,
    description: info.description,
    required: info.required
  }));
}

function extractExamplesFromTags(tags: any): ExampleInfo[] {
  const examples: ExampleInfo[] = [];

  if (tags.example) {
    // Multiple code blocks in the example tag
    const exampleText = tags.example;
    const codeBlockRegex = /```(\w*)\s*\n([\s\S]*?)\n?```/g;

    let match;
    while ((match = codeBlockRegex.exec(exampleText)) !== null) {
      examples.push({
        code: match[2].trim(),
        language: match[1] || 'typescript'
      });
    }
  }

  return examples;
}

function extractExamples(description: string): ExampleInfo[] {
  const examples: ExampleInfo[] = [];

  // More flexible regex to match @example blocks
  const exampleRegex = /@example\s*\n\s*```(\w*)\s*\n([\s\S]*?)```/g;

  let match;
  while ((match = exampleRegex.exec(description)) !== null) {
    examples.push({
      code: match[2].trim(),
      language: match[1] || 'typescript'
    });
  }

  return examples;
}function extractRemarksFromTags(tags: any): string | undefined {
  return tags.remarks || undefined;
}

function extractReturnsFromTags(tags: any): string | undefined {
  return tags.returns || undefined;
}

function extractRemarks(description: string): string | undefined {
  const remarksMatch = description.match(/@remarks\s+(.*?)(?:\n@|\n\n|$)/);
  return remarksMatch ? remarksMatch[1].trim() : undefined;
}

function extractReturns(description: string): string | undefined {
  const returnsMatch = description.match(/@returns\s+(.*?)(?:\n@|\n\n|$)/);
  return returnsMatch ? returnsMatch[1].trim() : undefined;
}

function determineComponentType(displayName: string, filePath: string): 'component' | 'hook' | 'utility' {
  if (displayName.startsWith('use')) {
    return 'hook';
  }
  if (filePath.includes('/ui/') || filePath.includes('/components/')) {
    return 'component';
  }
  return 'utility';
}

function getPackageVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}
