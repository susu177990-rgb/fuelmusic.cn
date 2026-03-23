const next = require('eslint-config-next');

module.exports = [
  ...next,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    ignores: [
      'node_modules',
      '.next',
      'public',
      'scripts',
      '**/*.backup',
      '**/*.bak*'
    ],
  },
  {
    files: ['src/app/api/**/route.ts', 'src/middleware.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];