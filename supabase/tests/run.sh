#!/usr/bin/env bash
#
# Runs the SQL regression suite against a throwaway Postgres.
#
#   ./supabase/tests/run.sh
#
# Builds a fresh cluster in a temp directory, applies the Supabase shim and
# then every migration in supabase/migrations/ in filename order, runs each
# *.test.sql, and tears the cluster down. Nothing touches a real project, so
# this is safe to run anywhere Postgres 14+ is installed and is what proves
# the /submit fix without needing network access to Supabase.
#
# Exit code is the result: 0 = all checks passed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATIONS="$ROOT/supabase/migrations"
TESTS="$ROOT/supabase/tests"
PORT="${PGTESTPORT:-55432}"

# Prefer a versioned bin dir (Debian/Ubuntu put the server there while only
# the client is on PATH), else fall back to whatever is on PATH.
PGBIN=""
for d in /usr/lib/postgresql/*/bin /usr/local/pgsql/bin /opt/homebrew/opt/postgresql*/bin; do
  [ -x "$d/initdb" ] && PGBIN="$d"
done
if [ -z "$PGBIN" ]; then
  command -v initdb >/dev/null 2>&1 || {
    echo "error: no Postgres server binaries found (need initdb + pg_ctl)." >&2
    echo "       install postgresql, e.g. apt-get install postgresql-16" >&2
    exit 127
  }
  PGBIN="$(dirname "$(command -v initdb)")"
fi

# Postgres refuses to run as root, so when invoked as root do the work as the
# `postgres` system user in a directory it owns.
RUNAS=""
if [ "$(id -u)" -eq 0 ]; then
  id postgres >/dev/null 2>&1 || { echo "error: running as root and no 'postgres' user exists." >&2; exit 1; }
  RUNAS="postgres"
  WORK="$(mktemp -d /var/lib/postgresql/dhtest.XXXXXX)"
else
  WORK="$(mktemp -d)"
fi

cleanup() {
  run "$PGBIN/pg_ctl -D $WORK/data -m immediate stop" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

run() { if [ -n "$RUNAS" ]; then su "$RUNAS" -c "$1"; else bash -c "$1"; fi; }

# Migrations and tests must be readable by whoever runs psql.
cp "$MIGRATIONS"/*.sql "$TESTS"/*.sql "$WORK/"
[ -n "$RUNAS" ] && chown -R "$RUNAS" "$WORK"

echo "==> initialising a throwaway cluster in $WORK"
run "$PGBIN/initdb -D $WORK/data -U postgres --auth=trust" >/dev/null
# Unix socket only, no TCP: two runs cannot collide and nothing is exposed.
run "$PGBIN/pg_ctl -D $WORK/data -o '-p $PORT -k $WORK -c listen_addresses=' -l $WORK/pg.log start" >/dev/null
run "$PGBIN/psql -h $WORK -p $PORT -U postgres -qc 'create database desihub_test;'"

PSQL="$PGBIN/psql -h $WORK -p $PORT -U postgres -d desihub_test -v ON_ERROR_STOP=1 -q"

echo "==> applying the Supabase shim"
run "$PSQL -f $WORK/_supabase_shim.sql"

echo "==> applying migrations"
for f in "$MIGRATIONS"/*.sql; do
  name="$(basename "$f")"
  printf '    %s' "$name"
  run "$PSQL -f $WORK/$name" 2>&1 | sed 's/^/      /'
  printf '\n'
done

echo "==> running tests"
failed=0
for t in "$TESTS"/*.test.sql; do
  name="$(basename "$t")"
  echo "--- $name"
  if run "$PGBIN/psql -h $WORK -p $PORT -U postgres -d desihub_test -v ON_ERROR_STOP=1 -q -f $WORK/$name" 2>&1 \
       | sed 's/^psql:[^ ]* //'; then
    echo "    PASS"
  else
    echo "    FAIL"
    failed=1
  fi
done

[ "$failed" -eq 0 ] && echo "==> all checks passed" || echo "==> FAILURES"
exit "$failed"
