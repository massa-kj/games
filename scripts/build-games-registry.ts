#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { GameManifest } from '../core/types.js';

function loadManifest(filePath: string): GameManifest | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as GameManifest;
  } catch (error) {
    console.error(`Failed to load manifest: ${filePath}`, error);
    return null;
  }
}

function findManifests(): GameManifest[] {
  const appsDir = join(process.cwd(), 'apps');
  const manifests: GameManifest[] = [];

  if (!existsSync(appsDir)) {
    console.warn('Apps directory not found:', appsDir);
    return manifests;
  }

  const appDirs = readdirSync(appsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const appDir of appDirs) {
    const manifestPath = join(appsDir, appDir, 'game.config.json');
    if (existsSync(manifestPath)) {
      const manifest = loadManifest(manifestPath);
      if (manifest) {
        manifests.push(manifest);
      }
    } else {
      console.warn(`No manifest found for app: ${appDir}`);
    }
  }

  return manifests;
}

function generateRegistry(): void {
  console.log('🔄 Building games registry...\n');

  const manifests = findManifests();

  console.log(`Found ${manifests.length} games:`);
  manifests.forEach(manifest => {
    console.log(`  - ${manifest.id}: ${manifest.title.ja || manifest.title.en}`);
  });

  // Sort by ID for consistent output
  manifests.sort((a, b) => a.id.localeCompare(b.id));

  const outputDir = join(process.cwd(), 'dist', 'data');
  const outputPath = join(outputDir, 'games.json');
  const output = JSON.stringify(manifests, null, 2) + '\n';

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, output, 'utf-8');

  console.log(`\n✅ Registry written to: ${outputPath}`);
}

function main() {
  try {
    generateRegistry();
  } catch (error) {
    console.error('❌ Failed to build registry:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
