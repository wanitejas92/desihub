'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { CITIES, EVENT_CATEGORIES, PROFILE_ROLES } from '@desihub/shared';
import { requireAdmin } from '@/lib/account/guards';
import { getAdminRepository } from './index';

export interface AdminActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
  slug?: string;
}

/**
 * Every action here re-checks `requireAdmin()`. The layout guard protects the
 * *page*; a server action is its own endpoint and is reachable without ever
 * rendering that page, so it has to ask again. RLS is the third check.
 */
async function adminContext() {
  const admin = await requireAdmin();
  const repo = await getAdminRepository();
  return { admin, repo };
}

const notConfigured: AdminActionState = {
  status: 'error',
  message: 'Admin tools need Supabase configured.',
};

/** Publishing revalidates the surfaces a newly live event should appear on. */
function revalidatePublicSurfaces() {
  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function approveEventAction(formData: FormData): Promise<void> {
  const { admin, repo } = await adminContext();
  if (!repo) return;
  const id = formData.get('event_id') as string;
  if (!id) return;
  await repo.approve(id, admin.id);
  revalidatePublicSurfaces();
}

export async function rejectEventAction(formData: FormData): Promise<void> {
  const { admin, repo } = await adminContext();
  if (!repo) return;
  const id = formData.get('event_id') as string;
  if (!id) return;
  const note = ((formData.get('review_note') as string) || '').trim();
  await repo.reject(id, admin.id, note || 'Did not meet our listing guidelines.');
  revalidatePublicSurfaces();
}

export async function returnToQueueAction(formData: FormData): Promise<void> {
  const { repo } = await adminContext();
  if (!repo) return;
  const id = formData.get('event_id') as string;
  if (!id) return;
  await repo.returnToQueue(id);
  revalidatePublicSurfaces();
}

const roleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(PROFILE_ROLES),
});

export async function setRoleAction(formData: FormData): Promise<void> {
  const { admin, repo } = await adminContext();
  if (!repo) return;
  const parsed = roleSchema.safeParse({
    user_id: formData.get('user_id'),
    role: formData.get('role'),
  });
  if (!parsed.success) return;
  // Demoting yourself would lock you out of the portal mid-session, and the
  // recovery is a SQL console. Refuse it rather than explain it afterwards.
  if (parsed.data.user_id === admin.id) return;
  await repo.setRole(parsed.data.user_id, parsed.data.role);
  revalidatePath('/admin/users');
}

const createEventSchema = z.object({
  title: z.string().min(1, 'Give the event a title').max(200),
  starts_at: z.string().min(1, 'Pick a date and time'),
  ends_at: z.string().nullable(),
  city: z.enum(CITIES, { message: 'Pick a city' }),
  category: z.enum(EVENT_CATEGORIES, { message: 'Pick a category' }),
  venue_name: z.string().max(200).nullable(),
  organiser_name: z.string().min(1, 'Who is running it?').max(200),
  description: z.string().max(8000).nullable(),
  image_url: z.string().url('That does not look like an image URL').nullable(),
  poster_image_url: z.string().url('That does not look like an image URL').nullable(),
  is_free: z.boolean(),
  min_price_cents: z.number().int().nonnegative().nullable(),
  booking_url: z.string().url('That does not look like a link').nullable().or(z.literal(null)),
  featured: z.boolean(),
});

export async function createEventAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { admin, repo } = await adminContext();
  if (!repo) return notConfigured;

  const isFree = formData.get('is_free') === 'on';
  const raw = {
    title: (formData.get('title') as string)?.trim(),
    starts_at: toIso(formData.get('starts_at') as string),
    ends_at: toIso(formData.get('ends_at') as string),
    city: formData.get('city') as string,
    category: formData.get('category') as string,
    venue_name: blankToNull(formData.get('venue_name') as string),
    organiser_name: (formData.get('organiser_name') as string)?.trim(),
    description: blankToNull(formData.get('description') as string),
    image_url: blankToNull(formData.get('image_url') as string),
    poster_image_url: blankToNull(formData.get('poster_image_url') as string),
    is_free: isFree,
    min_price_cents: isFree ? null : eurosToCents(formData.get('price') as string),
    booking_url: blankToNull(formData.get('booking_url') as string),
    featured: formData.get('featured') === 'on',
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  try {
    const slug = await repo.createPublishedEvent(parsed.data, admin.id);
    revalidatePublicSurfaces();
    return { status: 'success', message: 'Event is live.', slug };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Could not create the event.',
    };
  }
}

/** `datetime-local` gives a bare local timestamp; the column wants an instant. */
function toIso(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function blankToNull(value: string | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

function eurosToCents(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  image_url: z.string().url('Must be a valid image URL'),
  event_link: z.string().url('Must be a valid URL').nullable().or(z.literal('')),
});

export async function createBannerAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { repo } = await adminContext();
  if (!repo) return notConfigured;

  const raw = {
    title: (formData.get('title') as string)?.trim(),
    image_url: (formData.get('image_url') as string)?.trim(),
    event_link: blankToNull(formData.get('event_link') as string),
  };

  const parsed = createBannerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const db = await createClient();
    const { error } = await db.from('banners').insert({
      title: parsed.data.title,
      image_url: parsed.data.image_url,
      link_url: parsed.data.event_link,
      active: true,
    });
    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { status: 'success', message: 'Banner created successfully.' };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Could not create the banner.',
    };
  }
}
