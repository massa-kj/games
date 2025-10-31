# Game Development Guide

This guide explains how to create new games using the automated template system. The process has been streamlined to ensure consistency and reduce manual configuration.

## Quick Start

### Creating a New Game

Creating a new game is a few step process using a game definition file:

```bash
# 1. Generate sample definition
pnpm create-game test-game

# 2. Edit it (test-game-definition.json)

# 3. Create game from definition
pnpm create-game test-game -d test-game-definition.json

# Test game
cd apps/test-game
pnpm install
pnpm dev

# Build the game
pnpm build
# Build the game registry (from project root)
cd ../..
pnpm build:registry
```

### Command Options
```bash
# Generate sample definition
pnpm create-game <game-id>

# Create from definition file
pnpm create-game <game-id> --definition <path>
pnpm create-game <game-id> -d <path>

# Show help
pnpm create-game --help
```

The script will:
1. � Load and validate your game definition
2. 📁 2. Copy the template from `data/game-creation/templates/`
3. 🔄 Replace all placeholders with your game data
4. ✅ Create a fully configured game in `apps/my-awesome-game/`

### Related Files

**Template and Definition Files**:

```
data/game-creation/
├── templates/                   # Template files for new games
├── game-definition.sample.json  # Sample game definition
└── game-definition.schema.json  # JSON Schema for validation
```

**Script Location**: `scripts/create-game.ts`

**Generated games**: `apps/<game-id>/`

## Game Definition File

The game definition file is a JSON file that contains all the metadata and configuration for your game. Here's the complete structure:

### Required Fields

- `gameId`: Unique identifier (kebab-case)
- `gameTitle`: Localized titles (en/ja)
- `gameDescription`: Localized descriptions (en/ja)
- `category`: Game category (`memory`, `puzzle`, `action`, `strategy`, `educational`, `arcade`, `adventure`)
- `author`: Creator's name
- `minAge`: Minimum age (1-18)

### Optional Fields

- `metadata`: Version, creation date, license
- `features`: List of game features
- `techStack`: Technology information

### Game ID Requirements

- Use lowercase letters, numbers, and hyphens only
- Must be unique (not already exist)
- Must match the `gameId` field in your definition file
- Examples: `memory-cards`, `puzzle-game`, `math-quiz`

## Template System

### Template Structure

The template in `data/game-creation/templates/` includes:

```
data/game-creation/templates/
├── game.config.json          # Game metadata and configuration
├── package.json              # NPM package configuration
├── vite.config.ts            # Vite build configuration
├── index.html                # Main HTML file
├── README.md                 # Documentation template
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── src/
    ├── App.tsx               # Main React component
    ├── main.tsx              # Entry point
    ├── types.ts              # TypeScript type definitions
    ├── styles.css            # Custom styles
    ├── components/           # Game-specific components
    ├── hooks/                # Custom React hooks
    ├── assets/               # Game assets (images, sounds)
    └── data/
        └── locales/
            ├── en.json       # English translations
            └── ja.json       # Japanese translations
```

### Template Maintenance

#### Updating Sample Definition

When you need to change the default values for new games:

1. Edit `game-definition.sample.json`
2. The `createSampleDefinition` function will automatically use these values
3. No need to modify the script code
4. **Important**: The sample file must exist - there is no fallback to hardcoded values

#### Updating Templates

When you need to change the template structure:

1. Modify files in `templates/` directory
2. Use `{{PLACEHOLDER}}` syntax for values to be replaced
3. Test with a new game creation

#### Available Placeholders

The template system uses the following placeholders that get automatically replaced:

- `{{GAME_ID}}` - Game identifier (kebab-case)
- `{{GAME_ID_CAMEL}}` - Game ID in camelCase
- `{{GAME_ID_PASCAL}}` - Game ID in PascalCase
- `{{GAME_TITLE_EN}}` - English title
- `{{GAME_TITLE_JA}}` - Japanese title
- `{{GAME_DESCRIPTION_EN}}` - English description
- `{{GAME_DESCRIPTION_JA}}` - Japanese description
- `{{GAME_CATEGORY}}` - Game category
- `{{AUTHOR}}` - Author name
- `{{MIN_AGE}}` - Minimum age
- `{{CURRENT_YEAR}}` - Current year
- `{{VERSION}}` - Game version
- `{{LICENSE}}` - License type

## Core Integration

### Required Integrations

All games must integrate with the core platform APIs:

#### 🌐 Internationalization
```tsx
import { useSettings } from '@core/hooks';
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

export default function MyGame() {
  const { settings } = useSettings();
  const translations = settings.lang === 'en' ? enTranslations : jaTranslations;

  return <h1>{translations.title}</h1>;
}
```

#### 🔊 Audio System
```tsx
import { useSound } from '@core/hooks';

export default function MyGame() {
  const { playSound } = useSound();

  const handleClick = () => {
    playSound('click');
  };

  return <button onClick={handleClick}>Click me!</button>;
}
```

#### 🎨 UI Components
```tsx
import { Button, GameHeader, Card } from '@core/ui';

export default function MyGame() {
  return (
    <div>
      <GameHeader gameId="my-game" />
      <Card>
        <Button onClick={() => console.log('Start!')}>
          Start Game
        </Button>
      </Card>
    </div>
  );
}
```

#### ⚙️ Settings & Storage
```tsx
import { useSettings } from '@core/hooks';

export default function MyGame() {
  const { settings, updateSettings } = useSettings();

  return (
    <div>
      <p>Sound: {settings.soundEnabled ? 'On' : 'Off'}</p>
      <p>Language: {settings.lang}</p>
    </div>
  );
}
```

## Configuration Files

### game.config.json

The game configuration file is automatically generated with your inputs:

#### Key Configuration Points

- **ID**: Must match the directory name
- **Entry**: Path where the game is served
- **Languages**: Supported locales
- **Icon**: Game icon path (recommended: SVG format in `site/public/images/icons/`)

### Game Icons

Each game should have a custom icon that represents its theme and gameplay:

- **Format**: SVG recommended (scalable, lightweight)
- **Size**: Designed for 64x64px viewport but should be scalable
- **Location**: `apps/{game-id}/public/icon.svg` (inside each game directory)
- **Configuration**: Set path in `game.config.json` as `/apps/{game-id}/icon.svg`
- **Resolution**: Base URL (`/games/`) is automatically prepended by the platform
- **Style**: Simple, recognizable, consistent with game theme
- **Fallback**: If icon fails to load, defaults to `default.svg` then `🎮` emoji

**Icon Guidelines:**
- Use clear, simple shapes that work at small sizes
- Maintain good contrast for accessibility
- Consider the game's primary colors and theme
- Test icon visibility on both light and dark backgrounds
- Each game is self-contained with its own icon

**Self-Contained Game Structure:**
```
apps/my-game/
├── public/
│   └── icon.svg          # Game icon (required)
├── src/
│   └── ...
├── game.config.json      # References icon as "/apps/my-game/icon.svg"
└── ...
```

## Quality Checklist

Before submitting your game, ensure:

- [ ] 🌐 Multi-language support (English + Japanese)
- [ ] 🔊 Audio integration with core sound system
- [ ] 📱 Responsive design (mobile-friendly)
- [ ] ♿ Accessibility features (keyboard navigation, screen reader support)
- [ ] 🎨 Consistent UI using core components
- [ ] 🎯 Custom game icon (`public/icon.svg`, SVG format recommended)
- [ ] ⚙️ Settings persistence
- [ ] 🏠 Home button functionality
- [ ] 📊 Game registry builds successfully
- [ ] 🧪 No console errors
- [ ] 📝 Updated documentation

## Testing

### Local Testing

```bash
# Test individual game
cd apps/my-game
pnpm dev

# Test in full platform
cd ../..
pnpm cleanbuild && pnpm preview
```

### Build Testing

```bash
# Build individual game
cd apps/my-game
pnpm build

# Build entire platform
cd ../..
pnpm build
```

## Definition File Validation

The system includes JSON schema validation to ensure your definition file is correct:

- **Schema file**: `data/game-creation/game-definition.schema.json`
- **Sample file**: `data/game-creation/game-definition.sample.json`
- Validation runs automatically when creating games
- VS Code provides IntelliSense and validation when editing definition files

### Common Validation Errors

1. **Invalid gameId**: Must be lowercase, numbers, and hyphens only
2. **Missing required fields**: All required fields must be present
3. **Invalid category**: Must be one of the predefined categories
4. **Invalid minAge**: Must be between 1 and 18

## Advanced Customization

### Custom Assets

Place game-specific assets in `src/assets/`:

```
src/assets/
├── images/
│   ├── characters/
│   └── backgrounds/
├── sounds/
│   ├── effects/
│   └── music/
└── data/
    └── levels.json
```

### Custom Components

Create reusable components in `src/components/`:

```tsx
// src/components/GameBoard.tsx
import { Card } from '@core/ui';

interface GameBoardProps {
  children: React.ReactNode;
}

export function GameBoard({ children }: GameBoardProps) {
  return (
    <Card className="game-board p-6">
      {children}
    </Card>
  );
}
```

### Custom Hooks

Create game-specific hooks in `src/hooks/`:

```tsx
// src/hooks/useGameState.ts
import { useState, useCallback } from 'react';

export function useGameState() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const increaseScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  return { score, level, increaseScore };
}
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all placeholders are replaced correctly
2. **Import Errors**: Check that `@core` and `@` aliases are configured
3. **Translation Missing**: Add all required keys to both `en.json` and `ja.json`
4. **Audio Not Working**: Verify sound files are in correct format and path

### Getting Help

- Check existing games in `apps/` for reference
- Review core components in `core/ui/`
- Test with the development server before building
