import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  const colors = useThemeColors();
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text
        style={[styles.label, { color: focused ? colors.primary : colors.midGray }, focused && { fontWeight: '600' as const }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="pay" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💳" label="Pay" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="History" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="stores" options={{ href: null }} />
      <Tabs.Screen name="shopping-list" options={{ href: null }} />
      <Tabs.Screen name="credit-request" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', paddingTop: 4, width: 60 },
  emoji: { fontSize: 22, opacity: 0.45 },
  emojiFocused: { opacity: 1 },
  label: { fontSize: FontSize.xs, marginTop: 2, textAlign: 'center' },
});
