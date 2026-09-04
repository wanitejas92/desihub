import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@desihub/shared', '@desihub/ui-tokens'],
  images: {
    formats: ['image/webp'],
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'localhost:3000', '*.app.github.dev'],
    },
  },
};

export default nextConfig;
