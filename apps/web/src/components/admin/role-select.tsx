'use client';

import { useRef } from 'react';
import { PROFILE_ROLES, type ProfileRole } from '@desihub/shared';
import { setRoleAction } from '@/lib/admin/actions';

const LABELS: Record<ProfileRole, string> = {
  attendee: 'Attendee',
  organiser: 'Organiser',
  admin: 'Admin',
};

/**
 * Role picker that saves on change — there is no draft state worth keeping,
 * and a separate Save button on every row is noise. `self` disables the
 * control: demoting yourself locks you out of the portal, and the only way
 * back is a SQL console.
 */
export function RoleSelect({
  userId,
  role,
  self,
}: {
  userId: string;
  role: ProfileRole;
  self: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (self) {
    return (
      <span className="text-fg-muted inline-flex items-center gap-1.5 text-xs font-semibold">
        {LABELS[role]}
        <span className="text-fg-subtle font-normal">(you)</span>
      </span>
    );
  }

  return (
    <form ref={formRef} action={setRoleAction}>
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label="Role"
        onChange={() => formRef.current?.requestSubmit()}
        className="border-border bg-surface text-fg rounded-md border px-2 py-1 text-xs font-semibold"
      >
        {PROFILE_ROLES.map((r) => (
          <option key={r} value={r}>
            {LABELS[r]}
          </option>
        ))}
      </select>
    </form>
  );
}
