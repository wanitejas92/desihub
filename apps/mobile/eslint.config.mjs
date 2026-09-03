import base from '@desihub/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...base,
  {
    ignores: [
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.ts',
      'expo-env.d.ts',
      '.expo/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { project: false },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
