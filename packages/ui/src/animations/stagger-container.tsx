"use client";

import * as React from "react";
import { cn } from "../utils";

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
}

interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const StaggerContext = React.createContext<{
  staggerDelay: number;
  initialDelay: number;
  isVisible: boolean;
}>({ staggerDelay: 100, initialDelay: 0, isVisible: false });

export function StaggerContainer({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  className,
  ...props
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <StaggerContext.Provider
      value={{ staggerDelay, initialDelay, isVisible }}
    >
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: StaggerItemProps) {
  const { staggerDelay, initialDelay, isVisible } = React.useContext(StaggerContext);
  const [index, setIndex] = React.useState(0);
  const itemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (itemRef.current) {
      const parent = itemRef.current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        setIndex(siblings.indexOf(itemRef.current));
      }
    }
  }, []);

  const delay = initialDelay + index * staggerDelay;

  return (
    <div
      ref={itemRef}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms, transform 500ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
