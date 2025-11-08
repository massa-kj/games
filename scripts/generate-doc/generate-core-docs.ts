#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { extractDocumentation } from './lib/extractDocs.js';
import { renderMarkdown } from './lib/renderMarkdown.js';
import type { GenerateOptions } from './lib/types.js';

const program = new Command();

program
  .name('generate-core-docs')
  .description('Generate documentation from TypeScript files in core/ directory')
  .version('1.0.0');

program
  .option(
    '--modules <patterns...>',
    'Glob patterns for target files',
    ['core/{audio,hooks,i18n,storage,themes,ui,utils}/**/*.{ts,tsx}']
  )
  .option(
    '--out <path>',
    'Output file path',
    'docs/core.md'
  )
  .option(
    '--verbose',
    'Enable verbose logging',
    false
  )
  .action(async (options) => {
    try {
      await generateDocs(options);
    } catch (error) {
      console.error('❌ Error generating documentation:');
      console.error(error);
      process.exit(1);
    }
  });

async function generateDocs(cliOptions: any) {
  const options: GenerateOptions = {
    modules: cliOptions.modules,
    outputPath: cliOptions.out,
    verbose: cliOptions.verbose
  };

  if (options.verbose) {
    console.log('🚀 Starting documentation generation...');
    console.log('Options:', options);
  }

  // Extract documentation
  const docs = await extractDocumentation(options);

  if (options.verbose) {
    console.log(`📊 Extracted ${docs.metadata.totalComponents} components from ${docs.modules.length} modules`);
  }

  // Render as Markdown
  const markdown = renderMarkdown(docs);

  // Ensure output directory exists
  const outputDir = dirname(options.outputPath);
  mkdirSync(outputDir, { recursive: true });

  // Write output file
  writeFileSync(options.outputPath, markdown, 'utf-8');

  console.log(`✅ Documentation generated successfully!`);
  console.log(`📄 Output: ${options.outputPath}`);

  if (options.verbose) {
    console.log(`📈 Stats: ${docs.metadata.totalComponents} components, ${markdown.length} characters`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
