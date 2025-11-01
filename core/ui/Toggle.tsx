export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Customizable toggle switch component with optional label.
 *
 * Provides a modern toggle switch interface with smooth animations
 * and accessibility support.
 *
 * @param checked Current toggle state
 * @param onChange Callback when toggle state changes
 * @param label Optional label text to display
 * @param disabled Whether the toggle is disabled
 * @param className Additional CSS classes
 *
 * @example
 * ```tsx
 * <Toggle
 *   checked={soundEnabled}
 *   onChange={setSoundEnabled}
 *   label="Sound Effects"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={[
            'w-14 h-8 rounded-full transition-colors duration-200',
            checked ? 'bg-primary' : 'bg-gray-300',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          <div
            className={[
              'absolute top-1 left-1 w-6 h-6 bg-white rounded-full',
              'transition-transform duration-200 shadow-md',
              checked ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
          />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-base font-medium text-text">
          {label}
        </span>
      )}
    </label>
  );
}
