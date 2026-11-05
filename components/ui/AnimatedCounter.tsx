"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/** Counts from the previous value to `value`. Skips the animation under reduced motion. */
export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    if (reduce) {
      previous.current = value;
      queueMicrotask(() => setDisplay(value));
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        previous.current = value;
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
