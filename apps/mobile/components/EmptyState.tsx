import { View, Text } from 'react-native';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View className="items-center rounded-md border border-dashed border-border bg-bg-subtle px-6 py-12">
      <Text className="text-accent" style={{ fontSize: 28 }}>
        ✦
      </Text>
      <Text className="mt-2 text-center font-semibold text-fg" style={{ fontSize: 18 }}>
        {title}
      </Text>
      {description && (
        <Text className="mt-1 text-center text-fg-muted" style={{ fontSize: 14 }}>
          {description}
        </Text>
      )}
    </View>
  );
}
