import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase auth session on navigation so server components
 * always see a valid token. It is a no-op when Supabase env is absent (the
 * dev/offline mock session is a plain cookie that needs no refreshing), which
 * keeps local and E2E runs free of any auth round trips.
 *
 * Also forwards the requested pathname as `x-pathname` — a layout (unlike a
 * page) has no way to read its own route otherwise, and the shared
 * /account layout needs it to send a signed-out visitor back to the exact
 * page they asked for (/account/tickets, /account/saved, …) after signing
 * in, rather than always the generic /account.
 */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request: { headers: requestHeaders } });

  const { createServerClient } = await import('@supabase/ssr');
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser() is what performs the refresh-and-rewrite of the cookies.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
  ],
};
