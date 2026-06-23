import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Clock } from './Clock.js';

describe('Clock', () => {
  it('renders an analog clock face', () => {
    render(<Clock value={{ totalMinutes: 210 }} labels={{ clock: 'Practice clock' }} />);

    expect(screen.getByRole('img', { name: 'Practice clock' })).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('can render digital time as a learning aid', () => {
    render(<Clock value={{ totalMinutes: 210 }} display={{ digitalTime: true }} />);

    expect(screen.getByLabelText('Time')).toHaveTextContent('3:30');
  });

  it('uses 24-hour digital display when cycle is 24', () => {
    render(<Clock value={{ totalMinutes: 780 }} cycle={24} display={{ digitalTime: true }} />);

    expect(screen.getByLabelText('Time')).toHaveTextContent('13:00');
  });

  it('uses a 24-hour range for editable hour hand accessibility', () => {
    render(
      <Clock
        value={{ totalMinutes: 0 }}
        cycle={24}
        editable={{ hourHand: true }}
        onChange={vi.fn()}
      />
    );

    const hourHand = screen.getByRole('slider', { name: 'Hour hand' });
    expect(hourHand).toHaveAttribute('aria-valuemin', '0');
    expect(hourHand).toHaveAttribute('aria-valuemax', '23');
    expect(hourHand).toHaveAttribute('aria-valuenow', '0');
  });

  it('does not expose sliders when the clock is read-only', () => {
    render(<Clock value={{ totalMinutes: 210 }} />);

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('calls onChange from minute hand keyboard edits', () => {
    const handleChange = vi.fn();
    render(
      <Clock
        value={{ totalMinutes: 210 }}
        editable={{ minuteHand: true }}
        onChange={handleChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Minute hand' }), { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith({ totalMinutes: 211 });
  });

  it('uses five-minute keyboard edits when shift is pressed', () => {
    const handleChange = vi.fn();
    render(
      <Clock
        value={{ totalMinutes: 210 }}
        editable={{ minuteHand: true }}
        onChange={handleChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Minute hand' }), {
      key: 'ArrowRight',
      shiftKey: true,
    });

    expect(handleChange).toHaveBeenCalledWith({ totalMinutes: 215 });
  });

  it('moves the hour hand by whole hours from the keyboard', () => {
    const handleChange = vi.fn();
    render(
      <Clock
        value={{ totalMinutes: 200 }}
        editable={{ hourHand: true }}
        onChange={handleChange}
      />
    );

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Hour hand' }), { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith({ totalMinutes: 260 });
  });
});
