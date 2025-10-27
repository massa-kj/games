#!/usr/bin/env tsx

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const appsDir = join(process.cwd(), 'apps');
const appName = process.argv[2];

if (!appName) {
  console.log('Available apps:');
  const apps = readdirSync(appsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  apps.forEach(app => console.log(`  - ${app}`));
  console.log('\nUsage: pnpm dev <app-name>');
  process.exit(1);
}

const appDir = join(appsDir, appName);
const configPath = join(appDir, 'vite.config.ts');

if (!existsSync(appDir)) {
  console.error(`App "${appName}" not found in apps directory`);
  process.exit(1);
}

if (!existsSync(configPath)) {
  console.error(`vite.config.ts not found for app "${appName}"`);
  process.exit(1);
}

console.log(`Starting development server for ${appName}...`);

const vite = spawn('vite', ['--config', configPath], {
  stdio: 'inherit',
  cwd: process.cwd()
});

vite.on('close', (code) => {
  process.exit(code || 0);
});
