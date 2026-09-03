import { View, Text, FlatList } from 'react-native';
import type { EventWithRelations } from '@desihub/shared';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';

/** Horizontal rail of event cards used across the Discover screen. */
export function EventRail({
  title,
  events,
  emptyTitle,
  emptyDescription,
  trending,
}: {
  title: string;
  events: EventWithRelations[];
  emptyTitle?: string;
  emptyDescription?: string;
  trending?: boolean;
}) {
  return (
    <View className="mt-6">
      <Text className="mb-3 px-4 font-semibold text-fg" style={{ fontSize: 20 }}>
        {title}
      </Text>
      {events.length === 0 ? (
        <View className="px-4">
          <EmptyState title={emptyTitle ?? 'Nothing here yet'} description={emptyDescription} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={events}
          keyExtractor={(e) => e.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => <EventCard event={item} width={220} trending={trending} />}
        />
      )}
    </View>
  );
}
