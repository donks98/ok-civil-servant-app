import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { MOCK_STORES, STORE_TYPE_COLORS, STORE_TYPE_LABELS, StoreType } from '../../data/storeData';

const FILTERS: { label: string; value: StoreType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'OK Stores', value: 'OK' },
  { label: 'Bon Marché', value: 'BonMarche' },
  { label: 'OKmart', value: 'OKmart' },
];

export default function StoresScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState<StoreType | 'All'>('All');

  const filtered = useMemo(() =>
    activeFilter === 'All' ? MOCK_STORES : MOCK_STORES.filter((s) => s.type === activeFilter),
    [activeFilter]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Find a Store</Text>
          <Text style={styles.headerSub}>{filtered.length} locations near you</Text>
        </View>
      </LinearGradient>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: store }) => {
          const typeColor = STORE_TYPE_COLORS[store.type];
          return (
            <View style={styles.storeCard}>
              <View style={styles.storeCardLeft}>
                <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                  <Text style={styles.typeBadgeText}>
                    {store.type === 'BonMarche' ? 'BM' : store.type}
                  </Text>
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeAddress}>{store.suburb} · {store.city}</Text>
                  <View style={styles.storeMetaRow}>
                    <View style={[styles.openBadge, { backgroundColor: store.isOpen ? '#E6F5EC' : '#F5E6E6' }]}>
                      <Text style={[styles.openText, { color: store.isOpen ? colors.success : colors.primary }]}>
                        {store.isOpen ? '● Open' : '● Closed'}
                      </Text>
                    </View>
                    <Text style={styles.storeHours}>{store.hours}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.storeCardRight}>
                <Text style={styles.distanceVal}>{store.distance}</Text>
                <Text style={styles.distanceLbl}>km away</Text>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${store.phone}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListFooterComponent={<View style={{ height: Spacing.xl }} />}
      />
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: FontWeight.extraBold },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 2 },
    filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
    filterChip: { flex: 1, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: c.cardBg, alignItems: 'center', ...Shadow.sm },
    filterChipActive: { backgroundColor: c.primary },
    filterText: { fontSize: FontSize.xs, color: c.midGray, fontWeight: FontWeight.medium },
    filterTextActive: { color: '#FFFFFF', fontWeight: FontWeight.bold },
    listContent: { paddingHorizontal: Spacing.md },
    storeCard: { backgroundColor: c.cardBg, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', ...Shadow.sm },
    storeCardLeft: { flex: 1, flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
    typeBadge: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    typeBadgeText: { color: '#FFFFFF', fontWeight: FontWeight.extraBold, fontSize: FontSize.xs },
    storeInfo: { flex: 1 },
    storeName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: c.dark, marginBottom: 2 },
    storeAddress: { fontSize: FontSize.xs, color: c.midGray, marginBottom: Spacing.xs },
    storeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    openBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
    openText: { fontSize: 10, fontWeight: FontWeight.semiBold },
    storeHours: { fontSize: 10, color: c.midGray },
    storeCardRight: { alignItems: 'center', gap: Spacing.xs },
    distanceVal: { fontSize: FontSize.lg, fontWeight: FontWeight.extraBold, color: c.dark },
    distanceLbl: { fontSize: 10, color: c.midGray },
    callBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: c.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs },
  });
}
