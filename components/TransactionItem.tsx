import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { Transaction } from '../data/mockData';
import { useThemeColors } from '../hooks/useThemeColors';

interface TransactionItemProps {
  transaction: Transaction;
  showDivider?: boolean;
}

const lightCategoryColors: Record<Transaction['category'], { bg: string; text: string }> = {
  Groceries: { bg: '#E8F5EE', text: '#00843D' },
  Pharmacy: { bg: '#E6F0FF', text: '#0066CC' },
  Household: { bg: '#FFF3EB', text: '#FF6B00' },
  Bakery: { bg: '#FFF8E1', text: '#F57C00' },
  Beverages: { bg: '#F3E5F5', text: '#7B1FA2' },
};

const darkCategoryColors: Record<Transaction['category'], { bg: string; text: string }> = {
  Groceries: { bg: '#0A2918', text: '#30D158' },
  Pharmacy: { bg: '#001A38', text: '#0A84FF' },
  Household: { bg: '#2E1A00', text: '#FF9F0A' },
  Bakery: { bg: '#2E2000', text: '#FFD60A' },
  Beverages: { bg: '#2A0E38', text: '#BF5AF2' },
};

const categoryEmoji: Record<Transaction['category'], string> = {
  Groceries: '🛒', Pharmacy: '💊', Household: '🏠', Bakery: '🍞', Beverages: '🥤',
};

export function TransactionItem({ transaction, showDivider = true }: TransactionItemProps) {
  const colors = useThemeColors();
  const isDark = colors.dark !== '#1A1A1A';
  const catColors = isDark ? darkCategoryColors : lightCategoryColors;
  const { bg, text } = catColors[transaction.category];
  const emoji = categoryEmoji[transaction.category];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-ZW', {
    day: 'numeric', month: 'short',
  });

  return (
    <>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.storeName} numberOfLines={1}>{transaction.storeName}</Text>
          <Text style={styles.category}>{transaction.category} · {formattedDate} {transaction.time}</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={[styles.amount, { color: colors.primary }]}>-${transaction.amount.toFixed(2)}</Text>
          <Text style={styles.ref} numberOfLines={1}>{transaction.reference.slice(-8)}</Text>
        </View>
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm + 2 },
    iconCircle: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
    emoji: { fontSize: 20 },
    details: { flex: 1, marginRight: Spacing.sm },
    storeName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: colors.dark },
    category: { fontSize: FontSize.xs, color: colors.midGray, marginTop: 2 },
    amountCol: { alignItems: 'flex-end' },
    amount: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    ref: { fontSize: FontSize.xs, color: colors.midGray, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.lightGray, marginLeft: 52 },
  });
}
