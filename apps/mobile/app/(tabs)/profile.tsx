import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSavedEvents } from '@/lib/saved';

const THEME_KEY = 'desihub-theme';
type ThemeChoice = 'light' | 'dark' | 'system';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { ids } = useSavedEvents();

  function choose(choice: ThemeChoice) {
    setColorScheme(choice);
    AsyncStorage.setItem(THEME_KEY, choice === 'system' ? '' : choice).catch(() => {});
  }

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

      <View className="mt-6 rounded-md border border-border bg-surface p-4">
        <Text className="font-semibold text-fg" style={{ fontSize: 16 }}>
          {ids.length} saved {ids.length === 1 ? 'event' : 'events'}
        </Text>
        <Text className="mt-1 text-fg-muted" style={{ fontSize: 14 }}>
          Sign in to sync your saved events and tickets across devices — coming soon.
        </Text>
      </View>

      <Text className="mb-2 mt-8 font-semibold text-fg" style={{ fontSize: 16 }}>
        Appearance
      </Text>
      <View className="flex-row gap-2">
        {(['light', 'dark', 'system'] as ThemeChoice[]).map((choice) => {
          const active = choice === 'system' ? colorScheme === undefined : colorScheme === choice;
          return (
            <Pressable
              key={choice}
              onPress={() => choose(choice)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={
                active
                  ? 'flex-1 items-center rounded-md border border-accent bg-accent-subtle py-3'
                  : 'flex-1 items-center rounded-md border border-border bg-surface py-3'
              }
            >
              <Text className="font-medium capitalize text-fg" style={{ fontSize: 14 }}>
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-8 text-center text-fg-subtle" style={{ fontSize: 12 }}>
        DesiHub — every Desi event in the Netherlands.
      </Text>
    </ScrollView>
  );
}
