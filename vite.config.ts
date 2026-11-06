import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: { host: true },
  test: {
    include: ['tests/**/*.test.ts'],
    // Whole AI battles run in some tests; slow machines (or a balance run) need headroom.
    testTimeout: 30000,
    environment: 'node',
  },
});
