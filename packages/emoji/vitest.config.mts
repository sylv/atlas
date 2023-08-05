/* eslint-disable import/no-default-export */
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./setup.ts'],
  },
});
