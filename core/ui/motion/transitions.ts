export type ModalAnimationType = "fade" | "scale" | "slideUp" | "modal";

/**
 * Get CSS motion value from CSS custom properties
 * @param name CSS custom property name (e.g., '--motion-duration-normal')
 * @param fallback Fallback value if CSS property is not found or invalid
 * @returns Parsed number value or fallback
 */
export function getCssMotionValue(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name);
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

/**
 * Convert speed preset to duration using CSS variables
 * @param speed Speed preset ('fast'|'normal'|'slow') or custom duration in seconds
 * @param unit Unit for return value: 'seconds' or 'milliseconds'
 * @returns Duration in specified unit
 */
export function getDurationFromSpeed(
  speed: 'fast' | 'normal' | 'slow' | number,
  unit: 'seconds' | 'milliseconds' = 'seconds'
): number {
  let durationInSeconds: number;

  if (typeof speed === 'number') {
    durationInSeconds = speed;
  } else {
    switch (speed) {
      case 'fast':
        durationInSeconds = getCssMotionValue("--motion-duration-fast", 0.15);
        break;
      case 'slow':
        durationInSeconds = getCssMotionValue("--motion-duration-slow", 0.6);
        break;
      default: // 'normal'
        durationInSeconds = getCssMotionValue("--motion-duration-normal", 0.3);
    }
  }

  return unit === 'milliseconds' ? durationInSeconds * 1000 : durationInSeconds;
}

export const transitions = {
  modal: {
    type: "spring" as const,
    duration: getCssMotionValue("--motion-duration-normal", 0.35),
    bounce: getCssMotionValue("--motion-spring-bounce", 0.25)
  },
  modalBackdrop: {
    duration: getCssMotionValue("--motion-duration-fast", 0.2)
  },
  modalExit: {
    duration: getCssMotionValue("--motion-duration-fast", 0.2)
  },
  scale: {
    duration: getCssMotionValue("--motion-duration-normal", 0.3),
    ease: "easeOut" as const
  },
  fade: {
    duration: getCssMotionValue("--motion-duration-fast", 0.2),
    ease: "easeInOut" as const
  },
  slideUp: {
    type: "spring" as const,
    stiffness: getCssMotionValue("--motion-spring-stiffness", 400),
    damping: getCssMotionValue("--motion-spring-damping", 25)
  }
};

export const getModalTransition = (type: ModalAnimationType) => {
  switch (type) {
    case "modal":
      return transitions.modal;
    case "scale":
      return transitions.scale;
    case "fade":
      return transitions.fade;
    case "slideUp":
      return transitions.slideUp;
    default:
      return transitions.modal;
  }
};
