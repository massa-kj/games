/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeButton } from './HomeButton.js';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('HomeButton', () => {
  beforeEach(() => {
    mockLocation.href = '';
  });

  describe('rendering', () => {
    it('should render with default icon only', () => {
      render(<HomeButton />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Home');

      // Check for SVG icon
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with text when showText is true', () => {
      render(<HomeButton showText={true} text="Back to Home" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<HomeButton showText={true} text="Return to Site" />);

      expect(screen.getByText('Return to Site')).toBeInTheDocument();
    });

    it('should apply core button classes', () => {
      render(<HomeButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('core-button'); // core button class
    });

    it('should apply variant classes', () => {
      render(<HomeButton variant="primary" size="lg" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('variant-primary'); // variant class
      expect(button).toHaveClass('size-lg'); // size class
    });

    it('should apply custom className', () => {
      render(<HomeButton className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('interactions', () => {
    it('should navigate to root by default', () => {
      render(<HomeButton />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockLocation.href).toBe('/games/');
    });

    it('should call custom onClick handler when provided', () => {
      const handleClick = vi.fn();
      render(<HomeButton onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(mockLocation.href).toBe(''); // Should not navigate when custom handler is provided
    });

    it('should pass through other button props', () => {
      render(<HomeButton disabled data-testid="home-btn" />);

      const button = screen.getByTestId('home-btn');
      expect(button).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper title attribute', () => {
      render(<HomeButton text="Go Home" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Go Home');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<HomeButton onClick={handleClick} />);

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('icon and text combination', () => {
    it('should show icon only by default', () => {
      render(<HomeButton text="Home" />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('should show both icon and text when showText is true', () => {
      render(<HomeButton text="Home" showText={true} />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(svg).toHaveClass('mr-2'); // Icon should have margin when text is shown
    });

    it('should not add margin to icon when text is not shown', () => {
      render(<HomeButton />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).not.toHaveClass('mr-2');
    });
  });
});
