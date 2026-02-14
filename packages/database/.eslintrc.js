module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['../../.eslintrc.js'],
  rules: {
    'no-console': 'off', // Allow console in database scripts
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'src/client/**/*',
    '**/*.js',
    '**/*.d.ts',
    'prisma/**/*',
  ],
};
