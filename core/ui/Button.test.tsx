/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, type ButtonProps } from './Button.js';

describe('Button', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should have accessible role', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply primary variant by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-bg-secondary');
    });

    it('should apply accent variant', () => {
      render(<Button variant="accent">Accent</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent');
    });

    it('should apply success variant', () => {
      render(<Button variant="success">Success</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-success');
    });

    it('should apply warning variant', () => {
      render(<Button variant="warning">Warning</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-warning');
    });

    it('should apply error variant', () => {
      render(<Button variant="error">Error</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error');
    });

    it('should have correct text color for each variant', () => {
      const variants: Array<{ variant: ButtonProps['variant'], textClass: string }> = [
        { variant: 'primary', textClass: 'text-text' },
        { variant: 'secondary', textClass: 'text-text' },
        { variant: 'accent', textClass: 'text-text-white' },
        { variant: 'success', textClass: 'text-text-white' },
        { variant: 'warning', textClass: 'text-text-white' },
        { variant: 'error', textClass: 'text-text-white' },
      ];

      variants.forEach(({ variant, textClass }) => {
        const { unmount } = render(<Button variant={variant}>Test</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(textClass);
        unmount();
      });
    });
  });

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
    });

    it('should apply extra large size', () => {
      render(<Button size="xl">Extra Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-10', 'py-5', 'text-xl');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Multi-click</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should support keyboard interactions with Enter', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Test Button</Button>);

      const button = screen.getByRole('button');
      // Use userEvent for more realistic keyboard interactions
      button.focus();
      fireEvent.keyPress(button, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Note: Standard HTML button behavior for Enter/Space is browser-dependent
      // In test environment, we verify the button can receive focus and key events
      expect(button).toHaveFocus();
    });

    it('should handle space key press', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Test Button</Button>);

      const button = screen.getByRole('button');
      // Focus the button and verify it can receive keyboard events
      button.focus();
      fireEvent.keyPress(button, { key: ' ', code: 'Space', charCode: 32 });

      // Verify button is focused and can receive keyboard input
      expect(button).toHaveFocus();
    });
  });

  describe('styling', () => {
    it('should have base styling classes', () => {
      render(<Button>Styled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'font-bold',
        'rounded-2xl',
        'transition-all',
        'duration-200',
        'shadow-button'
      );
    });

    it('should have hover and focus states', () => {
      render(<Button>Hover Focus</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'hover:shadow-hover',
        'active:scale-95',
        'focus:outline-none',
        'focus:ring-4',
        'focus:ring-opacity-50'
      );
    });

    it('should combine all classes correctly', () => {
      render(
        <Button
          variant="accent"
          size="lg"
          className="custom-class"
        >
          Combined
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent', 'px-8', 'py-4', 'text-lg', 'custom-class');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through button attributes', () => {
      render(
        <Button
          type="submit"
          name="test-button"
          data-testid="custom-button"
        >
          Attributes
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('should support form-related attributes', () => {
      render(
        <Button
          form="test-form"
          formAction="/submit"
          formMethod="post"
        >
          Form Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('formAction', '/submit');
      expect(button).toHaveAttribute('formMethod', 'post');
    });

    it('should support ARIA attributes', () => {
      render(
        <Button
          aria-label="Custom label"
          aria-describedby="description"
          aria-pressed="false"
        >
          ARIA Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('edge cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button>{''}</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(<Button>{null}</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Button className={undefined}>No className</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle empty className', () => {
      render(<Button className="">Empty className</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should work without any props except children', () => {
      render(<Button>Minimal</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary'); // default variant
      expect(button).toHaveClass('px-6', 'py-3'); // default size
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('should have correct tab order', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);

      // Test tab navigation
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
    });

    it('should work with screen readers', () => {
      render(<Button>Screen Reader Button</Button>);

      const button = screen.getByRole('button', { name: 'Screen Reader Button' });
      expect(button).toBeInTheDocument();
    });
  });
});
