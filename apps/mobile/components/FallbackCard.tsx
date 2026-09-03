import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EVENT_CATEGORY_LABELS, type EventCategory } from '@desihub/shared';
import { CATEGORY_COLORS } from '@/lib/category-colors';

/**
 * Native branded fallback card for events with no image — a broken/empty image
 * never renders. Mirrors the web SVG generator's look. We never scrape artwork.
 */
export function FallbackCard({
  title,
  category,
  organiserName,
}: {
  title: string;
  category: EventCategory;
  organiserName?: string;
}) {
  const [c1, c2] = CATEGORY_COLORS[category];
  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-end p-3">
        <Text className="font-semibold text-white" style={{ fontSize: 18 }} numberOfLines={3}>
          {title}
        </Text>
        <Text className="mt-1 text-white/90" style={{ fontSize: 12 }} numberOfLines={1}>
          {EVENT_CATEGORY_LABELS[category]}
          {organiserName ? ` · ${organiserName}` : ''}
        </Text>
      </View>
    </LinearGradient>
  );
}
