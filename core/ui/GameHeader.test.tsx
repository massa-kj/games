import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHeader } from './GameHeader';
import type { GameSettingControl } from './GameSettingsModal';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('GameHeader', () => {
  it('renders with default props', () => {
    render(<GameHeader />);

    // Should show home button by default
    expect(screen.getByTitle('Home')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<GameHeader title="Test Game" />);

    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  it('hides home button when showHomeButton is false', () => {
    render(<GameHeader showHomeButton={false} />);

    expect(screen.queryByTitle('Home')).not.toBeInTheDocument();
  });

  it('shows settings button when gameSettings are provided', () => {
    const gameSettings: GameSettingControl[] = [
      {
        id: 'difficulty',
        type: 'select',
        label: 'Difficulty',
        value: 'normal',
        onChange: vi.fn(),
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'normal', label: 'Normal' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ];

    render(<GameHeader gameSettings={gameSettings} />);

    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('hides settings button when showSettingsButton is false', () => {
    const gameSettings: GameSettingControl[] = [
      {
        id: 'difficulty',
        type: 'select',
        label: 'Difficulty',
        value: 'normal',
        onChange: vi.fn(),
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'normal', label: 'Normal' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ];

    render(<GameHeader showSettingsButton={false} gameSettings={gameSettings} />);

    expect(screen.queryByTitle('Settings')).not.toBeInTheDocument();
  });

  it('calls custom onHomeClick when provided', () => {
    const mockOnHomeClick = vi.fn();
    render(<GameHeader onHomeClick={mockOnHomeClick} />);

    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);

    expect(mockOnHomeClick).toHaveBeenCalled();
  });

  it('navigates to root when no custom onHomeClick is provided', () => {
    render(<GameHeader />);

    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);

    expect(mockLocation.href).toBe('/games/');
  });

  it('opens settings modal when settings button is clicked', () => {
    const gameSettings: GameSettingControl[] = [
      {
        id: 'difficulty',
        type: 'select',
        label: 'Difficulty',
        value: 'normal',
        onChange: vi.fn(),
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'normal', label: 'Normal' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ];

    render(<GameHeader gameSettings={gameSettings} />);

    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    // Settings modal should be open
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
  });

  it('renders custom actions', () => {
    const actions = [
      {
        id: 'pause',
        type: 'button' as const,
        label: 'Pause',
        onClick: vi.fn(),
      },
      {
        id: 'restart',
        type: 'button' as const,
        label: 'Restart',
        onClick: vi.fn(),
      },
    ];

    render(<GameHeader actions={actions} />);

    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
  });

  it('renders custom content', () => {
    const leftContent = <div>Custom Left</div>;
    const rightContent = <div>Custom Right</div>;

    render(
      <GameHeader
        leftContent={leftContent}
        rightContent={rightContent}
      />
    );

    expect(screen.getByText('Custom Left')).toBeInTheDocument();
    expect(screen.getByText('Custom Right')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GameHeader className="custom-class" />);

    const header = container.querySelector('.game-header');
    expect(header).toHaveClass('custom-class');
  });

  it('applies different variants correctly', () => {
    const { container, rerender } = render(<GameHeader variant="compact" />);

    let header = container.querySelector('.game-header');
    expect(header).toHaveClass('min-h-[48px]', 'p-3');

    rerender(<GameHeader variant="minimal" />);
    header = container.querySelector('.game-header');
    expect(header).toHaveClass('min-h-[40px]', 'p-2', 'border-none');
  });

  it('renders custom action with render function', () => {
    const actions = [
      {
        id: 'custom',
        type: 'custom' as const,
        label: 'Custom',
        render: () => <div>Custom Rendered Content</div>,
      },
    ];

    render(<GameHeader actions={actions} />);

    expect(screen.getByText('Custom Rendered Content')).toBeInTheDocument();
  });

  it('passes homeButtonProps correctly', () => {
    render(
      <GameHeader
        homeButtonProps={{
          text: 'Back to Menu',
          showText: true,
          variant: 'primary',
        }}
      />
    );

    expect(screen.getByText('Back to Menu')).toBeInTheDocument();
  });

  it('passes settingsModalProps correctly', () => {
    const gameSettings: GameSettingControl[] = [
      {
        id: 'difficulty',
        type: 'select',
        label: 'Difficulty',
        value: 'normal',
        onChange: vi.fn(),
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'normal', label: 'Normal' },
          { value: 'hard', label: 'Hard' },
        ],
      },
    ];

    render(
      <GameHeader
        gameSettings={gameSettings}
        settingsModalProps={{
          title: 'Custom Settings Title',
          texts: {
            close: 'Close Modal',
          },
        }}
      />
    );

    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Custom Settings Title')).toBeInTheDocument();
    expect(screen.getByText('Close Modal')).toBeInTheDocument();
  });
});
