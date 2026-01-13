// lint-staged.config.js
// Configuration for running linters on staged files

export default {
  // TypeScript/JavaScript files
  '*.{ts,tsx,js,jsx}': [
    // Run ESLint with auto-fix
    'eslint --fix --max-warnings 0',
    // Type check (for .ts/.tsx files)
    () => 'tsc --noEmit',
  ],
  
  // JSON files (package.json, tsconfig, etc.)
  '*.json': [
    'prettier --write',
  ],
  
  // All files - secret detection
  '*': [
    // Check for secrets
    'secretlint',
  ],
  
  // Specific security check for sensitive files
  '**/services/**/*.{ts,tsx}': [
    'eslint --fix --rule "@typescript-eslint/no-explicit-any: error"',
  ],
  
  '**/context/**/*.{ts,tsx}': [
    'eslint --fix --rule "@typescript-eslint/no-explicit-any: error"',
  ],
};
