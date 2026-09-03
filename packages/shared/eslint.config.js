import base from '@desihub/eslint-config';

export default [
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { project: false },
    },
  },
];
