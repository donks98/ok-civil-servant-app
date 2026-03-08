import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { api } from '../../services/api';

type BrandFilter = 'All' | 'OK' | 'BON_MARCHE' | 'OKMART';

interface Store {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: string;
  distanceKm?: number;
}

const FILTERS: { label: string; value: BrandFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'OK Stores', value: 'OK' },
  { label: 'Bon Marché', value: 'BON_MARCHE' },
  { label: 'OKmart', value: 'OKMART' },
];

const BRAND_COLORS: Record<string, string> = {
  OK: '#CC0000',
  BON_MARCHE: '#0066CC',
  OKMART: '#FF6B00',
  OK_GRAND: '#9C27B0',
};

const BRAND_LABELS: Record<string, string> = {
  OK: 'OK',
  BON_MARCHE: 'BM',
  OKMART: 'OM',
  OK_GRAND: 'OG',
};

function isOpenNow(openingHours: string): boolean {
  try {
    const [open, close] = openingHours.split('-').map((t) => {
      const [h, m] = t.trim().split(':').map(Number);
      return h * 60 + (m ?? 0);
    });
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= open && mins < close;
  } catch {
    return true;
  }
}

export default function StoresScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BrandFilter>('All');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchStores = useCallback(async (lat?: number, lng?: number, brand?: string) => {
    try {
      if (lat !== undefined && lng !== undefined) {
        const brand_param = brand && brand !== 'All' ? brand : undefined;
        const data = await api.stores.nearby(lat, lng, 20);
        setStores(brand_param ? data.filter((s: Store) => s.brand === brand_param) : data);
      } else {
        const brand_param = brand && brand !== 'All' ? brand : undefined;
        const data = await api.stores.list(brand_param);
        setStores(data);
      }
    } catch {
      setStores([]);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationDenied(true);
      return null;
    }
    setLocationDenied(false);
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const loc = await requestLocation();
    if (loc) setUserLocation(loc);

    await fetchStores(loc?.lat, loc?.lng, activeFilter);

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }, [requestLocation, fetchStores, activeFilter]);

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = useCallback(async (filter: BrandFilter) => {
    setActiveFilter(filter);
    setLoading(true);
    await fetchStores(userLocation?.lat, userLocation?.lng, filter);
    setLoading(false);
  }, [userLocation, fetchStores]);

  const handleLocate = useCallback(() => loadData(), [loadData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Find a Store</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Searching...' : `${stores.length} location${stores.length !== 1 ? 's' : ''} found`}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLocate} style={styles.locateBtn} activeOpacity={0.7}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* GPS banner */}
      {userLocation && !locationDenied && (
        <View style={styles.gpsBanner}>
          <Ionicons name="location" size={13} color={colors.success} />
          <Text style={styles.gpsBannerText}>Sorted by distance from your location</Text>
        </View>
      )}
      {locationDenied && (
        <View style={[styles.gpsBanner, styles.gpsBannerWarn]}>
          <Ionicons name="warning-outline" size={13} color={colors.warning} />
          <Text style={[styles.gpsBannerText, { color: colors.warning }]}>Location off — showing all stores</Text>
        </View>
      )}

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => handleFilterChange(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding stores near you...</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: store }) => {
            const brandColor = BRAND_COLORS[store.brand] ?? '#CC0000';
            const brandLabel = BRAND_LABELS[store.brand] ?? store.brand.slice(0, 2);
            const open = isOpenNow(store.openingHours);
            return (
              <View style={styles.storeCard}>
                <View style={styles.storeCardLeft}>
                  <View style={[styles.typeBadge, { backgroundColor: brandColor }]}>
                    <Text style={styles.typeBadgeText}>{brandLabel}</Text>
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeAddress}>{store.address}</Text>
                    <View style={styles.storeMetaRow}>
                      <View style={[styles.openBadge, { backgroundColor: open ? '#E6F5EC' : '#F5E6E6' }]}>
                        <Text style={[styles.openText, { color: open ? colors.success : colors.primary }]}>
                          {open ? '● Open' : '● Closed'}
                        </Text>
                      </View>
                      <Text style={styles.storeHours}>{store.openingHours}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.storeCardRight}>
                  {store.distanceKm !== undefined ? (
                    <>
                      <Text style={styles.distanceVal}>{store.distanceKm.toFixed(1)}</Text>
                      <Text style={styles.distanceLbl}>km away</Text>
                    </>
                  ) : (
                    <Text style={styles.distanceLbl}>{store.city}</Text>
                  )}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={colors.lightGray} />
              <Text style={styles.emptyText}>No stores found</Text>
              <Text style={styles.emptySubText}>Try a different filter or expand your search area</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListFooterComponent={<View style={{ height: Spacing.xl }} />}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    header: {
      paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm,
      paddingBottom: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    },
    locateBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: FontWeight.extraBold },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 2 },
    gpsBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
      backgroundColor: '#E6F5EC',
    },
    gpsBannerWarn: { backgroundColor: '#FFF3E6' },
    gpsBannerText: { fontSize: FontSize.xs, color: c.success },
    filterRow: {
      flexDirection: 'row', paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md, gap: Spacing.sm,
    },
    filterChip: {
      flex: 1, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full,
      backgroundColor: c.cardBg, alignItems: 'center', ...Shadow.sm,
    },
    filterChipActive: { backgroundColor: c.primary },
    filterText: { fontSize: FontSize.xs, color: c.midGray, fontWeight: FontWeight.medium },
    filterTextActive: { color: '#FFFFFF', fontWeight: FontWeight.bold },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    loadingText: { fontSize: FontSize.sm, color: c.midGray },
    listContent: { paddingHorizontal: Spacing.md },
    storeCard: {
      backgroundColor: c.cardBg, borderRadius: Radius.lg, padding: Spacing.md,
      flexDirection: 'row', alignItems: 'center', ...Shadow.sm,
    },
    storeCardLeft: { flex: 1, flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
    typeBadge: {
      width: 44, height: 44, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
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
    callBtn: {
      width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
      borderColor: c.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs,
    },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: Spacing.md },
    emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.midGray },
    emptySubText: { fontSize: FontSize.sm, color: c.midGray, textAlign: 'center', paddingHorizontal: Spacing.xl },
  });
}
