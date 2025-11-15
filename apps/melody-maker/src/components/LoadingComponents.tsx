/**
 * Loading components for smooth transitions
 */

import React from 'react';

/**
 * Spinner component for loading states
 */
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
}> = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    accent: 'border-green-500'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 ${colorClasses[color]} border-t-transparent
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Skeleton loader for composition items
 */
export const CompositionSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1">
              {Array.from({ length: 32 }, (_, j) => (
                <div key={j} className="h-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Sequencer grid skeleton
 */
export const SequencerSkeleton: React.FC<{
  bars?: number;
  beatsPerBar?: number;
  subdivisions?: number;
  className?: string;
}> = ({ bars = 2, beatsPerBar = 4, subdivisions = 4, className = '' }) => {
  const totalCells = bars * beatsPerBar * subdivisions;

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </div>

      {/* Beat numbers skeleton */}
      <div className={`grid grid-cols-${bars * beatsPerBar} gap-2 mb-2`}>
        {Array.from({ length: bars * beatsPerBar }, (_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}></div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className={`grid grid-cols-${totalCells} gap-2`}>
        {Array.from({ length: totalCells }, (_, i) => (
          <div
            key={i}
            className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 0.02}s` }}
          ></div>
        ))}
      </div>

      {/* Instructions skeleton */}
      <div className="mt-4 flex justify-center">
        <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
      </div>
    </div>
  );
};

/**
 * Overlay loading component
 */
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  children?: React.ReactNode;
}> = ({ isVisible, message = 'Loading...', children }) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-50"
        style={{ animation: 'fadeInUp 0.2s ease-out' }}
      >
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Page transition wrapper
 */
export const PageTransition: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}> = ({ children, isLoading = false, className = '' }) => {
  return (
    <div
      className={`melody-maker-transition ${className}`}
      style={{
        animation: isLoading ? 'none' : 'fadeInUp 0.5s ease-out',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {children}
    </div>
  );
};
