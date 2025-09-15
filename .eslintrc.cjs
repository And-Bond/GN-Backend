export default {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  env: {
    browser: true,   // Enables browser globals like `window` and `document`
    es2021: true,    // Sets the ECMAScript version to 2021
    node: true       // Enables Node.js global variables like `require`
  },
  extends: [
    'eslint:recommended', // Use the recommended rules from ESLint
    'plugin:@typescript-eslint/recommended', // Use recommended rules for TypeScript
  ],
  parserOptions: {
    project: './tsconfig.json', // Points to your tsconfig.json to ensure path aliasing works
    ecmaVersion: 2021, // Use ECMAScript 2021
    sourceType: 'module', // Allows the use of import/export syntax
  },
  rules: {
    // Customize your rules here
    'no-undef': 'error',           // Disallow use of undeclared variables
    'no-unused-vars': 'warn',      // Warn on unused variables
    'quotes': ['warn', 'single'],  // Use single quotes
    '@typescript-eslint/no-unused-vars': 'warn', // Ensure TypeScript handles unused variables
    '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type (can be turned on if needed)
  },
  globals: {
    ...require('globals').browser, // Import browser globals from the `globals` package
    // You can also add any custom global variables here
  },
};
