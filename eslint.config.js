import antfu, { GLOB_SRC } from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist/**/*',
  ],
  isInEditor: false,
  formatters: true,
  react: {
    overrides: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
}, {
  files: [
    GLOB_SRC,
  ],
  rules: {
    'no-alert': 'off',
    'no-console': 'off',
    'style/no-multiple-empty-lines': ['error', { max: 1 }],
  },
})
