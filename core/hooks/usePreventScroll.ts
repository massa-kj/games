import { useEffect } from 'react';

export function usePreventScroll(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const preventScroll = (e: TouchEvent) => {
      if (e.target && (e.target as HTMLElement).closest('.allow-scroll')) {
        return;
      }
      e.preventDefault();
    };
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener('touchmove', preventScroll);
    };
  }, [enabled]);
}
