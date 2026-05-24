"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { Transition } from "motion/react";
import { stagger, listItem, cardReveal } from "@/lib/animations";

const viewport = { once: true, margin: "-80px" };

/**
 * Fade-up + slide reveal on scroll. Wraps a single element.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  transition,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; transition?: Transition }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay, ...transition }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container that staggers children. Use with StaggerItem.
 */
export function StaggerContainer({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * A single item inside a StaggerContainer.
 */
export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={listItem} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Card/tile that reveals on scroll with a subtle scale.
 */
export function RevealCard({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
