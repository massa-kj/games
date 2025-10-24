/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarsRating } from './StarsRating.js';

describe('StarsRating', () => {
  describe('basic functionality', () => {
    it('should render with correct number of stars', () => {
      render(<StarsRating rating={3} maxStars={5} />);

      const container = screen.getByRole('img');
      expect(container.children).toHaveLength(5);
    });

    it('should use default maxStars of 5', () => {
      render(<StarsRating rating={3} />);

      const container = screen.getByRole('img');
      expect(container.children).toHaveLength(5);
    });

    it('should use custom maxStars', () => {
      render(<StarsRating rating={2} maxStars={3} />);

      const container = screen.getByRole('img');
      expect(container.children).toHaveLength(3);
    });

    it('should apply custom className', () => {
      render(<StarsRating rating={3} className="custom-class" />);

      const container = screen.getByRole('img');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('rating display', () => {
    it('should show correct number of filled stars', () => {
      const { container } = render(<StarsRating rating={3} maxStars={5} />);

      const stars = container.querySelectorAll('span');
      const filledStars = Array.from(stars).filter(star =>
        star.className.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(3);
    });

    it('should clamp rating to maxStars', () => {
      const { container } = render(<StarsRating rating={10} maxStars={5} />);

      const stars = container.querySelectorAll('span');
      const filledStars = Array.from(stars).filter(star =>
        star.className.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(5);
    });

    it('should handle negative rating', () => {
      const { container } = render(<StarsRating rating={-2} maxStars={5} />);

      const stars = container.querySelectorAll('span');
      const filledStars = Array.from(stars).filter(star =>
        star.className.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(0);
    });

    it('should handle decimal ratings', () => {
      const { container } = render(<StarsRating rating={2.7} maxStars={5} />);

      const stars = container.querySelectorAll('span');
      const filledStars = Array.from(stars).filter(star =>
        star.className.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(2); // Without allowHalf, should floor the rating
    });
  });

  describe('size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(<StarsRating rating={3} size="sm" />);

      const firstStar = container.querySelector('span');
      expect(firstStar).toHaveClass('text-lg');
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<StarsRating rating={3} />);

      const firstStar = container.querySelector('span');
      expect(firstStar).toHaveClass('text-2xl');
    });

    it('should apply large size class', () => {
      const { container } = render(<StarsRating rating={3} size="lg" />);

      const firstStar = container.querySelector('span');
      expect(firstStar).toHaveClass('text-4xl');
    });

    it('should apply extra large size class', () => {
      const { container } = render(<StarsRating rating={3} size="xl" />);

      const firstStar = container.querySelector('span');
      expect(firstStar).toHaveClass('text-6xl');
    });
  });

  describe('custom colors', () => {
    it('should use custom filled color', () => {
      const { container } = render(
        <StarsRating rating={3} filledColor="text-red-500" />
      );

      const stars = container.querySelectorAll('span');
      const filledStars = Array.from(stars).filter(star =>
        star.className.includes('text-red-500')
      );
      expect(filledStars).toHaveLength(3);
    });

    it('should use custom empty color', () => {
      const { container } = render(
        <StarsRating rating={2} emptyColor="text-blue-200" />
      );

      const stars = container.querySelectorAll('span');
      const emptyStars = Array.from(stars).filter(star =>
        star.className.includes('text-blue-200')
      );
      expect(emptyStars).toHaveLength(3);
    });
  });

  describe('interactive mode', () => {
    it('should call onRatingChange when star is clicked', () => {
      const handleRatingChange = vi.fn();
      const { container } = render(
        <StarsRating
          rating={2}
          interactive={true}
          onRatingChange={handleRatingChange}
        />
      );

      const thirdStar = container.querySelectorAll('span')[2];
      fireEvent.click(thirdStar);

      expect(handleRatingChange).toHaveBeenCalledWith(3);
    });

    it('should apply hover styles in interactive mode', () => {
      const handleRatingChange = vi.fn();
      const { container } = render(
        <StarsRating
          rating={2}
          interactive={true}
          onRatingChange={handleRatingChange}
        />
      );

      const firstStar = container.querySelector('span');
      expect(firstStar).toHaveClass('cursor-pointer');
      expect(firstStar).toHaveClass('hover:scale-110');
    });

    it('should support keyboard interaction', () => {
      const handleRatingChange = vi.fn();
      const { container } = render(
        <StarsRating
          rating={2}
          interactive={true}
          onRatingChange={handleRatingChange}
        />
      );

      const thirdStar = container.querySelectorAll('span')[2];
      fireEvent.keyDown(thirdStar, { key: 'Enter' });

      expect(handleRatingChange).toHaveBeenCalledWith(3);
    });

    it('should support space key interaction', () => {
      const handleRatingChange = vi.fn();
      const { container } = render(
        <StarsRating
          rating={2}
          interactive={true}
          onRatingChange={handleRatingChange}
        />
      );

      const thirdStar = container.querySelectorAll('span')[2];
      fireEvent.keyDown(thirdStar, { key: ' ' });

      expect(handleRatingChange).toHaveBeenCalledWith(3);
    });

    it('should not be interactive by default', () => {
      const { container } = render(<StarsRating rating={3} />);

      const firstStar = container.querySelector('span');
      expect(firstStar).not.toHaveClass('cursor-pointer');
      expect(firstStar).not.toHaveAttribute('role', 'button');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label by default', () => {
      render(<StarsRating rating={3} maxStars={5} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', '3 out of 5 stars');
    });

    it('should use custom aria-label', () => {
      render(
        <StarsRating
          rating={4}
          maxStars={5}
          aria-label="Custom rating description"
        />
      );

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Custom rating description');
    });

    it('should have proper tabIndex for interactive stars', () => {
      const { container } = render(
        <StarsRating
          rating={2}
          interactive={true}
          onRatingChange={() => {}}
        />
      );

      const stars = container.querySelectorAll('span');
      stars.forEach(star => {
        expect(star).toHaveAttribute('tabIndex', '0');
        expect(star).toHaveAttribute('role', 'button');
      });
    });
  });
});
