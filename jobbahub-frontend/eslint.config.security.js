// eslint.config.security.js
// Security-focused ESLint configuration for React/TypeScript
// Add this to your existing eslint.config.js or replace it

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // === REACT HOOKS ===
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // === SECURITY RULES ===
      
      // Prevent dangerous patterns
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Prevent prototype pollution
      'no-proto': 'error',
      'no-extend-native': 'error',
      
      // Prevent regex DoS
      'no-invalid-regexp': 'error',
      
      // TypeScript specific security
      '@typescript-eslint/no-explicit-any': 'warn', // Flag any usage
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Prevent dangerous DOM manipulation
      'no-restricted-properties': [
        'error',
        {
          object: 'document',
          property: 'write',
          message: 'document.write is a security risk. Use DOM methods instead.',
        },
        {
          object: 'window',
          property: 'eval',
          message: 'eval() is dangerous. Find an alternative.',
        },
      ],
      
      // Restrict dangerous globals
      'no-restricted-globals': [
        'error',
        {
          name: 'event',
          message: 'Use local parameter instead of global event.',
        },
        {
          name: 'innerHTML',
          message: 'innerHTML can lead to XSS. Use textContent or sanitize input.',
        },
      ],

      // Console statements (warn in dev, error in production)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Prevent accidental secrets
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/password|secret|api.?key|token/i]',
          message: 'Potential hardcoded secret detected. Use environment variables.',
        },
        {
          selector: 'TemplateLiteral[quasis.0.value.raw=/password|secret|api.?key/i]',
          message: 'Potential hardcoded secret in template literal.',
        },
      ],
    },
  },
  
  // Stricter rules for service files (API calls, auth)
  {
    files: ['**/services/**/*.{ts,tsx}', '**/context/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // Stricter in sensitive areas
      'no-console': 'error',
    },
  }
);
