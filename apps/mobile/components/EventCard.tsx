import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { formatPriceRange, formatEventTime, type EventWithRelations } from '@desihub/shared';
import { EventImage } from './EventImage';
import { DateChip } from './DateChip';
import { CategoryPill } from './CategoryPill';
import { SaveButton } from './SaveButton';

/** Signature card: full-bleed image, floating date chip, category pill, save. */
export function EventCard({
  event,
  width,
  trending,
}: {
  event: EventWithRelations;
  width?: number;
  trending?: boolean;
}) {
  const price = formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );
  const soldOut = event.status === 'sold_out';

  return (
    <Link href={`/e/${event.slug}`} asChild>
      <Pressable
        className="overflow-hidden rounded-md bg-surface"
        style={width ? { width } : undefined}
        accessibilityRole="button"
        accessibilityLabel={event.title}
      >
        <View className="aspect-[4/5] bg-bg-sunken">
          <EventImage
            imageUrl={event.image_url}
            title={event.title}
            category={event.category}
            organiserName={event.organiser.name}
          />
          <View className="absolute left-2 top-2">
            <DateChip startsAt={event.starts_at} />
          </View>
          <View className="absolute right-2 top-2">
            <CategoryPill category={event.category} />
          </View>
          <View className="absolute bottom-2 right-2">
            <SaveButton eventId={event.id} />
          </View>
          {soldOut && (
            <View className="bg-fg/80 absolute inset-x-0 bottom-0 py-1">
              <Text className="text-center text-xs font-bold uppercase text-bg">Sold out</Text>
            </View>
          )}
        </View>

        <View className="gap-0.5 p-3">
          {trending && (
            <View className="mb-1 self-start rounded-pill bg-accent-subtle px-2 py-0.5">
              <Text className="font-bold uppercase text-accent" style={{ fontSize: 10 }}>
                🔥 Trending
              </Text>
            </View>
          )}
          <Text className="font-semibold text-fg" style={{ fontSize: 16 }} numberOfLines={2}>
            {event.title}
          </Text>
          <Text className="text-fg-muted" style={{ fontSize: 13 }}>
            {event.venue?.city ?? 'Netherlands'} · {formatEventTime(event.starts_at)}
          </Text>
          <Text className="mt-0.5 font-semibold text-fg" style={{ fontSize: 14 }}>
            {price}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
