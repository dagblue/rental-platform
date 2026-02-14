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
    'no-console': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'vite.config.ts', // Add this line to ignore the vite config
    '**/*.js',
    '**/*.d.ts',
  ],
};
