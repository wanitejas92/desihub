import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isPast, type EventWithRelations } from '@desihub/shared';
import { getRepository } from '@/lib/repo';
import { useAsync } from '@/lib/useAsync';
import { useSavedEvents } from '@/lib/saved';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { ids, ready } = useSavedEvents();
  const state = useAsync(async () => {
    const repo = getRepository();
    const { items } = await repo.listEvents({ includePast: true, limit: 500 });
    return items.filter((e) => ids.includes(e.id));
  }, [ids.join(',')]);

  const saved = state.data ?? [];
  const upcoming = saved.filter((e) => !isPast(e.ends_at ?? e.starts_at));
  const past = saved.filter((e) => isPast(e.ends_at ?? e.starts_at));

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <Text className="px-4 pt-3 font-semibold text-fg" style={{ fontSize: 24 }}>
        Saved
      </Text>

      {!ready || state.loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color="#D6284F" />
        </View>
      ) : saved.length === 0 ? (
        <View className="px-4 pt-8">
          <EmptyState
            title="No saved events yet"
            description="Tap the heart on any event to save it here — and we'll remind you before it happens."
          />
        </View>
      ) : (
        <FlatList
          data={[...upcoming, ...past] as EventWithRelations[]}
          keyExtractor={(e) => e.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <EventCard event={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
