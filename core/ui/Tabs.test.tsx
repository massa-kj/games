import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, type TabItem } from './Tabs';

// Mock tabs data
const mockTabs: TabItem[] = [
  {
    id: 'tab1',
    label: 'First Tab',
    content: <div>First tab content</div>,
  },
  {
    id: 'tab2',
    label: 'Second Tab',
    content: <div>Second tab content</div>,
  },
  {
    id: 'tab3',
    label: 'Third Tab',
    content: <div>Third tab content</div>,
    disabled: true,
  },
];

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={mockTabs} />);

    expect(screen.getByRole('tab', { name: 'First Tab' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Second Tab' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Third Tab' })).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    render(<Tabs tabs={mockTabs} />);

    expect(screen.getByText('First tab content')).toBeInTheDocument();
    expect(screen.queryByText('Second tab content')).not.toBeInTheDocument();
  });

  it('shows default active tab content when specified', () => {
    render(<Tabs tabs={mockTabs} defaultActiveTab="tab2" />);

    expect(screen.getByText('Second tab content')).toBeInTheDocument();
    expect(screen.queryByText('First tab content')).not.toBeInTheDocument();
  });

  it('switches content when tab is clicked', () => {
    render(<Tabs tabs={mockTabs} />);

    // Initially shows first tab
    expect(screen.getByText('First tab content')).toBeInTheDocument();

    // Click second tab
    fireEvent.click(screen.getByRole('tab', { name: 'Second Tab' }));

    // Should now show second tab content
    expect(screen.getByText('Second tab content')).toBeInTheDocument();
    expect(screen.queryByText('First tab content')).not.toBeInTheDocument();
  });

  it('calls onTabChange when tab is switched', () => {
    const handleTabChange = vi.fn();
    render(<Tabs tabs={mockTabs} onTabChange={handleTabChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Second Tab' }));

    expect(handleTabChange).toHaveBeenCalledWith('tab2');
  });

  it('works in controlled mode', () => {
    const handleTabChange = vi.fn();
    render(
      <Tabs
        tabs={mockTabs}
        activeTab="tab2"
        onTabChange={handleTabChange}
      />
    );

    // Should show controlled tab content
    expect(screen.getByText('Second tab content')).toBeInTheDocument();

    // Click first tab
    fireEvent.click(screen.getByRole('tab', { name: 'First Tab' }));

    // Should call callback but not change content (controlled)
    expect(handleTabChange).toHaveBeenCalledWith('tab1');
    expect(screen.getByText('Second tab content')).toBeInTheDocument();
  });

  it('does not activate disabled tabs', () => {
    render(<Tabs tabs={mockTabs} />);

    // Click disabled tab
    fireEvent.click(screen.getByRole('tab', { name: 'Third Tab' }));

    // Should still show first tab content
    expect(screen.getByText('First tab content')).toBeInTheDocument();
    expect(screen.queryByText('Third tab content')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<Tabs tabs={mockTabs} />);

    const firstTab = screen.getByRole('tab', { name: 'First Tab' });
    firstTab.focus();

    // Press right arrow to move to second tab
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

    expect(screen.getByText('Second tab content')).toBeInTheDocument();
  });

  it('applies correct ARIA attributes', () => {
    render(<Tabs tabs={mockTabs} defaultActiveTab="tab2" />);

    const firstTab = screen.getByRole('tab', { name: 'First Tab' });
    const secondTab = screen.getByRole('tab', { name: 'Second Tab' });

    // Check ARIA attributes
    expect(firstTab).toHaveAttribute('aria-selected', 'false');
    expect(firstTab).toHaveAttribute('tabindex', '-1');
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(secondTab).toHaveAttribute('tabindex', '0');

    // Check tab panel
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'tabpanel-tab2');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-tab2');
  });

  it('handles empty tabs array gracefully', () => {
    render(<Tabs tabs={[]} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    const { container } = render(
      <Tabs
        tabs={mockTabs}
        className="custom-tabs"
        tabListClassName="custom-tab-list"
        contentClassName="custom-content"
      />
    );

    expect(container.querySelector('.custom-tabs')).toBeInTheDocument();
    expect(container.querySelector('.custom-tab-list')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });
});
