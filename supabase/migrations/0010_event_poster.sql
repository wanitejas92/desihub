-- Portrait poster artwork, separate from the wide `image_url` used by cards
-- and the hero banner. Optional: the event page falls back to `image_url`
-- (cropped) when no poster has been uploaded, so existing events keep
-- working without a migration of their data.
alter table events add column poster_image_url text;
