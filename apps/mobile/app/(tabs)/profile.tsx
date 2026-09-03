import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSavedEvents } from '@/lib/saved';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { ids } = useSavedEvents();

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 24,
        paddingHorizontal: 16,
      }}
    >
      <Text className="font-semibold text-fg" style={{ fontSize: 24 }}>
        Profile
      </Text>

      <View className="mt-6 rounded-lg border border-border bg-surface p-4">
        <Text className="font-semibold text-fg" style={{ fontSize: 16 }}>
          {ids.length} saved {ids.length === 1 ? 'event' : 'events'}
        </Text>
        <Text className="mt-1 text-fg-muted" style={{ fontSize: 14 }}>
          Sign in to sync your saved events and tickets across devices — coming soon.
        </Text>
      </View>

      <Text className="mt-8 text-center text-fg-subtle" style={{ fontSize: 12 }}>
        DesiHub — every Desi event in the Netherlands.
      </Text>
    </ScrollView>
  );
}
