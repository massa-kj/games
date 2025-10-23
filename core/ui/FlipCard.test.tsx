/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlipCard } from './FlipCard.js';

describe('FlipCard', () => {
  describe('basic functionality', () => {
    it('should render with back content when not flipped', () => {
      render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back Side</div>}
          frontContent={<div>Front Side</div>}
        />
      );

      expect(screen.getByText('Back Side')).toBeInTheDocument();
    });

    it('should have core flip card class', () => {
      const { container } = render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
        />
      );

      const flipCard = container.querySelector('.core-flip-card');
      expect(flipCard).toBeInTheDocument();
    });

    it('should apply flipped class when isFlipped is true', () => {
      const { container } = render(
        <FlipCard
          isFlipped={true}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
        />
      );

      const inner = container.querySelector('.core-flip-card-inner');
      expect(inner).toHaveClass('flipped');
    });

    it('should apply disabled class when disabled', () => {
      const { container } = render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
          disabled={true}
        />
      );

      const flipCard = container.querySelector('.core-flip-card');
      expect(flipCard).toHaveClass('disabled');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
          onClick={handleClick}
        />
      );

      const flipCard = screen.getByText('Back').closest('.core-flip-card');
      fireEvent.click(flipCard!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
          onClick={handleClick}
          disabled={true}
        />
      );

      const flipCard = screen.getByText('Back').closest('.core-flip-card');
      fireEvent.click(flipCard!);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('overlay content', () => {
    it('should render overlay content when provided', () => {
      render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
          overlayContent={<div>Overlay</div>}
        />
      );

      expect(screen.getByText('Overlay')).toBeInTheDocument();
    });

    it('should not render overlay when not provided', () => {
      const { container } = render(
        <FlipCard
          isFlipped={false}
          backContent={<div>Back</div>}
          frontContent={<div>Front</div>}
        />
      );

      const overlay = container.querySelector('.core-flip-card-overlay');
      expect(overlay).not.toBeInTheDocument();
    });
  });
});
