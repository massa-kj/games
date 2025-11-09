/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameSettingsModal, type GameSettingsModalProps } from './GameSettingsModal.js';

describe('GameSettingsModal', () => {
  const defaultProps: GameSettingsModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Settings'
  };

  describe('rendering', () => {
    it('should render when open is true', () => {
      render(<GameSettingsModal {...defaultProps} />);
      expect(screen.getByText('Test Settings')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<GameSettingsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Settings')).not.toBeInTheDocument();
    });

    it('should render close button with default text', () => {
      render(<GameSettingsModal {...defaultProps} />);
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should render close button with custom text', () => {
      render(
        <GameSettingsModal
          {...defaultProps}
          texts={{ close: 'Custom Close' }}
        />
      );
      expect(screen.getByText('Custom Close')).toBeInTheDocument();
    });
  });

  describe('game settings', () => {
    it('should render checkbox setting', () => {
      const gameSettings = [
        {
          id: 'testCheckbox',
          type: 'checkbox' as const,
          label: 'Test Checkbox',
          value: false,
          onChange: vi.fn()
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render select setting', () => {
      const gameSettings = [
        {
          id: 'testSelect',
          type: 'select' as const,
          label: 'Test Select',
          value: 'option1',
          onChange: vi.fn(),
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should render radio setting', () => {
      const gameSettings = [
        {
          id: 'testRadio',
          type: 'radio' as const,
          label: 'Test Radio',
          value: 'option1',
          onChange: vi.fn(),
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Radio')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('should render button-group setting', () => {
      const gameSettings = [
        {
          id: 'testButtonGroup',
          type: 'button-group' as const,
          label: 'Test Button Group',
          value: 'option1',
          onChange: vi.fn(),
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Button Group')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should render toggle setting', () => {
      const gameSettings = [
        {
          id: 'testToggle',
          type: 'toggle' as const,
          label: 'Test Toggle',
          value: true,
          onChange: vi.fn()
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Toggle')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render setting with description', () => {
      const gameSettings = [
        {
          id: 'testWithDesc',
          type: 'checkbox' as const,
          label: 'Test Setting',
          description: 'This is a test description',
          value: false,
          onChange: vi.fn()
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByText('Test Setting')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<GameSettingsModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onChange when checkbox is toggled', () => {
      const onChange = vi.fn();
      const gameSettings = [
        {
          id: 'testCheckbox',
          type: 'checkbox' as const,
          label: 'Test Checkbox',
          value: false,
          onChange
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange when select value changes', () => {
      const onChange = vi.fn();
      const gameSettings = [
        {
          id: 'testSelect',
          type: 'select' as const,
          label: 'Test Select',
          value: 'option1',
          onChange,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
      expect(onChange).toHaveBeenCalledWith('option2');
    });

    it('should call onChange when button-group option is clicked', () => {
      const onChange = vi.fn();
      const gameSettings = [
        {
          id: 'testButtonGroup',
          type: 'button-group' as const,
          label: 'Test Button Group',
          value: 'option1',
          onChange,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      fireEvent.click(screen.getByText('Option 2'));
      expect(onChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('reset functionality', () => {
    it('should render reset button when onResetSettings is provided', () => {
      const onResetSettings = vi.fn();
      render(<GameSettingsModal {...defaultProps} onResetSettings={onResetSettings} />);

      expect(screen.getByText('Reset to Default')).toBeInTheDocument();
    });

    it('should call onResetSettings when reset button is clicked', () => {
      const onResetSettings = vi.fn();
      render(<GameSettingsModal {...defaultProps} onResetSettings={onResetSettings} />);

      fireEvent.click(screen.getByText('Reset to Default'));
      expect(onResetSettings).toHaveBeenCalledTimes(1);
    });

    it('should render custom reset text', () => {
      render(
        <GameSettingsModal
          {...defaultProps}
          onResetSettings={vi.fn()}
          texts={{ reset: 'Custom Reset' }}
        />
      );

      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable checkbox when disabled is true', () => {
      const gameSettings = [
        {
          id: 'testCheckbox',
          type: 'checkbox' as const,
          label: 'Test Checkbox',
          value: false,
          onChange: vi.fn(),
          disabled: true
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should disable button-group when disabled is true', () => {
      const gameSettings = [
        {
          id: 'testButtonGroup',
          type: 'button-group' as const,
          label: 'Test Button Group',
          value: 'option1',
          onChange: vi.fn(),
          disabled: true,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ];

      render(<GameSettingsModal {...defaultProps} gameSettings={gameSettings} />);

      const buttons = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'Option 1' || btn.textContent === 'Option 2'
      );
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });
});
