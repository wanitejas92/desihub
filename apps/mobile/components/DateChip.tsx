import { View, Text } from 'react-native';
import { dateChip } from '@desihub/shared';

export function DateChip({ startsAt }: { startsAt: string }) {
  const chip = dateChip(startsAt);
  return (
    <View className="items-center rounded-md bg-bg px-2 py-1">
      <Text className="font-bold text-fg" style={{ fontSize: 16, lineHeight: 18 }}>
        {chip.day}
      </Text>
      <Text className="font-bold text-accent" style={{ fontSize: 10, letterSpacing: 1 }}>
        {chip.month}
      </Text>
    </View>
  );
}
