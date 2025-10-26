export type ModalAnimationType = "fade" | "scale" | "slideUp" | "modal";

export const transitions = {
  modal: {
    type: "spring" as const,
    duration: 0.4,
    bounce: 0.2
  },
  modalBackdrop: {
    duration: 0.2
  },
  modalExit: {
    duration: 0.2
  },
  scale: {
    duration: 0.3,
    ease: "easeOut" as const
  },
  fade: {
    duration: 0.3
  },
  slideUp: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25
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
