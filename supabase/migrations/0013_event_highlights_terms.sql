-- Organiser-authored highlights and terms & conditions.
--
-- Previously "highlights" on the event page was derived from the category
-- (three canned phrases per category) — never anything the organiser
-- actually wrote. Both new columns are free text the submitter fills in
-- themselves; nullable here because existing rows have nothing to backfill,
-- with "required going forward" enforced at the submission form/schema
-- layer rather than the database.

alter table events add column highlights text;
alter table events add column terms text;
