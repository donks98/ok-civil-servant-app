import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, useWindowDimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { BarChart } from '../../components/charts/BarChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CATEGORY_COLORS } from '../../data/mockData';

const MONTHS = [
  { key: '2026-01', label: 'Jan' },
  { key: '2026-02', label: 'Feb' },
  { key: '2026-03', label: 'Mar' },
];

const CATEGORIES = ['Groceries', 'Pharmacy', 'Household', 'Bakery', 'Beverages'] as const;

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const transactions = useAppStore((s) => s.transactions);
  const wallet = useAppStore((s) => s.wallet);
  const { width } = useWindowDimensions();
  const chartWidth = width - Spacing.md * 4;

  const monthlyTotals = MONTHS.map((m) => ({
    label: m.label,
    value: transactions.filter((t) => t.date.startsWith(m.key)).reduce((s, t) => s + t.amount, 0),
    color: '#CC0000',
  }));

  const marchTxns = transactions.filter((t) => t.date.startsWith('2026-03'));
  const categoryTotals = CATEGORIES.map((cat) => ({
    label: cat,
    value: marchTxns.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0),
    color: CATEGORY_COLORS[cat],
  })).filter((c) => c.value > 0);

  const totalMarch = marchTxns.reduce((s, t) => s + t.amount, 0);
  const totalFeb = transactions.filter((t) => t.date.startsWith('2026-02')).reduce((s, t) => s + t.amount, 0);
  const avgDaily = totalMarch / new Date().getDate();
  const daysInMonth = 31;
  const projectedMonthly = avgDaily * daysInMonth;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Spending Analytics</Text>
          <Text style={styles.headerSub}>March 2026 overview</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>${totalMarch.toFixed(2)}</Text>
            <Text style={styles.summaryLbl}>This Month</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: totalMarch > totalFeb ? colors.primary : colors.success }]}>
              {totalFeb > 0 ? `${((totalMarch - totalFeb) / totalFeb * 100).toFixed(0)}%` : '—'}
            </Text>
            <Text style={styles.summaryLbl}>vs Last Month</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>${avgDaily.toFixed(2)}</Text>
            <Text style={styles.summaryLbl}>Daily Avg</Text>
          </View>
        </View>

        {/* Monthly trend bar chart */}
        <Text style={styles.sectionTitle}>Monthly Trend</Text>
        <Card style={styles.card}>
          <BarChart
            data={monthlyTotals}
            width={chartWidth}
            height={170}
            barColor={colors.primary}
            labelColor={colors.midGray}
            valueColor={colors.dark}
          />
        </Card>

        {/* Spending by category donut */}
        <Text style={styles.sectionTitle}>By Category · March</Text>
        <Card style={styles.card}>
          <View style={styles.donutRow}>
            <DonutChart
              segments={categoryTotals}
              size={140}
              strokeWidth={24}
              centerLabel={`$${totalMarch.toFixed(0)}`}
              centerSub="total"
              centerColor={colors.dark}
              centerSubColor={colors.midGray}
            />
            <View style={styles.legend}>
              {categoryTotals.map((c) => (
                <View key={c.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                  <Text style={styles.legendLabel}>{c.label}</Text>
                  <Text style={styles.legendVal}>${c.value.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Credit usage */}
        <Text style={styles.sectionTitle}>Credit Usage</Text>
        <Card style={styles.card}>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Used this month</Text>
            <Text style={styles.creditVal}>${totalMarch.toFixed(2)} / ${wallet.creditLimit.toFixed(0)}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min((totalMarch / wallet.creditLimit) * 100, 100)}%` as any }]} />
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Projected month-end</Text>
            <Text style={[styles.creditVal, projectedMonthly > wallet.creditLimit && { color: colors.primary }]}>
              ${projectedMonthly.toFixed(2)}
            </Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Remaining budget</Text>
            <Text style={[styles.creditVal, { color: colors.success }]}>${(wallet.creditLimit - totalMarch).toFixed(2)}</Text>
          </View>
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
    summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
    summaryCard: { flex: 1, backgroundColor: c.cardBg, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', ...Shadow.sm },
    summaryVal: { fontSize: FontSize.lg, fontWeight: FontWeight.extraBold, color: c.dark },
    summaryLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.dark, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    card: { marginHorizontal: Spacing.md },
    donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    legend: { flex: 1, gap: Spacing.sm },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { flex: 1, color: c.midGray, fontSize: FontSize.sm },
    legendVal: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    creditRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    creditLabel: { color: c.midGray, fontSize: FontSize.sm },
    creditVal: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    progressBg: { height: 8, backgroundColor: c.lightGray, borderRadius: Radius.full, marginBottom: Spacing.md, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: Radius.full },
  });
}
