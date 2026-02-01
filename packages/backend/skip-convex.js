#!/usr/bin/env node

// Check if we should skip Convex dev in CI/non-interactive mode
const shouldSkip = process.env.CI || process.env.SKIP_CONVEX;

if (shouldSkip) {
  console.log('Skipping Convex dev in non-interactive mode (set CI or SKIP_CONVEX to enable)');
  process.exit(1); // Exit with error to skip the && part
}

// Check for CONVEX_DEPLOYMENT in environment
if (!process.env.CONVEX_DEPLOYMENT) {
  console.log('CONVEX_DEPLOYMENT not set, skipping Convex dev...');
  process.exit(1);
}

console.log('Starting Convex dev server...');
process.exit(0); // Exit successfully to continue with convex dev
