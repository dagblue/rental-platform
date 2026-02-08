module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',      // New feature
          'fix',       // Bug fix
          'docs',      // Documentation
          'style',     // Formatting, missing semi colons, etc
          'refactor',  // Code refactoring
          'test',      // Adding tests
          'chore',     // Build process or auxiliary tool changes
          'ci',        // CI related changes
          'perf',      // Performance improvement
          'build',     // Build system or external dependencies
          'revert',    // Revert previous commit
          'wip',       // Work in progress
          'security',  // Security improvements
          'i18n',      // Internationalization
          'a11y'       // Accessibility
        ]
      ],
      'scope-case': [2, 'always', 'kebab-case'],
      'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
      'subject-max-length': [2, 'always', 100]
    }
  };