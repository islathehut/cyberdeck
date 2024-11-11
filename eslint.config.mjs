import love from 'eslint-config-love'

import path from 'path';

export default [
  {
    ...love,
  },
  {
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off'
      },
      files: [
        "src/**/*.ts"
      ],
  },
  {
    ignores: [
      "**/*.config.mjs", 
      "bundle/*",
      "dist/*",
      "src/components/actionSelect.ts",
      "src/**/*.autogen.*",
      "coverage-map.mjs",
      "tap-snapshots-windows/*",
      "tap-snapshots-unix/*",
      "test/*"
    ],
  }
];