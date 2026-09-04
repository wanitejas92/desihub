-- Category interests on the profile — the thing that actually makes
-- "notification preferences" mean something. Reuses the same
-- `event_category[]` shape `subscribers.interests` already has.
alter table profiles add column interests event_category[] not null default '{}';
