import type { Variants, Transition } from "motion/react";

// ---- Spring / transition presets ----

export const spring: Transition = { type: "spring", stiffness: 300, damping: 30 };
export const springBouncy: Transition = { type: "spring", stiffness: 400, damping: 20 };
export const easeOut: Transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };
export const easeOutSlow: Transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

// ---- Fade + slide up (scroll-triggered cards/sections) ----

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOutSlow,
  },
};

// ---- Stagger container ----

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// ---- Scale in ----

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring,
  },
};

// ---- For list items (use as child of stagger container) ----

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

// ---- For cards / tiles that appear in grids ----

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring,
  },
};
