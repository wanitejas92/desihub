import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useColorScheme } from 'nativewind';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? '#E27FB8' : '#C1348A',
        tabBarInactiveTintColor: dark ? '#BCB6AE' : '#6B6762',
        tabBarStyle: {
          backgroundColor: dark ? '#0F0F0F' : '#FAF7F2',
          borderTopColor: dark ? '#2E2C2A' : '#DAD3C9',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="☺" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
