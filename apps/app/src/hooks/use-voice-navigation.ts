"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

/**
 * Enhanced Voice Navigation Commands
 * Covers all 68 routes in the HAUS platform
 */
const NAVIGATION_COMMANDS = {
  // ===== PRIMARY PAGES =====
  "go home": "/",
  "go to home": "/",
  "take me home": "/",
  "home page": "/",

  // Search & Discovery
  "go to search": "/search",
  "search properties": "/search",
  "start search": "/search",
  "find properties": "/find",
  "go to find": "/find",
  "property search": "/find",

  "go to explore": "/explore",
  "explore properties": "/explore",
  discovery: "/explore",

  "go to compass": "/compass",
  "open map": "/compass",
  "show map": "/compass",
  "map view": "/compass",
  "property map": "/compass",

  "property feed": "/stream",
  "go to stream": "/stream",
  "show stream": "/stream",
  "live feed": "/stream",

  // ===== AI & INTELLIGENCE =====
  "buyers agent": "/buyers-agent",
  "open buyers agent": "/buyers-agent",
  "talk to agent": "/buyers-agent",
  "ai agent": "/buyers-agent",
  "real estate agent": "/buyers-agent",

  "property intelligence": "/property-intelligence",
  "property insights": "/property-intelligence",
  "property analysis": "/property-intelligence",

  "market intelligence": "/market-intelligence",
  "market insights": "/market-intelligence",
  "market analysis": "/market-intelligence",
  "market data": "/market-intelligence",

  "go to deep haus": "/deephaus",
  "open deep haus": "/deephaus",
  "deep analysis": "/deephaus",
  "property deep dive": "/deephaus",

  "open copilot": "/copilot",
  "ai copilot": "/copilot",
  "ai assistant": "/copilot",
  "help me": "/copilot",

  watchdog: "/watchdog",
  "property watchdog": "/watchdog",
  monitoring: "/watchdog",

  "trust report": "/trust",
  "the dud": "/trust",
  "property trust": "/trust",

  // ===== TOOLS & CALCULATORS =====
  "go to appraisal": "/appraisal",
  "get appraisal": "/appraisal",
  "property appraisal": "/appraisal",
  "value my property": "/appraisal",
  "property valuation": "/appraisal",

  "go to calculator": "/affordability",
  "affordability calculator": "/affordability",
  "can i afford": "/affordability",
  affordability: "/affordability",
  "calculate affordability": "/affordability",

  "pre approval": "/preapproval",
  preapproval: "/preapproval",
  "loan approval": "/preapproval",
  "get approved": "/preapproval",

  // ===== PROPERTY PAGES =====
  "luxury properties": "/property/prestige",
  "prestige properties": "/property/prestige",
  "premium properties": "/property/prestige",
  "high end properties": "/property/prestige",

  "off market": "/offmarket",
  offmarket: "/offmarket",
  "off market properties": "/offmarket",
  "exclusive properties": "/offmarket",
  "private listings": "/offmarket",

  // ===== MARKETPLACE =====
  "go to market": "/market",
  "open marketplace": "/market",
  "show marketplace": "/market",
  "service marketplace": "/market",
  "find services": "/market",

  "market dashboard": "/market/dashboard",
  "provider dashboard": "/market/dashboard",
  "my services": "/market/dashboard",

  "join marketplace": "/market/join",
  "become provider": "/market/join",
  "join as provider": "/market/join",

  "request quote": "/market/quote",
  "get quote": "/market/quote",
  "quote request": "/market/quote",

  // ===== LISTING & SELLING =====
  "create listing": "/list",
  "list property": "/list",
  "sell property": "/list",
  "add listing": "/list",

  "enhanced listing": "/list/create",
  "new listing": "/list/create",

  "go to listings": "/listing",
  "my listings": "/listing",
  "all listings": "/listing",

  // ===== COMMERCIAL =====
  warehaus: "/warehaus",
  "commercial properties": "/warehaus",
  "commercial platform": "/warehaus",
  "business properties": "/warehaus",

  agency: "/agency",
  "agent platform": "/agency",
  "real estate agency": "/agency",
  "agent tools": "/agency",

  // ===== ACCOUNT & PROFILE =====
  "go to profile": "/profile",
  "my profile": "/profile",
  "open profile": "/profile",
  "user profile": "/profile",
  "account settings": "/profile",

  "go to saved": "/saved",
  "my saved properties": "/saved",
  "show saved": "/saved",
  favorites: "/saved",
  "saved properties": "/saved",

  "go to messages": "/messages",
  "open messages": "/messages",
  "my messages": "/messages",
  inbox: "/messages",
  "message center": "/messages",

  "my properties": "/properties",
  "owned properties": "/properties",
  "property portfolio": "/properties",

  // ===== DOCUMENTS & TASKS =====
  "go to documents": "/documents",
  "my documents": "/documents",
  "document manager": "/documents",
  files: "/documents",

  "go to tasks": "/tasks",
  "my tasks": "/tasks",
  "task manager": "/tasks",
  "to do list": "/tasks",

  "document vault": "/vault",
  "secure vault": "/vault",
  vault: "/vault",

  invoices: "/invoice",
  "my invoices": "/invoice",
  billing: "/invoice",

  // ===== TRANSACTION =====
  "deal team": "/deal-team",
  "transaction team": "/deal-team",
  "my deal team": "/deal-team",
  coordination: "/deal-team",

  // ===== LEARNING =====
  "go to academy": "/academy",
  "learning center": "/academy",
  education: "/academy",
  courses: "/academy",

  "academy progress": "/academy/progress",
  "my progress": "/academy/progress",
  "learning progress": "/academy/progress",

  "regional education": "/academy/regions",
  "region courses": "/academy/regions",

  // ===== FIRST HOME BUYERS =====
  "first home": "/first-home",
  "first home buyer": "/first-home",
  "first time buyer": "/first-home",
  "buying first home": "/first-home",
  "first home hub": "/first-home",

  "buyer progress": "/progress",
  "journey progress": "/progress",
  "my journey": "/progress",

  // ===== REGIONS & LOCATIONS =====
  regions: "/regions",
  "browse regions": "/regions",
  "regional search": "/regions",
  areas: "/regions",

  // ===== COLLABORATION =====
  team: "/team",
  "my team": "/team",
  "team collaboration": "/team",

  "voice rooms": "/rooms",
  "collaboration rooms": "/rooms",
  "meeting rooms": "/rooms",

  // ===== SHOWCASE =====
  experience: "/experience",
  "haus experience": "/experience",
  "platform showcase": "/experience",

  showcase: "/showcase",
  portfolio: "/showcase",

  // ===== DEMO PAGES (for development) =====
  "voice demo": "/voice-demo",
  "voice navigation demo": "/voice-nav-demo",
  "elevenlabs demo": "/voice-demo-elevenlabs",
  "copilot demo": "/copilot-demo",
} as const;

/**
 * Route categories for contextual help
 */
export const ROUTE_CATEGORIES = {
  discovery: ["search", "find", "explore", "compass", "stream", "regions"],
  intelligence: [
    "buyers-agent",
    "property-intelligence",
    "market-intelligence",
    "deephaus",
    "copilot",
    "watchdog",
    "trust",
  ],
  tools: ["appraisal", "affordability", "preapproval"],
  marketplace: ["market", "market/dashboard", "market/join", "market/quote"],
  listing: ["list", "list/create", "listing"],
  commercial: ["warehaus", "agency"],
  account: ["profile", "saved", "messages", "properties"],
  documents: ["documents", "tasks", "vault", "invoice"],
  transaction: ["deal-team"],
  learning: ["academy", "academy/progress", "academy/regions"],
  firstHome: ["first-home", "progress"],
  collaboration: ["team", "rooms"],
};

type NavigationCommand = keyof typeof NAVIGATION_COMMANDS;
type NavigationRoute = (typeof NAVIGATION_COMMANDS)[NavigationCommand];

export type VoiceNavigationResult = {
  success: boolean;
  command?: string;
  route?: string;
  error?: string;
  category?: string;
  suggestions?: string[];
};

/**
 * Get category for a route
 */
function getRouteCategory(route: string): string | undefined {
  const cleanRoute = route.replace(/^\//, "");
  for (const [category, routes] of Object.entries(ROUTE_CATEGORIES)) {
    if (routes.some((r) => cleanRoute.startsWith(r))) {
      return category;
    }
  }
  return;
}

/**
 * Find similar commands using Levenshtein distance
 */
function findSimilarCommands(
  input: string,
  maxSuggestions = 3
): NavigationCommand[] {
  const commands = Object.keys(NAVIGATION_COMMANDS) as NavigationCommand[];
  const distances = commands.map((cmd) => ({
    command: cmd,
    distance: levenshteinDistance(input.toLowerCase(), cmd.toLowerCase()),
  }));

  distances.sort((a, b) => a.distance - b.distance);

  return distances
    .slice(0, maxSuggestions)
    .filter((d) => d.distance < 10)
    .map((d) => d.command);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function useVoiceNavigation() {
  const router = useRouter();
  const [lastNavigation, setLastNavigation] =
    useState<VoiceNavigationResult | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * Parse voice input to extract navigation command
   */
  const parseNavigationCommand = useCallback(
    (text: string): NavigationRoute | null => {
      const normalizedText = text.toLowerCase().trim();

      // Direct match
      if (normalizedText in NAVIGATION_COMMANDS) {
        return NAVIGATION_COMMANDS[normalizedText as NavigationCommand];
      }

      // Fuzzy match - check if text contains a command
      for (const [command, route] of Object.entries(NAVIGATION_COMMANDS)) {
        if (normalizedText.includes(command)) {
          return route;
        }
      }

      // Pattern matching for common phrases
      const patterns = [
        { regex: /(?:go to|open|show|take me to)\s+(.+)/, prefix: true },
        { regex: /^(.+?)(?:\s+page|\s+section)?$/, prefix: false },
      ];

      for (const pattern of patterns) {
        const match = normalizedText.match(pattern.regex);
        if (match) {
          const extracted = match[1].trim();
          // Try to find a matching command
          for (const [command, route] of Object.entries(NAVIGATION_COMMANDS)) {
            if (
              command.includes(extracted) ||
              extracted.includes(command.replace(/^(go to|open|show)\s+/, ""))
            ) {
              return route;
            }
          }
        }
      }

      return null;
    },
    []
  );

  /**
   * Navigate to a route using voice command
   */
  const navigate = useCallback(
    async (command: string): Promise<VoiceNavigationResult> => {
      setIsNavigating(true);

      try {
        const route = parseNavigationCommand(command);

        if (!route) {
          const similarCommands = findSimilarCommands(command);
          const result: VoiceNavigationResult = {
            success: false,
            command,
            error: "Navigation command not recognized",
            suggestions: similarCommands,
          };
          setLastNavigation(result);
          setIsNavigating(false);
          return result;
        }

        // Navigate
        router.push(route);

        const category = getRouteCategory(route);
        const result: VoiceNavigationResult = {
          success: true,
          command,
          route,
          category,
        };
        setLastNavigation(result);
        setIsNavigating(false);
        return result;
      } catch (error) {
        const result: VoiceNavigationResult = {
          success: false,
          command,
          error: error instanceof Error ? error.message : "Navigation failed",
        };
        setLastNavigation(result);
        setIsNavigating(false);
        return result;
      }
    },
    [router, parseNavigationCommand]
  );

  /**
   * Check if text contains a navigation command
   */
  const hasNavigationCommand = useCallback(
    (text: string): boolean => parseNavigationCommand(text) !== null,
    [parseNavigationCommand]
  );

  /**
   * Get all available navigation commands
   */
  const getAvailableCommands = useCallback(
    () => Object.keys(NAVIGATION_COMMANDS),
    []
  );

  /**
   * Get commands by category
   */
  const getCommandsByCategory = useCallback((category: string) => {
    const routes = ROUTE_CATEGORIES[category as keyof typeof ROUTE_CATEGORIES];
    if (!routes) {
      return [];
    }

    return Object.entries(NAVIGATION_COMMANDS)
      .filter(([, route]) => {
        const cleanRoute = route.replace(/^\//, "");
        return routes.some((r) => cleanRoute.startsWith(r));
      })
      .map(([command]) => command);
  }, []);

  /**
   * Clear last navigation result
   */
  const clearLastNavigation = useCallback(() => {
    setLastNavigation(null);
  }, []);

  return {
    navigate,
    hasNavigationCommand,
    getAvailableCommands,
    getCommandsByCategory,
    parseNavigationCommand,
    lastNavigation,
    isNavigating,
    clearLastNavigation,
    categories: Object.keys(ROUTE_CATEGORIES),
  };
}
