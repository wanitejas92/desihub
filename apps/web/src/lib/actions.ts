'use server';

import { submitEventSchema, subscribeSchema } from '@desihub/shared';
import { getRepository } from '@/lib/data';

export interface ActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
  slug?: string;
}

function flattenErrors(issues: { path: (string | number)[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '_');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function submitEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    title: (formData.get('title') as string)?.trim(),
    starts_at: toIso(formData.get('starts_at') as string),
    city: formData.get('city') as string,
    category: emptyToUndefined(formData.get('category') as string),
    venue_name: emptyToUndefined(formData.get('venue_name') as string),
    description: emptyToUndefined(formData.get('description') as string),
    organiser_name: emptyToUndefined(formData.get('organiser_name') as string),
    contact_email: (formData.get('contact_email') as string) || '',
    ticket_url: (formData.get('ticket_url') as string) || '',
    is_free: formData.get('is_free') === 'on',
  };

  const parsed = submitEventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors: flattenErrors(parsed.error.issues),
    };
  }

  try {
    const repo = await getRepository();
    const result = await repo.submitEvent(parsed.data);
    return {
      status: 'success',
      message: 'Thank you! Your event has been submitted for review.',
      slug: result.slug,
    };
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' };
  }
}

export async function subscribeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: (formData.get('email') as string)?.trim(),
    city: emptyToUndefined(formData.get('city') as string),
    interests: formData.getAll('interests').map(String),
  };

  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: flattenErrors(parsed.error.issues) };
  }

  try {
    const repo = await getRepository();
    await repo.subscribe(parsed.data);
    return { status: 'success', message: "You're in! We'll send events you'll love." };
  } catch {
    return { status: 'error', message: 'Something went wrong. Please try again.' };
  }
}

function emptyToUndefined(v: string | null): string | undefined {
  const t = (v ?? '').trim();
  return t.length ? t : undefined;
}

function toIso(local: string | null): string {
  if (!local) return '';
  // datetime-local has no timezone; interpret as Europe/Amsterdam-ish local.
  const d = new Date(local);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}
