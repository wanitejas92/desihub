import { Pressable, Text } from 'react-native';
import { useSavedEvents } from '@/lib/saved';

/** Heart toggle. First save triggers the push-permission prompt (see lib/saved). */
export function SaveButton({ eventId, size = 20 }: { eventId: string; size?: number }) {
  const { isSaved, toggle } = useSavedEvents();
  const saved = isSaved(eventId);
  return (
    <Pressable
      onPress={() => toggle(eventId)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save event'}
      className="bg-bg/85 h-11 w-11 items-center justify-center rounded-pill"
    >
      <Text style={{ fontSize: size }}>{saved ? '❤️' : '🤍'}</Text>
    </Pressable>
  );
}
