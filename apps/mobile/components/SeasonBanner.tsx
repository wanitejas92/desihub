import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { currentSeason, nextSeason, type Season } from '@desihub/shared';

const MOOD: Record<Season['mood'], [string, string]> = {
  colour: ['#E8802A', '#C13C7A'],
  lights: ['#E0A82E', '#C96A1E'],
  devotional: ['#B5762E', '#7A4A0F'],
  calm: ['#3B3BE8', '#2E7FB5'],
};

/** The festival Season banner — live festival, or off-season countdown. */
export function SeasonBanner() {
  const now = new Date();
  const season = currentSeason(now);
  const isOff = season.key === 'offseason';
  const upcoming = isOff ? nextSeason(now) : null;
  const colors = MOOD[isOff ? 'calm' : season.mood];

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View className="px-4 py-8">
        <Text
          className="font-semibold uppercase text-white/90"
          style={{ fontSize: 12, letterSpacing: 2 }}
        >
          {isOff ? 'Coming up' : `It's ${season.name} season`}
        </Text>
        <Text className="mt-2 font-semibold text-white" style={{ fontSize: 26, lineHeight: 30 }}>
          {isOff && upcoming
            ? `${upcoming.season.name} is ${upcoming.daysUntil} days away`
            : season.tagline}
        </Text>
        <Text className="mt-1 text-white/90" style={{ fontSize: 15 }}>
          {isOff && upcoming ? upcoming.season.tagline : `Find every ${season.name} event in NL.`}
        </Text>
      </View>
    </LinearGradient>
  );
}
