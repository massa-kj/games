import { useEffect } from 'react';

export function usePreventScroll(enabled: boolean = true, ref?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const target = ref?.current ?? document.body;
    if (!enabled || !target) return;

    const preventScroll = (e: TouchEvent) => {
      if (e.target && (e.target as HTMLElement).closest('.allow-scroll')) {
        return;
      }
      e.preventDefault();
    };
    target.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      target.removeEventListener('touchmove', preventScroll);
    };
  }, [enabled, ref]);
}
