import { ScrollView, View, Text, Pressable, Linking, Share, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  formatEventDate,
  formatEventDateShort,
  formatEventTime,
  formatPriceRange,
  googleCalendarUrl,
  isSameLocalDay,
  EVENT_CATEGORY_LABELS,
} from '@desihub/shared';
import { getRepository } from '@/lib/repo';
import { useAsync } from '@/lib/useAsync';
import { EventImage } from '@/components/EventImage';
import { DateChip } from '@/components/DateChip';
import { CategoryPill } from '@/components/CategoryPill';
import { SaveButton } from '@/components/SaveButton';
import { EventRail } from '@/components/EventRail';
import { EmptyState } from '@/components/EmptyState';

export default function EventDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const state = useAsync(async () => {
    const repo = getRepository();
    const event = await repo.getEventBySlug(String(slug));
    if (!event) return { event: null, similar: [] };
    const similar = await repo.similar(event, 8);
    return { event, similar };
  }, [slug]);

  if (state.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#D6284F" />
      </View>
    );
  }

  const event = state.data?.event;
  if (!event) {
    return (
      <View className="flex-1 justify-center bg-bg px-4" style={{ paddingTop: insets.top }}>
        <EmptyState title="Event not found" description="It may have moved or been removed." />
        <Pressable onPress={() => router.back()} className="mt-4 items-center">
          <Text className="font-semibold text-accent">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const price = formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );

  const openTickets = () => {
    if (event.external_ticket_url) Linking.openURL(event.external_ticket_url);
  };
  const openDirections = () => {
    if (!event.venue) return;
    const q = encodeURIComponent(
      `${event.venue.name}, ${event.venue.address ?? ''}, ${event.venue.city}`,
    );
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };
  const addToCalendar = () =>
    Linking.openURL(
      googleCalendarUrl({
        title: event.title,
        description: event.description ?? undefined,
        location: event.venue ? `${event.venue.name}, ${event.venue.city}` : undefined,
        startsAt: event.starts_at,
        endsAt: event.ends_at,
      }),
    );
  const share = () =>
    Share.share({ message: `${event.title} — https://desihub.nl/e/${event.slug}` });

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="aspect-[16/11] bg-bg-sunken" style={{ marginTop: insets.top }}>
          <EventImage
            imageUrl={event.image_url}
            title={event.title}
            category={event.category}
            organiserName={event.organiser.name}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="bg-bg/85 absolute left-3 top-3 h-11 w-11 items-center justify-center rounded-pill"
          >
            <Text style={{ fontSize: 20 }}>‹</Text>
          </Pressable>
          <View className="absolute right-3 top-3">
            <CategoryPill category={event.category} />
          </View>
          <View className="absolute bottom-3 left-3">
            <DateChip startsAt={event.starts_at} />
          </View>
          <View className="absolute bottom-3 right-3">
            <SaveButton eventId={event.id} />
          </View>
        </View>

        <View className="px-4 pt-5">
          <Text className="font-semibold text-fg" style={{ fontSize: 26, lineHeight: 30 }}>
            {event.title}
          </Text>
          <Text className="mt-2 text-fg-muted" style={{ fontSize: 15 }}>
            {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
            {event.ends_at &&
              (isSameLocalDay(event.starts_at, event.ends_at)
                ? `–${formatEventTime(event.ends_at)}`
                : ` – ${formatEventDateShort(event.ends_at)}, ${formatEventTime(event.ends_at)}`)}
          </Text>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={addToCalendar}
              className="rounded-pill border border-border px-4 py-2.5"
            >
              <Text className="font-semibold text-fg" style={{ fontSize: 13 }}>
                ＋ Calendar
              </Text>
            </Pressable>
            <Pressable onPress={share} className="rounded-pill border border-border px-4 py-2.5">
              <Text className="font-semibold text-fg" style={{ fontSize: 13 }}>
                ↗ Share
              </Text>
            </Pressable>
          </View>

          {/* Price + CTA */}
          <View className="mt-5 rounded-md border border-border bg-surface p-4">
            <Text className="text-fg-muted" style={{ fontSize: 13 }}>
              Price
            </Text>
            <Text className="font-semibold text-fg" style={{ fontSize: 22 }}>
              {price}
            </Text>
            <Cta
              status={event.status}
              isFree={event.is_free}
              hasUrl={Boolean(event.external_ticket_url)}
              onPress={openTickets}
            />
          </View>

          {event.description && (
            <View className="mt-6">
              <Text className="font-semibold text-fg" style={{ fontSize: 18 }}>
                About this event
              </Text>
              <Text className="mt-2 text-fg" style={{ fontSize: 15, lineHeight: 22 }}>
                {event.description}
              </Text>
            </View>
          )}

          {event.venue && (
            <View className="mt-6 rounded-md border border-border bg-surface p-4">
              <Text className="text-fg-subtle" style={{ fontSize: 12 }}>
                VENUE
              </Text>
              <Text className="mt-1 font-semibold text-fg" style={{ fontSize: 16 }}>
                {event.venue.name}
              </Text>
              {event.venue.address && (
                <Text className="text-fg-muted" style={{ fontSize: 14 }}>
                  {event.venue.address}
                </Text>
              )}
              <Text className="text-fg-muted" style={{ fontSize: 14 }}>
                {event.venue.city}
              </Text>
              <Pressable onPress={openDirections} className="mt-2">
                <Text className="font-semibold text-accent" style={{ fontSize: 14 }}>
                  Get directions →
                </Text>
              </Pressable>
            </View>
          )}

          <View className="mt-6 rounded-md border border-border bg-surface p-4">
            <Text className="text-fg-subtle" style={{ fontSize: 12 }}>
              ORGANISED BY
            </Text>
            <Text className="mt-1 font-semibold text-fg" style={{ fontSize: 16 }}>
              {event.organiser.name}
              {event.organiser.verified ? ' ✓' : ''}
            </Text>
            <Text className="text-fg-muted" style={{ fontSize: 14 }}>
              {EVENT_CATEGORY_LABELS[event.category]}
            </Text>
          </View>
        </View>

        {(state.data?.similar.length ?? 0) > 0 && (
          <EventRail title="Similar events" events={state.data!.similar} />
        )}
      </ScrollView>

      {/* Sticky price + CTA bar, mirroring the inline card above for quick access while scrolled. */}
      <View
        className="absolute inset-x-0 bottom-0 flex-row items-center justify-between gap-4 border-t border-border bg-bg px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View>
          <Text className="text-fg-subtle" style={{ fontSize: 11 }}>
            Price
          </Text>
          <Text className="font-semibold text-fg" style={{ fontSize: 18 }}>
            {price}
          </Text>
        </View>
        <View className="shrink-0">
          <Cta
            status={event.status}
            isFree={event.is_free}
            hasUrl={Boolean(event.external_ticket_url)}
            onPress={openTickets}
            compact
          />
        </View>
      </View>
    </View>
  );
}

function Cta({
  status,
  isFree,
  hasUrl,
  onPress,
  compact,
}: {
  status: string;
  isFree: boolean;
  hasUrl: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const box = compact ? 'rounded-md px-5 py-2.5' : 'mt-3 rounded-md py-3';
  if (status === 'sold_out') {
    return (
      <View className={`bg-bg-sunken ${box}`}>
        <Text className="text-center font-semibold text-fg-muted">Sold out</Text>
      </View>
    );
  }
  if (status === 'cancelled') {
    return (
      <View className={`bg-error-bg ${box}`}>
        <Text className="text-center font-semibold text-error">Cancelled</Text>
      </View>
    );
  }
  if (isFree) {
    return (
      <View className={`bg-success-bg ${box}`}>
        <Text className="text-center font-semibold text-success">
          {compact ? 'Free entry' : 'Free entry — no ticket needed'}
        </Text>
      </View>
    );
  }
  if (hasUrl) {
    return (
      <Pressable onPress={onPress} className={`bg-accent ${box}`}>
        <Text className="text-center font-semibold text-accent-fg">Get tickets</Text>
      </Pressable>
    );
  }
  return (
    <View className={`bg-bg-subtle ${box}`}>
      <Text className="text-center text-fg-muted">
        {compact ? 'Coming soon' : 'Tickets coming soon'}
      </Text>
    </View>
  );
}
