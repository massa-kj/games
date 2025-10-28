#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface GameDefinition {
  gameId: string;
  gameTitle: {
    en: string;
    ja: string;
  };
  gameDescription: {
    en: string;
    ja: string;
  };
  category: string;
  author: string;
  minAge: number;
  metadata?: {
    version?: string;
    created?: string;
    license?: string;
  };
  features?: string[];
  techStack?: {
    framework?: string;
    language?: string;
    styling?: string;
    bundler?: string;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'data', 'templates');
const APPS_DIR = path.join(PROJECT_ROOT, 'apps');

function validateGameId(gameId: string): boolean {
  // Check if game ID contains only lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(gameId);
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  return str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(filePath: string, replacements: Record<string, string>): void {
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

function replaceInDirectory(dir: string, replacements: Record<string, string>): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceInDirectory(fullPath, replacements);
    } else if (entry.isFile()) {
      // Only process text files
      const ext = path.extname(entry.name).toLowerCase();
      const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.txt'];

      if (textExtensions.includes(ext)) {
        replaceInFile(fullPath, replacements);
      }
    }
  }
}

function loadGameDefinition(definitionPath: string): GameDefinition {
  try {
    if (!fs.existsSync(definitionPath)) {
      throw new Error(`Game definition file not found: ${definitionPath}`);
    }

    const definitionContent = fs.readFileSync(definitionPath, 'utf-8');
    const definition = JSON.parse(definitionContent) as GameDefinition;

    // Validate against schema
    const schemaPath = path.join(PROJECT_ROOT, 'data', 'game-definition.schema.json');
    if (fs.existsSync(schemaPath)) {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      const ajv = new Ajv();
      addFormats(ajv);
      const validate = ajv.compile(schema);

      if (!validate(definition)) {
        console.error('❌ Game definition validation errors:');
        validate.errors?.forEach(error => {
          console.error(`  - ${error.instancePath || 'root'}: ${error.message}`);
        });
        throw new Error('Game definition validation failed');
      }
    }

    return definition;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in game definition file: ${error.message}`);
    }
    throw error;
  }
}

function createSampleDefinition(gameId: string): string {
  const samplePath = path.join(PROJECT_ROOT, `${gameId}-definition.json`);
  const sampleDefinition: GameDefinition = {
    gameId,
    gameTitle: {
      en: "My Awesome Game",
      ja: "私の素晴らしいゲーム"
    },
    gameDescription: {
      en: "An amazing game for kids that teaches and entertains!",
      ja: "子供たちが学びながら楽しめる素晴らしいゲーム！"
    },
    category: "puzzle",
    author: "Your Name",
    minAge: 4,
    metadata: {
      version: "1.0.0",
      created: new Date().toISOString().split('T')[0],
      license: "MIT"
    },
    features: [
      "Multi-language support",
      "Sound effects",
      "Progressive difficulty",
      "Score tracking"
    ],
    techStack: {
      framework: "React",
      language: "TypeScript",
      styling: "Tailwind CSS",
      bundler: "Vite"
    }
  };

  fs.writeFileSync(samplePath, JSON.stringify(sampleDefinition, null, 2), 'utf-8');
  return samplePath;
}

async function createGame(gameId: string, definitionPath?: string): Promise<void> {
  try {
    // Validate game ID
    if (!validateGameId(gameId)) {
      throw new Error('Game ID must contain only lowercase letters, numbers, and hyphens');
    }

    // Check if game already exists
    const gameDir = path.join(APPS_DIR, gameId);
    if (fs.existsSync(gameDir)) {
      throw new Error(`Game "${gameId}" already exists`);
    }

    // Check if templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      throw new Error('Templates directory not found');
    }

    let definition: GameDefinition;

    if (definitionPath) {
      // Load game definition from file
      console.log(`\n📖 Loading game definition from: ${definitionPath}`);
      definition = loadGameDefinition(definitionPath);

      // Validate that gameId matches
      if (definition.gameId !== gameId) {
        throw new Error(`Game ID mismatch: argument "${gameId}" vs definition "${definition.gameId}"`);
      }
    } else {
      // Create sample definition file and ask user to edit it
      console.log(`\n📝 Creating sample definition file for: ${gameId}`);
      const samplePath = createSampleDefinition(gameId);

      console.log(`✅ Sample definition created: ${samplePath}`);
      console.log('\n📋 Please edit the definition file with your game details, then run:');
      console.log(`   pnpm create-game ${gameId} --definition ${samplePath}`);
      console.log('\nOr use the shorthand:');
      console.log(`   pnpm create-game ${gameId} -d ${samplePath}`);
      return;
    }

    console.log(`\n🎮 Creating game: ${definition.gameTitle.en} (${gameId})`);
    console.log(`📁 Copying template files...`);

    // Copy template to new game directory
    copyDirectory(TEMPLATES_DIR, gameDir);

    // Create replacements map
    const replacements = {
      '{{GAME_ID}}': definition.gameId,
      '{{GAME_ID_CAMEL}}': toCamelCase(definition.gameId),
      '{{GAME_ID_PASCAL}}': toPascalCase(definition.gameId),
      '{{GAME_TITLE_EN}}': definition.gameTitle.en,
      '{{GAME_TITLE_JA}}': definition.gameTitle.ja,
      '{{GAME_DESCRIPTION_EN}}': definition.gameDescription.en,
      '{{GAME_DESCRIPTION_JA}}': definition.gameDescription.ja,
      '{{GAME_CATEGORY}}': definition.category,
      '{{AUTHOR}}': definition.author,
      '{{MIN_AGE}}': definition.minAge.toString(),
      '{{CURRENT_YEAR}}': new Date().getFullYear().toString(),
      '{{VERSION}}': definition.metadata?.version || '1.0.0',
      '{{LICENSE}}': definition.metadata?.license || 'MIT'
    };

    console.log('🔄 Replacing placeholders...');

    // Replace placeholders in all files
    replaceInDirectory(gameDir, replacements);

    console.log(`\n✅ Game "${gameId}" created successfully!`);
    console.log(`📍 Location: ${gameDir}`);
    console.log(`📋 Title: ${definition.gameTitle.en} / ${definition.gameTitle.ja}`);
    console.log(`👤 Author: ${definition.author}`);
    console.log(`🏷️ Category: ${definition.category}`);

    console.log('\n📝 Next steps:');
    console.log(`1. cd apps/${gameId}`);
    console.log('2. pnpm install');
    console.log('3. pnpm dev');
    console.log('4. Start building your game! 🚀');

    // Clean up the sample definition file if it was created
    const samplePath = path.join(PROJECT_ROOT, `${gameId}-definition.json`);
    if (fs.existsSync(samplePath) && definitionPath === samplePath) {
      console.log(`\n🧹 Cleaning up sample definition file: ${samplePath}`);
      fs.unlinkSync(samplePath);
    }

  } catch (error) {
    console.error('❌ Error creating game:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}function showUsage(): void {
  console.log(`
🎮 Game Creator Script

Usage:
  pnpm create-game <game-id> [options]

Options:
  -d, --definition <path>    Path to game definition JSON file
  -h, --help                Show this help message

Examples:
  # Create sample definition file
  pnpm create-game my-awesome-game

  # Create game from definition file
  pnpm create-game my-awesome-game --definition ./my-game-def.json
  pnpm create-game my-awesome-game -d ./my-game-def.json

  # Use sample definition from data/ directory
  pnpm create-game my-awesome-game -d data/game-definition.sample.json

Game ID requirements:
  - Only lowercase letters, numbers, and hyphens
  - Must be unique (not already exist)
  - Must match the gameId in the definition file

Definition file format:
  See data/game-definition.sample.json for a complete example
  Schema: data/game-definition.schema.json

The script will:
  1. Load and validate the game definition
  2. Copy the template from data/templates/
  3. Replace all placeholders with your game data
  4. Create the new game in apps/<game-id>/
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  const gameId = args[0];
  let definitionPath: string | undefined;

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--definition' || arg === '-d') {
      definitionPath = args[i + 1];
      if (!definitionPath) {
        console.error('❌ Error: --definition requires a file path');
        process.exit(1);
      }
      i++; // Skip the next argument as it's the definition path
    }
  }

  await createGame(gameId, definitionPath);
}main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
