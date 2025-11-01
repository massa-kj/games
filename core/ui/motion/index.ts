// The framer-motion dependency is completely isolated in the `core/ui/motion` directory, so other components do not need to import framer-motion directly.

// Implementation selection logic
import { Motion as FramerMotion } from './Motion';
// import { Motion as TailwindMotion } from './Motion.tailwind';

// Runtime implementation selection
// TODO: Enable when Vite types are properly configured
// export const Motion =
//   import.meta.env?.VITE_USE_TAILWIND_MOTION === "true"
//     ? TailwindMotion
//     : FramerMotion;

// Default to Framer Motion for now
export const Motion = FramerMotion;

// Modal Motion (implementation-agnostic)
export { ModalMotion } from './ModalMotion';

// Type exports (shared across implementations)
export type { MotionProps, MotionVariant } from './Motion';
export type { ModalMotionProps } from './ModalMotion';

// Export variants and transitions from their respective modules
export { variants, modalVariants } from './variants';
export { transitions, getModalTransition, getCssMotionValue, getDurationFromSpeed } from './transitions';
export type { ModalAnimationType } from './transitions';
