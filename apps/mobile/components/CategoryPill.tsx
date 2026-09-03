import { View, Text } from 'react-native';
import { EVENT_CATEGORY_LABELS, type EventCategory } from '@desihub/shared';

export function CategoryPill({ category }: { category: EventCategory }) {
  return (
    <View className="bg-bg/85 self-start rounded-pill px-2.5 py-1">
      <Text className="font-semibold text-fg" style={{ fontSize: 11 }}>
        {EVENT_CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}
