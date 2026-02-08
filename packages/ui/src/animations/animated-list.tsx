"use client";

import * as React from "react";
import { cn } from "../utils";

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  staggerDelay = 50,
  initialDelay = 0,
  direction = "up",
}: AnimatedListProps<T>) {
  const [visibleItems, setVisibleItems] = React.useState<Set<string>>(new Set());
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.getAttribute("data-key");
          if (key && entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, key]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const children = containerRef.current?.children;
    if (children) {
      Array.from(children).forEach((child) => observer.observe(child));
    }

    return () => observer.disconnect();
  }, [items]);

  const getTransform = (isVisible: boolean) => {
    if (isVisible) return "translate(0, 0)";
    
    switch (direction) {
      case "up":
        return "translateY(20px)";
      case "down":
        return "translateY(-20px)";
      case "left":
        return "translateX(20px)";
      case "right":
        return "translateX(-20px)";
      default:
        return "translateY(20px)";
    }
  };

  return (
    <div ref={containerRef} className={cn(className)}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index);
        const isVisible = visibleItems.has(key);
        const delay = initialDelay + index * staggerDelay;

        return (
          <div
            key={key}
            data-key={key}
            className={cn(itemClassName)}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: getTransform(isVisible),
              transition: `opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
            }}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
