#!/usr/bin/env tsx

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Load the schema
const schemaPath = join(process.cwd(), 'data', 'game-manifest.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

// Initialize AJV with formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

interface ValidationResult {
  filePath: string;
  valid: boolean;
  errors?: string[];
}

function validateManifest(filePath: string): ValidationResult {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const manifest = JSON.parse(content);
    
    const valid = validate(manifest);
    
    if (!valid && validate.errors) {
      const errors = validate.errors.map(error => {
        const path = error.instancePath || 'root';
        return `${path}: ${error.message}`;
      });
      
      return { filePath, valid: false, errors };
    }
    
    return { filePath, valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { filePath, valid: false, errors: [`Parse error: ${message}`] };
  }
}

function findManifests(): string[] {
  const appsDir = join(process.cwd(), 'apps');
  const manifests: string[] = [];
  
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
      manifests.push(manifestPath);
    }
  }
  
  return manifests;
}

function main() {
  console.log('🔍 Validating game manifests...\n');
  
  const manifests = findManifests();
  
  if (manifests.length === 0) {
    console.log('ℹ️  No game manifests found.');
    return;
  }
  
  const results = manifests.map(validateManifest);
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;
  
  // Print results
  results.forEach(result => {
    const status = result.valid ? '✅' : '❌';
    const relativePath = result.filePath.replace(process.cwd(), '.');
    
    console.log(`${status} ${relativePath}`);
    
    if (!result.valid && result.errors) {
      result.errors.forEach(error => {
        console.log(`   ⚠️  ${error}`);
      });
      console.log();
    }
  });
  
  // Summary
  console.log(`\n📊 Summary: ${validCount} valid, ${invalidCount} invalid`);
  
  if (invalidCount > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
