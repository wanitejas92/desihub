import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  CITIES,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  type City,
  type EventCategory,
} from '@desihub/shared';
import { getRepository } from '@/lib/repo';
import { useAsync } from '@/lib/useAsync';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<EventCategory | undefined>(
    (params.category as EventCategory) || undefined,
  );
  const [city, setCity] = useState<City | undefined>(undefined);
  const [freeOnly, setFreeOnly] = useState(false);

  const state = useAsync(async () => {
    const repo = getRepository();
    return repo.listEvents({
      search: q || undefined,
      category,
      city,
      price: freeOnly ? 'free' : undefined,
    });
  }, [q, category, city, freeOnly]);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-3">
        <Text className="font-semibold text-fg" style={{ fontSize: 24 }}>
          Search
        </Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search events, organisers, tags…"
          placeholderTextColor="#938E88"
          className="mt-3 rounded-md border border-border bg-surface px-4 py-3 text-fg"
          accessibilityLabel="Search events"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 max-h-12 grow-0"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <Chip label="Free" active={freeOnly} onPress={() => setFreeOnly((v) => !v)} />
        {EVENT_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={EVENT_CATEGORY_LABELS[c]}
            active={category === c}
            onPress={() => setCategory(category === c ? undefined : c)}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2 max-h-12 grow-0"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CITIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={city === c}
            onPress={() => setCity(city === c ? undefined : c)}
          />
        ))}
      </ScrollView>

      {state.loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color="#E8802A" />
        </View>
      ) : (
        <FlatList
          data={state.data?.items ?? []}
          keyExtractor={(e) => e.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <EventCard event={item} />
            </View>
          )}
          ListHeaderComponent={
            <Text className="px-4 pb-1 text-fg-muted" style={{ fontSize: 13 }}>
              {state.data?.total ?? 0} {state.data?.total === 1 ? 'event' : 'events'}
            </Text>
          }
          ListEmptyComponent={
            <View className="px-4 pt-8">
              <EmptyState
                title="No events match"
                description="Try removing a filter or searching something else."
              />
            </View>
          }
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={
        active
          ? 'h-10 justify-center rounded-pill border border-accent bg-accent-subtle px-4'
          : 'h-10 justify-center rounded-pill border border-border bg-surface px-4'
      }
    >
      <Text className="font-medium text-fg" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
