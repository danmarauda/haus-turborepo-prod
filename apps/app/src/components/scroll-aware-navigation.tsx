"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Header } from "@/components/haus/header";

// Context to share navigation state across components
type NavigationContextType = {
  showFloatingNav: boolean;
  isAtTop: boolean;
};

const NavigationContext = createContext<NavigationContextType>({
  showFloatingNav: false,
  isAtTop: true,
});

export const useNavigation = () => useContext(NavigationContext);

type ScrollAwareNavigationProps = {
  children: React.ReactNode;
};

export function ScrollAwareNavigation({
  children,
}: ScrollAwareNavigationProps) {
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  // Use refs to avoid callback dependency issues
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const SCROLL_THRESHOLD = 50;
    const TOP_THRESHOLD = 20;

    const updateNavigation = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY < TOP_THRESHOLD;

      setIsAtTop(atTop);

      // Always show menu at top, hide floating nav
      if (atTop) {
        setShowFloatingNav(false);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Determine scroll direction
      const scrollDiff = currentScrollY - lastScrollY.current;
      const isScrollingDown = scrollDiff > 0;

      // Only update if scrolled past threshold
      if (Math.abs(scrollDiff) > 5) {
        if (isScrollingDown && currentScrollY > SCROLL_THRESHOLD) {
          // Scrolling down - show floating nav
          setShowFloatingNav(true);
        } else if (!isScrollingDown && currentScrollY > SCROLL_THRESHOLD) {
          // Scrolling up - hide floating nav
          setShowFloatingNav(false);
        }

        lastScrollY.current = currentScrollY;
      }

      ticking.current = false;
    };

    const requestTick = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(updateNavigation);
      }
    };

    const handleScroll = () => {
      // Use throttle to prevent excessive updates
      if (!isScrolling.current) {
        requestTick();
        isScrolling.current = true;

        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
          isScrolling.current = false;
        }, 100); // Throttle to 100ms
      }
    };

    // Initial check
    updateNavigation();

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Handle resize events to recalculate
  useEffect(() => {
    const handleResize = () => {
      const atTop = window.scrollY < 40;
      setIsAtTop(atTop);
      if (atTop) {
        setShowFloatingNav(false);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <NavigationContext.Provider value={{ showFloatingNav, isAtTop }}>
      {/* Header with built-in scroll handling */}
      <Header />

      {/* Spacer to prevent content jump when menu is fixed */}
      <div className="h-[88px]" />

      {/* Main content */}
      <main className="relative">{children}</main>
    </NavigationContext.Provider>
  );
}
