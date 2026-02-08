const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Map workspace packages to their actual paths for Metro resolver
config.resolver.extraNodeModules = {
  '@v1/backend': path.resolve(monorepoRoot, 'packages/backend'),
  '@v1/backend/convex': path.resolve(monorepoRoot, 'packages/backend/convex'),
  '@v1/backend/convex/_generated': path.resolve(monorepoRoot, 'packages/backend/convex/_generated'),
  '@v1/ui': path.resolve(monorepoRoot, 'packages/ui'),
  '@v1/typescript': path.resolve(monorepoRoot, 'packages/typescript'),
  '@v1/logger': path.resolve(monorepoRoot, 'packages/logger'),
  '@haus/mobile': path.resolve(monorepoRoot, 'apps/mobile'),
};

// 5. Configure for NativeWind
module.exports = withNativeWind(config, { input: './global.css' });
