import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = [
    'font-bold rounded-2xl transition-all duration-200',
    'shadow-button hover:shadow-hover',
    'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus:ring-4 focus:ring-opacity-50',
  ];

  const variantClasses = {
    primary: [
      'bg-primary hover:bg-primary-dark',
      'text-text',
      'focus:ring-primary',
    ],
    secondary: [
      'bg-bg-secondary hover:bg-gray-100',
      'text-text border-2 border-gray-200',
      'focus:ring-gray-300',
    ],
    accent: [
      'bg-accent hover:bg-accent-dark',
      'text-text-white',
      'focus:ring-accent',
    ],
    success: [
      'bg-success hover:bg-green-600',
      'text-text-white',
      'focus:ring-success',
    ],
    warning: [
      'bg-warning hover:bg-orange-600',
      'text-text-white',
      'focus:ring-warning',
    ],
    error: [
      'bg-error hover:bg-red-600',
      'text-text-white',
      'focus:ring-error',
    ],
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
