import { requireAdmin } from '@/lib/account/guards';
import { getAdminRepository } from '@/lib/admin';
import { RoleSelect } from '@/components/admin/role-select';

export default async function AdminUsersPage() {
  const [admin, repo] = await Promise.all([requireAdmin(), getAdminRepository()]);
  if (!repo) return null;
  const users = await repo.listUsers();

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">People</h2>
      <p className="text-fg-muted mt-1 mb-5 text-sm">
        Attendees become organisers automatically when their first event is published — you rarely
        need to promote by hand. Admins are set here and nowhere else.
      </p>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-fg-muted text-left text-xs uppercase">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Person
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                City
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                Published
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="text-fg font-semibold">{u.name ?? '—'}</p>
                  <p className="text-fg-muted text-xs">{u.email ?? u.id}</p>
                </td>
                <td className="text-fg-muted px-4 py-3">{u.city ?? '—'}</td>
                <td className="text-fg-muted px-4 py-3 text-right tabular-nums">
                  {u.published_events}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect userId={u.id} role={u.role} self={u.id === admin.id} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-fg-muted px-4 py-8 text-center">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
