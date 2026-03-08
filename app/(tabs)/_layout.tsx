import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useI18n } from '../../hooks/useI18n';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  icon, iconFocused, label, focused,
}: {
  icon: IoniconsName;
  iconFocused: IoniconsName;
  label: string;
  focused: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && { backgroundColor: colors.primary + '18' }]}>
        <Ionicons
          name={focused ? iconFocused : icon}
          size={22}
          color={focused ? colors.primary : colors.midGray}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: focused ? colors.primary : colors.midGray },
          focused && styles.labelFocused,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
    </View>
  );
}

export default function TabsLayout() {
  const colors = useThemeColors();
  const t = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 72,
          paddingBottom: 10,
          paddingTop: 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home-outline" iconFocused="home" label={t.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="qr-code-outline" iconFocused="qr-code" label={t.pay} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="receipt-outline" iconFocused="receipt" label={t.history} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="person-outline" iconFocused="person" label={t.profile} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="stores" options={{ href: null }} />
      <Tabs.Screen name="shopping-list" options={{ href: null }} />
      <Tabs.Screen name="credit-request" options={{ href: null }} />
      <Tabs.Screen name="direct-debit" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', paddingTop: 2, width: 64 },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  label: { fontSize: FontSize.xs, textAlign: 'center', fontWeight: FontWeight.medium },
  labelFocused: { fontWeight: FontWeight.bold },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
