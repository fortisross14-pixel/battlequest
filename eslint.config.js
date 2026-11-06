import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'screenshots'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Keep the simulation core pure: no DOM, no Pixi, no randomness, no timers.
    files: ['src/core/**/*.ts', 'src/content/**/*.ts', 'src/ai/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-restricted-imports': ['error', { patterns: ['pixi.js', '**/render/**', '**/ui/**'] }],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the seeded RNG in src/core/rng.ts.' },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'setTimeout',
        'setInterval',
        'requestAnimationFrame',
      ],
    },
  },
);
