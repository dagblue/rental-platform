module.exports = {
  '**/*.{ts,tsx}': (filenames) => {
    // Filter out generated files
    const sourceFiles = filenames.filter(
      (f) => !f.includes('node_modules') && 
             !f.includes('dist') && 
             !f.includes('/client/') && 
             !f.includes('/runtime/')
    );
    
    if (sourceFiles.length === 0) return [];
    
    return [
      `npx prettier --write ${sourceFiles.join(' ')}`,
      `npx eslint --fix ${sourceFiles.join(' ')} --max-warnings=10`
    ];
  },
  '**/*.{js,jsx,json,md}': (filenames) => {
    const sourceFiles = filenames.filter(
      (f) => !f.includes('node_modules') && !f.includes('dist')
    );
    
    if (sourceFiles.length === 0) return [];
    
    return [`npx prettier --write ${sourceFiles.join(' ')}`];
  }
};
