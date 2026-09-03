import { ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { getRepository } from '@/lib/repo';
import { useAsync } from '@/lib/useAsync';
import { SeasonBanner } from '@/components/SeasonBanner';
import { EventRail } from '@/components/EventRail';
import { EmptyState } from '@/components/EmptyState';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const state = useAsync(async () => {
    const repo = getRepository();
    const [weekend, featured, near] = await Promise.all([
      repo.thisWeekend(10),
      repo.featured(10),
      repo.nearYou(undefined, 10),
    ]);
    return { weekend, featured, near };
  });

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}
    >
      <View className="flex-row items-center gap-2 px-4 py-3">
        <View className="h-6 w-6 rounded-md bg-accent" />
        <Text className="font-semibold text-fg" style={{ fontSize: 18 }}>
          DesiHub
        </Text>
      </View>

      <SeasonBanner />

      {state.loading && (
        <View className="items-center py-16">
          <ActivityIndicator color="#E8802A" />
        </View>
      )}

      {state.error && (
        <View className="px-4 py-10">
          <EmptyState title="Couldn't load events" description="Pull to refresh, or try again." />
        </View>
      )}

      {state.data && (
        <>
          <EventRail
            title="This weekend"
            events={state.data.weekend}
            emptyTitle="Nothing this weekend — yet"
            emptyDescription="New events are added all the time."
          />
          <EventRail title="Featured" events={state.data.featured} />
          <EventRail title="Near you" events={state.data.near} />

          <View className="mt-8 px-4">
            <Text className="mb-3 font-semibold text-fg" style={{ fontSize: 20 }}>
              Browse by category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EVENT_CATEGORIES.map((c) => (
                <Link key={c} href={`/search?category=${c}`} asChild>
                  <Pressable className="rounded-pill border border-border bg-surface px-4 py-2">
                    <Text className="font-medium text-fg" style={{ fontSize: 13 }}>
                      {EVENT_CATEGORY_LABELS[c]}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
