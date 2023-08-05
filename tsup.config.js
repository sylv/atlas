import { defineConfig } from 'tsup';

/**
 * @param {import('tsup').Options} options
 */
export function createTsupConfig({
  entry = ['src/index.ts'],
  external = [],
  noExternal = [],
  platform = 'node',
  format = ['esm'],
  target = 'es2022',
  clean = true,
  shims = true,
  minify = false,
  splitting = true,
  keepNames = true,
  dts = true,
  sourcemap = true,
  esbuildPlugins = [],
} = {}) {
  return defineConfig({
    entry,
    external,
    noExternal,
    platform,
    format,
    target,
    clean,
    shims,
    minify,
    splitting,
    keepNames,
    dts,
    sourcemap,
    esbuildPlugins,
  });
}
