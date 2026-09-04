import { z } from 'zod';
import { CITIES, EVENT_CATEGORIES, EVENT_LANGUAGES } from '../constants';

/** What the profile form is allowed to change. Never role, never id, never email. */
export const profileUpdateSchema = z.object({
  name: z.string().trim().max(120).optional(),
  city: z.enum(CITIES).optional(),
  languages: z.array(z.enum(EVENT_LANGUAGES)).max(EVENT_LANGUAGES.length).default([]),
  interests: z.array(z.enum(EVENT_CATEGORIES)).max(EVENT_CATEGORIES.length).default([]),
  notifyEmail: z.boolean().default(true),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * The payload the browser hands up when folding device collections into an
 * account. Ids are opaque here on purpose: they are UUIDs behind Supabase but
 * readable keys (`ev-01`) behind the mock repository, and the real guards are
 * the foreign keys and the `user_id = auth.uid()` RLS policies — not a shape
 * check in the browser's payload.
 */
export const mergeLocalSchema = z.object({
  savedEventIds: z.array(z.string().min(1).max(64)).max(500).default([]),
  followedOrganiserIds: z.array(z.string().min(1).max(64)).max(500).default([]),
  /** Pre-accounts builds stored follows by slug; resolved server-side. */
  followedOrganiserSlugs: z.array(z.string().max(80)).max(500).default([]),
});
export type MergeLocalInput = z.infer<typeof mergeLocalSchema>;
