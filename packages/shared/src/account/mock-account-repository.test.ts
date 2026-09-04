import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockAccountRepository,
  mockSignIn,
  mockUserIdFor,
  resetMockAccounts,
} from './mock-account-repository';

const EVENT_A = '11111111-1111-4111-8111-111111111111';
const EVENT_B = '22222222-2222-4222-8222-222222222222';
const ORG_A = '33333333-3333-4333-8333-333333333333';

beforeEach(() => resetMockAccounts());

describe('mockUserIdFor', () => {
  it('is stable per email and case/whitespace insensitive', () => {
    expect(mockUserIdFor('a@b.nl')).toBe(mockUserIdFor('  A@B.NL '));
  });

  it('differs between emails', () => {
    expect(mockUserIdFor('a@b.nl')).not.toBe(mockUserIdFor('c@d.nl'));
  });

  it('is a well-formed v4 uuid (profiles.id is a uuid column)', () => {
    expect(mockUserIdFor('a@b.nl')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe('mockSignIn', () => {
  it('creates the account once and returns the same user after that', async () => {
    const first = mockSignIn('rehan@example.nl');
    const repo = new MockAccountRepository(first.id);
    await repo.setSaved(EVENT_A, true);

    const second = mockSignIn('rehan@example.nl');
    expect(second.id).toBe(first.id);
    // Signing in again must not wipe the account.
    expect(await new MockAccountRepository(second.id).listSavedEventIds()).toEqual([EVENT_A]);
  });
});

describe('MockAccountRepository', () => {
  it('saves and unsaves events', async () => {
    const user = mockSignIn('a@b.nl');
    const repo = new MockAccountRepository(user.id);

    await repo.setSaved(EVENT_A, true);
    await repo.setSaved(EVENT_B, true);
    expect((await repo.listSavedEventIds()).sort()).toEqual([EVENT_A, EVENT_B].sort());

    await repo.setSaved(EVENT_A, false);
    expect(await repo.listSavedEventIds()).toEqual([EVENT_B]);
  });

  it('follows and unfollows organisers', async () => {
    const user = mockSignIn('a@b.nl');
    const repo = new MockAccountRepository(user.id);

    await repo.setFollowing(ORG_A, true);
    expect(await repo.listFollowedOrganiserIds()).toEqual([ORG_A]);
    await repo.setFollowing(ORG_A, false);
    expect(await repo.listFollowedOrganiserIds()).toEqual([]);
  });

  it('keeps accounts separate', async () => {
    const one = mockSignIn('one@b.nl');
    const two = mockSignIn('two@b.nl');
    await new MockAccountRepository(one.id).setSaved(EVENT_A, true);

    expect(await new MockAccountRepository(two.id).listSavedEventIds()).toEqual([]);
  });

  it('merges device collections without duplicating existing rows', async () => {
    const user = mockSignIn('a@b.nl');
    const repo = new MockAccountRepository(user.id);
    await repo.setSaved(EVENT_A, true);

    await repo.mergeLocal({ savedEventIds: [EVENT_A, EVENT_B], followedOrganiserIds: [ORG_A] });
    await repo.mergeLocal({ savedEventIds: [EVENT_A, EVENT_B], followedOrganiserIds: [ORG_A] });

    expect((await repo.listSavedEventIds()).sort()).toEqual([EVENT_A, EVENT_B].sort());
    expect(await repo.listFollowedOrganiserIds()).toEqual([ORG_A]);
  });

  it('updates only the profile fields it is given', async () => {
    const user = mockSignIn('a@b.nl');
    const repo = new MockAccountRepository(user.id);

    await repo.updateProfile({ name: 'Rehan', city: 'Utrecht' });
    await repo.updateProfile({ languages: ['Hindi'] });

    const updated = await repo.getUser();
    expect(updated?.name).toBe('Rehan');
    expect(updated?.city).toBe('Utrecht');
    expect(updated?.languages).toEqual(['Hindi']);
    // Email and role are not settable through the profile form.
    expect(updated?.email).toBe('a@b.nl');
    expect(updated?.role).toBe('attendee');
  });

  it('returns null for an unknown user rather than inventing one', async () => {
    expect(await new MockAccountRepository(mockUserIdFor('ghost@b.nl')).getUser()).toBeNull();
  });
});
