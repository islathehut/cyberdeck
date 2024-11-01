import love from 'eslint-config-love'

export default [
  {
    ...love,
  },
  {
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off'
      },
      files: [
        "src/**/*.ts",
      ],
  },
  {
    ignores: [
      "**/*.config.mjs", 
      "bundle/*",
      "dist/*",
      "src/components/actionSelect.ts"
    ],
  }
];