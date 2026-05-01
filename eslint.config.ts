import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['node_modules', 'dist'],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, 'simple-import-sort': simpleImportSort },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);
