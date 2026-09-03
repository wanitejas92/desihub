import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';
import { tokenPreset } from '@desihub/ui-tokens/tailwind-preset';

/**
 * NativeWind (Tailwind v3) config. Colours resolve to CSS variables defined
 * in global.css, so the same class names render consistently on device.
 * Light-only by brief — no dark theme. Loaded via jiti, which resolves the
 * shared TypeScript preset.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [nativewindPreset as Partial<Config>, tokenPreset as Partial<Config>],
};

export default config;
