'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AccountUser } from '@desihub/shared';
import { mergeLocalAction, setFollowingAction, setSavedAction } from '@/lib/account/actions';
import {
  clearLegacyFollowSlugs,
  localFollows,
  localSavedEvents,
  readLegacyFollowSlugs,
  useLocalStore,
} from '@/lib/local-collections';

interface AccountContextValue {
  user: AccountUser | null;
  isSaved(eventId: string): boolean;
  toggleSaved(eventId: string): void;
  isFollowing(organiserId: string): boolean;
  toggleFollowing(organiserId: string): void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * One source of truth for "has this person saved/followed this?", whichever
 * side of sign-in they're on: the account (server, durable, cross-device)
 * when signed in, localStorage when not. Cards read from here instead of
 * each querying for themselves.
 *
 * Signed-in writes are optimistic — the heart fills immediately and the
 * server action reconciles — because a save is cheap to retry and awful to
 * wait for.
 */
export function AccountProvider({
  user,
  savedEventIds,
  followedOrganiserIds,
  children,
}: {
  user: AccountUser | null;
  savedEventIds: string[];
  followedOrganiserIds: string[];
  children: ReactNode;
}) {
  const [serverSaved, setServerSaved] = useState<ReadonlySet<string>>(() => new Set(savedEventIds));
  const [serverFollows, setServerFollows] = useState<ReadonlySet<string>>(
    () => new Set(followedOrganiserIds),
  );
  const localSaved = useLocalStore(localSavedEvents);
  const localFollowed = useLocalStore(localFollows);
  const mergedFor = useRef<string | null>(null);

  // Re-sync when the server sends a fresh snapshot (sign-in, sign-out, nav).
  useEffect(() => {
    setServerSaved(new Set(savedEventIds));
  }, [savedEventIds]);
  useEffect(() => {
    setServerFollows(new Set(followedOrganiserIds));
  }, [followedOrganiserIds]);

  // On sign-in, hand this device's anonymous collections to the account once,
  // then clear them so the two can't drift apart afterwards.
  useEffect(() => {
    if (!user || mergedFor.current === user.id) return;
    const saved = [...localSavedEvents.read()];
    const follows = [...localFollows.read()];
    const legacySlugs = readLegacyFollowSlugs();
    if (saved.length === 0 && follows.length === 0 && legacySlugs.length === 0) {
      mergedFor.current = user.id;
      return;
    }
    mergedFor.current = user.id;
    void mergeLocalAction({
      savedEventIds: saved,
      followedOrganiserIds: follows,
      followedOrganiserSlugs: legacySlugs,
    }).then((result) => {
      if (!result.merged) return;
      setServerSaved((prev) => new Set([...prev, ...saved]));
      setServerFollows((prev) => new Set([...prev, ...follows]));
      localSavedEvents.clear();
      localFollows.clear();
      clearLegacyFollowSlugs();
    });
  }, [user]);

  const isSaved = useCallback(
    (eventId: string) => (user ? serverSaved.has(eventId) : localSaved.has(eventId)),
    [user, serverSaved, localSaved],
  );

  const toggleSaved = useCallback(
    (eventId: string) => {
      if (!user) {
        localSavedEvents.toggle(eventId, !localSavedEvents.read().has(eventId));
        return;
      }
      const next = !serverSaved.has(eventId);
      setServerSaved((prev) => {
        const copy = new Set(prev);
        if (next) copy.add(eventId);
        else copy.delete(eventId);
        return copy;
      });
      void setSavedAction(eventId, next).then((result) => {
        if (result.ok) return;
        // The session ended under us — put the toggle back rather than
        // showing a save that never happened.
        setServerSaved((prev) => {
          const copy = new Set(prev);
          if (next) copy.delete(eventId);
          else copy.add(eventId);
          return copy;
        });
      });
    },
    [user, serverSaved],
  );

  const isFollowing = useCallback(
    (organiserId: string) =>
      user ? serverFollows.has(organiserId) : localFollowed.has(organiserId),
    [user, serverFollows, localFollowed],
  );

  const toggleFollowing = useCallback(
    (organiserId: string) => {
      if (!user) {
        localFollows.toggle(organiserId, !localFollows.read().has(organiserId));
        return;
      }
      const next = !serverFollows.has(organiserId);
      setServerFollows((prev) => {
        const copy = new Set(prev);
        if (next) copy.add(organiserId);
        else copy.delete(organiserId);
        return copy;
      });
      void setFollowingAction(organiserId, next).then((result) => {
        if (result.ok) return;
        setServerFollows((prev) => {
          const copy = new Set(prev);
          if (next) copy.delete(organiserId);
          else copy.add(organiserId);
          return copy;
        });
      });
    },
    [user, serverFollows],
  );

  return (
    <AccountContext.Provider value={{ user, isSaved, toggleSaved, isFollowing, toggleFollowing }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error(
      'useAccount must be used inside <AccountProvider> (mounted in the root layout)',
    );
  }
  return ctx;
}
