import { describe, it, expect } from 'vitest';
import { describeDbError, SubmitEventError } from './errors';

/**
 * The contract these lock down is "a failed submission always says something
 * specific". The bug this replaced returned the same eleven words
 * ("Something went wrong. Please try again.") for a missing column, a
 * refused policy and an unreachable host — so the one failure that was
 * happening every single time looked like bad luck.
 */
describe('describeDbError', () => {
  it('passes through a message already written for the reader', () => {
    const err = new SubmitEventError('Give your event a title', null);
    expect(describeDbError(err, 'event')).toBe('Give your event a title');
  });

  it('passes through a raise exception from submit_public_event', () => {
    const err = { code: '23514', message: 'City is required' };
    expect(describeDbError(err, 'event')).toBe('City is required');
  });

  it('explains an RLS refusal — the actual production bug', () => {
    const err = {
      code: '42501',
      message: 'new row violates row-level security policy for table "event_sources"',
    };
    const msg = describeDbError(err, 'event');
    expect(msg).toMatch(/permission/i);
    expect(msg).toContain('0014_public_event_submission.sql');
  });

  it('names the missing column on schema drift', () => {
    const err = {
      code: '42703',
      message: 'column "poster_image_url" of relation "events" does not exist',
    };
    const msg = describeDbError(err, 'event');
    expect(msg).toContain('poster_image_url');
    expect(msg).toMatch(/migration/i);
  });

  it('handles the PostgREST schema-cache variant of a missing column', () => {
    const err = { code: 'PGRST204', message: "Could not find the 'highlights' column" };
    expect(describeDbError(err, 'event')).toMatch(/migration/i);
  });

  it('tells you the RPC itself is not installed', () => {
    const err = { code: 'PGRST202', message: 'function public.submit_public_event does not exist' };
    expect(describeDbError(err, 'event')).toContain('0014_public_event_submission.sql');
  });

  it('turns a slug collision into an instruction, not a constraint name', () => {
    const err = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "events_slug_key"',
    };
    expect(describeDbError(err, 'event')).toMatch(/change the title/i);
  });

  it('names the empty required column', () => {
    const err = { code: '23502', message: 'null value in column "starts_at" violates not-null' };
    expect(describeDbError(err, 'event')).toContain('starts_at');
  });

  it('explains a bad enum value — the old category: "community" bug', () => {
    const err = {
      code: '22P02',
      message: 'invalid input value for enum event_category: "community"',
    };
    expect(describeDbError(err, 'event')).toMatch(/event_category/);
  });

  it('recognises an auth/key problem', () => {
    expect(describeDbError({ message: 'Invalid API key' }, 'event')).toMatch(/Supabase keys/i);
  });

  it('recognises an unreachable database', () => {
    expect(describeDbError({ message: 'fetch failed' }, 'event')).toMatch(/reach the database/i);
  });

  it('keeps an unrecognised message rather than flattening it', () => {
    const err = { code: 'XX999', message: 'something exotic happened', details: 'at line 4' };
    const msg = describeDbError(err, 'event');
    expect(msg).toContain('something exotic happened');
    expect(msg).toContain('at line 4');
  });

  it('never returns an empty string, even for a thrown null', () => {
    expect(describeDbError(null, 'event')).toBe('Could not save the event.');
    expect(describeDbError(undefined, 'event').length).toBeGreaterThan(0);
    expect(describeDbError({}, 'event').length).toBeGreaterThan(0);
  });
});
