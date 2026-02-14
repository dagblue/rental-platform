module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': {
            message: 'Use Record<string, never> instead',
            fixWith: 'Record<string, never>',
          },
          object: {
            message: 'Use Record<string, unknown> instead',
            fixWith: 'Record<string, unknown>',
          },
          Function: {
            message: 'Use specific function type instead',
          },
          Boolean: {
            message: 'Use boolean instead',
          },
        },
        extendDefaults: true,
      },
    ],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '**/*.js',
    '**/*.d.ts',
    '.turbo/',
    '.husky/',
    'coverage/',
  ],
};
