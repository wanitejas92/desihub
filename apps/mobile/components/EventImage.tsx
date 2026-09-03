import { View } from 'react-native';
import { Image } from 'expo-image';
import type { EventCategory } from '@desihub/shared';
import { FallbackCard } from './FallbackCard';

const BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

/** Real uploaded image (with blurhash) or the branded fallback card. */
export function EventImage({
  imageUrl,
  title,
  category,
  organiserName,
}: {
  imageUrl: string | null;
  title: string;
  category: EventCategory;
  organiserName?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        placeholder={{ blurhash: BLURHASH }}
        contentFit="cover"
        transition={200}
        style={{ width: '100%', height: '100%' }}
        accessibilityLabel={title}
      />
    );
  }
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <FallbackCard title={title} category={category} organiserName={organiserName} />
    </View>
  );
}
