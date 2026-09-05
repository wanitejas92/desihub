/**
 * Turning a Postgres/PostgREST failure into something a person can act on.
 *
 * Both event-creation paths used to end in `catch { return 'Something went
 * wrong. Please try again.' }`. That message is the reason a broken submit
 * form looked like a mystery for so long: the database was returning a
 * precise diagnosis every single time — "new row violates row-level security
 * policy for table event_sources" — and we threw it away before anyone could
 * read it.
 *
 * So: no bare catches. Every failure is mapped to a specific sentence, and
 * anything unrecognised keeps the database's own message rather than being
 * flattened into a generic one.
 */

/** The shape both `postgrest-js` errors and thrown PG errors share. */
export interface DbErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

function asDbError(err: unknown): DbErrorLike {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    return {
      code: typeof e.code === 'string' ? e.code : undefined,
      message: typeof e.message === 'string' ? e.message : undefined,
      details: typeof e.details === 'string' ? e.details : null,
      hint: typeof e.hint === 'string' ? e.hint : null,
    };
  }
  return { message: typeof err === 'string' ? err : undefined };
}

/**
 * `MIGRATION_HINT` names the file rather than saying "contact support",
 * because for the two schema-drift codes the fix genuinely is "run this
 * migration" — and the person seeing this in a server log is the person who
 * can run it.
 */
const MIGRATION_HINT =
  'The database schema is out of date — run the migrations in supabase/migrations/ ' +
  '(0014_public_event_submission.sql brings a partially-migrated database up to date).';

/**
 * @param err     whatever was thrown or returned in `{ error }`
 * @param subject what was being written, e.g. "event" — used in the fallback
 */
export function describeDbError(err: unknown, subject = 'record'): string {
  // Already phrased for a reader by whoever threw it — don't re-derive it.
  if (err instanceof SubmitEventError) return err.message;

  const { code, message, details } = asDbError(err);

  switch (code) {
    // A `raise exception` in submit_public_event: the message is already
    // written for the submitter ("Give your event a title"), so pass it on.
    case '23514':
      return message || `That ${subject} was rejected by a database rule.`;

    // RLS refused the write. This was the actual bug behind the broken form.
    case '42501':
      return (
        `You do not have permission to create this ${subject}. ` +
        'If you are submitting without an account, this means the public submission ' +
        'function is missing — apply supabase/migrations/0014_public_event_submission.sql.'
      );

    // The RPC itself is absent: 0014 has not been applied.
    case '42883':
    case 'PGRST202':
      return (
        'The public submission function is not installed in the database. ' +
        'Apply supabase/migrations/0014_public_event_submission.sql, then try again.'
      );

    // Schema drift — a column the code writes does not exist. Name it.
    case '42703':
    case 'PGRST204': {
      const column = message?.match(/column "?([\w.]+)"?/i)?.[1];
      return column
        ? `The database is missing the "${column}" column. ${MIGRATION_HINT}`
        : `The database is missing a column this ${subject} needs. ${MIGRATION_HINT}`;
    }

    case '23505':
      return message?.includes('slug')
        ? 'An event with that link already exists. Change the title slightly and try again.'
        : `That ${subject} already exists.`;

    case '23503':
      return `This ${subject} refers to something that no longer exists. Reload the page and try again.`;

    case '23502': {
      const column = message?.match(/column "([\w.]+)"/i)?.[1];
      return column
        ? `"${column}" is required and was left empty.`
        : `A required field was left empty.`;
    }

    // Bad enum value — e.g. the old `category: 'community'`, which is not a
    // member of event_category and killed every uncategorised submission.
    case '22P02': {
      const enumName = message?.match(/enum (\w+)/i)?.[1];
      return enumName
        ? `One of the choices is not valid for this database (${enumName}). Pick a different option.`
        : 'One of the selected options is not a value this database accepts.';
    }

    case '57014':
      return 'The database took too long to respond. Please try again.';

    default:
      break;
  }

  // Supabase returns this when the anon key is wrong or the project is paused.
  if (message && /JWT|api key|Invalid authentication/i.test(message)) {
    return 'Could not authenticate with the database. Check the Supabase keys in your environment.';
  }
  if (message && /fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(message)) {
    return 'Could not reach the database. Check your connection and try again.';
  }

  // Unrecognised: keep the real message. A precise sentence nobody planned
  // for still beats an accurate-sounding one that says nothing.
  const raw = [message, details].filter(Boolean).join(' — ');
  return raw || `Could not save the ${subject}.`;
}

/**
 * A failure whose `message` has already been written for the person who will
 * read it. The action layer can therefore show it verbatim, instead of
 * guessing whether an arbitrary thrown value is safe to display — which is
 * what pushed it towards a blanket "Something went wrong" in the first place.
 */
export class SubmitEventError extends Error {
  override readonly cause: unknown;
  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'SubmitEventError';
    this.cause = cause;
  }
}

/**
 * Server-side breadcrumb. The user gets `describeDbError`; the log keeps the
 * code and details, so a report of "it says permission denied" can be traced
 * to the exact policy without asking for a screenshot.
 */
export function logDbError(scope: string, err: unknown): void {
  const { code, message, details, hint } = asDbError(err);
  console.error(`[${scope}] database error`, { code, message, details, hint });
}
