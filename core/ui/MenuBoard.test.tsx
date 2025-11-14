import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuBoard } from './MenuBoard';
import type { MenuTab } from './MenuBoard';

// Mock Motion component to avoid framer-motion dependency in tests
vi.mock('./motion/index.js', () => ({
  Motion: ({ children }: { children: React.ReactNode }) => <div data-testid="motion-wrapper">{children}</div>,
}));

describe('MenuBoard', () => {
  describe('Basic Rendering', () => {
    it('renders with title and children', () => {
      render(
        <MenuBoard title="Test Menu">
          <div>Test Content</div>
        </MenuBoard>
      );

      expect(screen.getByText('Test Menu')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders without title', () => {
      render(
        <MenuBoard>
          <div>Test Content</div>
        </MenuBoard>
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <MenuBoard className="custom-class">
          <div>Test Content</div>
        </MenuBoard>
      );

      const menuBoard = screen.getByRole('dialog');
      expect(menuBoard).toHaveClass('custom-class');
    });
  });

  describe('Close Button', () => {
    it('renders close button when closable=true', () => {
      const onClose = vi.fn();
      render(
        <MenuBoard closable onClose={onClose}>
          <div>Test Content</div>
        </MenuBoard>
      );

      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toBeInTheDocument();
    });

    it('does not render close button when closable=false', () => {
      render(
        <MenuBoard closable={false}>
          <div>Test Content</div>
        </MenuBoard>
      );

      expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <MenuBoard closable onClose={onClose}>
          <div>Test Content</div>
        </MenuBoard>
      );

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <MenuBoard closable onClose={onClose}>
          <div>Test Content</div>
        </MenuBoard>
      );

      const menuBoard = screen.getByRole('dialog');
      fireEvent.keyDown(menuBoard, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tabs', () => {
    const sampleTabs: MenuTab[] = [
      {
        id: 'tab1',
        label: 'Tab 1',
        content: <div>Content 1</div>,
      },
      {
        id: 'tab2',
        label: 'Tab 2',
        content: <div>Content 2</div>,
      },
      {
        id: 'tab3',
        label: 'Tab 3',
        content: <div>Content 3</div>,
        disabled: true,
      },
    ];

    it('renders tabs when provided', () => {
      render(<MenuBoard tabs={sampleTabs} />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('handles tab changes', () => {
      const onTabChange = vi.fn();
      render(<MenuBoard tabs={sampleTabs} onTabChange={onTabChange} />);

      const tab2Button = screen.getByText('Tab 2');
      fireEvent.click(tab2Button);

      expect(onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('respects defaultActiveTab', () => {
      render(<MenuBoard tabs={sampleTabs} defaultActiveTab="tab2" />);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('supports controlled activeTab', () => {
      const { rerender } = render(<MenuBoard tabs={sampleTabs} activeTab="tab1" />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(<MenuBoard tabs={sampleTabs} activeTab="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('applies tab-with-icon class when tab has icon', () => {
      const tabsWithIcon: MenuTab[] = [
        {
          id: 'tab1',
          label: 'Tab 1',
          icon: <span data-testid="icon">★</span>,
          content: <div>Content 1</div>,
        },
      ];

      render(<MenuBoard tabs={tabsWithIcon} />);

      // Check if the tab has the icon class applied through className prop
      expect(screen.getByText('Tab 1').closest('button')).toHaveClass('tab-with-icon');
    });
  });

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(
        <MenuBoard size="sm">
          <div>Content</div>
        </MenuBoard>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('md:w-80');

      rerender(
        <MenuBoard size="lg">
          <div>Content</div>
        </MenuBoard>
      );
      expect(dialog).toHaveClass('md:w-[32rem]');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <MenuBoard title="Test Menu" ariaLabel="Custom label">
          <div>Content</div>
        </MenuBoard>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Custom label');
    });

    it('uses title as aria-label when ariaLabel is not provided', () => {
      render(
        <MenuBoard title="Test Menu">
          <div>Content</div>
        </MenuBoard>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Test Menu');
    });

    it('has default aria-label when neither title nor ariaLabel provided', () => {
      render(
        <MenuBoard>
          <div>Content</div>
        </MenuBoard>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Menu');
    });

    it('close button has correct aria-label', () => {
      render(
        <MenuBoard closable onClose={vi.fn()}>
          <div>Content</div>
        </MenuBoard>
      );

      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Motion Integration', () => {
    it('uses Motion wrapper by default', () => {
      render(
        <MenuBoard>
          <div>Content</div>
        </MenuBoard>
      );

      expect(screen.getByTestId('motion-wrapper')).toBeInTheDocument();
    });

    it('uses custom motion wrapper when provided', () => {
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="custom-wrapper">{children}</div>
      );

      render(
        <MenuBoard motion={{ wrapper: CustomWrapper }}>
          <div>Content</div>
        </MenuBoard>
      );

      expect(screen.getByTestId('custom-wrapper')).toBeInTheDocument();
      expect(screen.queryByTestId('motion-wrapper')).not.toBeInTheDocument();
    });
  });
});
