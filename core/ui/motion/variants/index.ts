import { fadeVariants } from "./fade";
import { scaleVariants } from "./scale";
import { slideUpVariants } from "./slide";
import { modalVariants as modalContentVariants, modalBackdropVariants } from "./modal";

// Pure animation variants for Motion component (no modal-specific variants)
export const variants = {
  fade: fadeVariants,
  scale: scaleVariants,
  slideUp: slideUpVariants,
};

// Modal-specific variants for ModalMotion component
export const modalVariants = {
  modal: modalContentVariants,
  backdrop: modalBackdropVariants,
  // ModalMotion can also use basic animation variants for content
  fade: fadeVariants,
  scale: scaleVariants,
  slideUp: slideUpVariants,
};
