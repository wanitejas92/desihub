import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabase } from '@/lib/data';

/**
 * Magic-link landing. Supabase sends the user here with a `code`, which is
 * exchanged for a session cookie. `next` is validated as a same-site path so
 * the link cannot be used as an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (!hasSupabase() || !code) {
    return NextResponse.redirect(`${origin}/sign-in?error=link`);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const db = await createClient();
  const { error } = await db.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=link`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}

/** Only same-site absolute paths, never `//host` (protocol-relative) or a full URL. */
function safeNext(value: string | null): string {
  if (!value) return '/account';
  if (!value.startsWith('/') || value.startsWith('//')) return '/account';
  return value;
}
