import { ImageResponse } from 'next/og';
import {
  dateChip,
  formatEventDate,
  EVENT_CATEGORY_LABELS,
  type EventCategory,
} from '@desihub/shared';
import { getRepository } from '@/lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'DesiHub event';

const COLORS: Record<EventCategory, [string, string]> = {
  concert: ['#3B2A5A', '#6D4AA8'],
  party: ['#7A1F4B', '#C13C7A'],
  garba_dandiya: ['#8A3B12', '#E8802A'],
  diwali: ['#7A4A0F', '#E0A82E'],
  holi: ['#124B63', '#2FA3C9'],
  temple: ['#5A3210', '#B5762E'],
  cultural: ['#123B2E', '#2E8F6B'],
  comedy: ['#5A4A12', '#C9A83C'],
  food: ['#6B2412', '#D65A2E'],
  family: ['#123A5A', '#2E7FB5'],
  workshop: ['#2E2A5A', '#5A54B5'],
  networking: ['#2A2A2A', '#5A5A5A'],
};

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepository();
  const event = await repo.getEventBySlug(slug);

  const title = event?.title ?? 'DesiHub';
  const category = event?.category ?? 'party';
  const [c1, c2] = COLORS[category];
  const chip = event ? dateChip(event.starts_at) : null;
  const city = event?.venue?.city ?? 'Netherlands';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff' }} />
        <div style={{ fontSize: 30, fontWeight: 700 }}>DesiHub</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {chip && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#fff',
                color: c1,
                borderRadius: 14,
                padding: '10px 18px',
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{chip.day}</div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>{chip.month}</div>
            </div>
            <div style={{ fontSize: 26, opacity: 0.95 }}>
              {EVENT_CATEGORY_LABELS[category]} · {city}
            </div>
          </div>
        )}
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>
          {title.length > 80 ? `${title.slice(0, 80)}…` : title}
        </div>
        {event && (
          <div style={{ fontSize: 28, opacity: 0.92, marginTop: 20 }}>
            {formatEventDate(event.starts_at)}
          </div>
        )}
      </div>
    </div>,
    size,
  );
}
