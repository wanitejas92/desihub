# Homepage banners

Drop banner artwork here as `01.jpg`, `02.jpg`, `03.jpg` — the demo banner
list in `packages/shared/src/banners/mock-banner-repository.ts` points at
these paths. Any slide whose file is missing draws designed fallback art, so
a partial set never shows as broken images.

Recommended: **1600×540** (roughly 3:1) or wider, JPEG or PNG. The strip
crops to 16:9 on mobile, so keep the subject near the centre.

This directory is the *development* slot. In production the same carousel
reads the `banners` table and the public `banners` storage bucket, so
changing what the homepage leads with is an upload plus a row — never a
code change or a deploy.
