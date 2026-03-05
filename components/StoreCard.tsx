import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoreLocation, STORE_TYPE_COLORS, STORE_TYPE_LABELS } from '../data/storeData';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';

interface StoreCardProps {
  store: StoreLocation;
}

export function StoreCard({ store }: StoreCardProps) {
  const colors = useThemeColors();
  const typeColor = STORE_TYPE_COLORS[store.type];
  const s = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      ...Shadow.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    badge: {
      width: 46, height: 46, borderRadius: Radius.md,
      backgroundColor: typeColor + '20',
      alignItems: 'center', justifyContent: 'center',
    },
    badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: typeColor, textAlign: 'center' },
    info: { flex: 1 },
    name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: colors.dark, marginBottom: 2 },
    address: { fontSize: FontSize.sm, color: colors.midGray, marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    distancePill: {
      backgroundColor: colors.lightGray, borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm, paddingVertical: 2,
    },
    distanceText: { fontSize: FontSize.xs, color: colors.midGray },
    openBadge: {
      backgroundColor: store.isOpen ? '#E8F5EE' : '#FFF0F0',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm, paddingVertical: 2,
    },
    openText: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: store.isOpen ? '#00843D' : '#CC0000' },
    hours: { fontSize: FontSize.xs, color: colors.midGray },
  }), [colors, typeColor, store.isOpen]);

  const typeLabel = STORE_TYPE_LABELS[store.type];
  const initials = typeLabel === 'Bon Marché' ? 'BM' : typeLabel === 'OKmart' ? 'OKm' : 'OK';

  return (
    <View style={s.card}>
      <View style={s.badge}>
        <Text style={s.badgeText}>{initials}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{store.name}</Text>
        <Text style={s.address}>{store.suburb}, {store.city}</Text>
        <View style={s.row}>
          <View style={s.distancePill}>
            <Text style={s.distanceText}>📍 {store.distance} km</Text>
          </View>
          <View style={s.openBadge}>
            <Text style={s.openText}>{store.isOpen ? '● Open' : '● Closed'}</Text>
          </View>
          <Text style={s.hours}>{store.hours}</Text>
        </View>
      </View>
    </View>
  );
}
