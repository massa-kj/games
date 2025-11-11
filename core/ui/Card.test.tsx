/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card.js';

describe('Card', () => {
  describe('basic functionality', () => {
    it('should render with children', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Card className="custom-class">Test</Card>);

      const card = screen.getByText('Test');
      expect(card).toHaveClass('custom-class');
    });

    it('should have core card class', () => {
      render(<Card>Test</Card>);

      const card = screen.getByText('Test');
      expect(card).toHaveClass('game-card');
    });

    it('should apply padding classes', () => {
      render(<Card padding="lg">Large</Card>);

      const card = screen.getByText('Large');
      expect(card).toHaveClass('padding-lg');
    });

    it('should apply interactive class when needed', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('interactive');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render as button when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Button Card</Card>);

      const card = screen.getByRole('button');
      expect(card.tagName).toBe('BUTTON');
    });

    it('should render as div when no onClick is provided', () => {
      render(<Card>Div Card</Card>);

      const card = screen.getByText('Div Card');
      expect(card.tagName).toBe('DIV');
    });

    it('should apply interactive class when hoverable is true', () => {
      render(<Card hoverable>Hoverable</Card>);

      const card = screen.getByText('Hoverable');
      expect(card).toHaveClass('interactive');
    });
  });
});
