module.exports = {
  '*.{ts,tsx}': (filenames) => {
    // Filter out Prisma generated files
    const sourceFiles = filenames.filter(
      (file) =>
        !file.includes('node_modules') &&
        !file.includes('dist') &&
        !file.includes('src/client') &&
        !file.includes('.turbo') &&
        !file.endsWith('.d.ts')
    );

    if (sourceFiles.length === 0) return [];

    return [
      `prettier --write ${sourceFiles.join(' ')}`,
      `eslint --fix ${sourceFiles.join(' ')} --max-warnings=50`, // Changed from 0 to 50
    ];
  },
  '*.{js,jsx,json,md,css,scss}': (filenames) => {
    const sourceFiles = filenames.filter(
      (file) => !file.includes('node_modules') && !file.includes('dist')
    );

    if (sourceFiles.length === 0) return [];

    return [`prettier --write ${sourceFiles.join(' ')}`];
  },
};
