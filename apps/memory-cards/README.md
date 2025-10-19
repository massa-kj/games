# 🧩 Memory Cards Game

A memory card matching game featuring cute animals, designed for young children aged 3 and up.

## Features

- 🎮 Multiple difficulty levels (2x2 to 3x4 grids)
- 🌍 Bilingual support (Japanese/English)
- 🎨 Colorful and child-friendly UI
- 📱 Responsive design for mobile and desktop
- ⭐ Star rating system based on performance
- 🎵 Audio feedback (when enabled)

## How to Play

1. Select your preferred difficulty level
2. Click cards to flip them and reveal animals
3. Find matching pairs of animals
4. Complete all pairs to win!

## Development

This game is built with:
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Core shared components from the games platform

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Game Architecture

The game follows the shared architecture defined in the core platform:

- **Core Components**: Shared UI components (Button, Modal, etc.)
- **Game Logic**: Custom React hooks for state management
- **Internationalization**: JSON-based translations
- **Responsive Design**: Mobile-first CSS with Tailwind

## Difficulty Levels

- **Easy (2x2)**: 2 pairs, perfect for beginners
- **Medium (2x3)**: 3 pairs, good for learning
- **Hard (2x4)**: 4 pairs, more challenging
- **Expert (3x4)**: 6 pairs, for skilled players
