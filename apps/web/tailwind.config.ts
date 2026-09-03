import type { Config } from 'tailwindcss';
import { tokenPreset } from '@desihub/ui-tokens/tailwind-preset';

/**
 * Web Tailwind config. The design tokens come entirely from the shared preset
 * (colours resolve to CSS variables defined in tokens.css), so this file only
 * declares content sources.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  presets: [tokenPreset as Partial<Config>],
};

export default config;
