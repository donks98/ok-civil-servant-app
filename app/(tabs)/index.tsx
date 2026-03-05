import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { GradientCard } from '../../components/GradientCard';
import { TransactionItem } from '../../components/TransactionItem';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

const QUICK_ACTIONS = [
  { icon: '💳', label: 'Pay at Store', route: '/(tabs)/pay' as const },
  { icon: '📊', label: 'Analytics', route: '/(tabs)/analytics' as const },
  { icon: '🗺️', label: 'Find Store', route: '/(tabs)/stores' as const },
  { icon: '🛍️', label: 'Shopping List', route: '/(tabs)/shopping-list' as const },
];

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const transactions = useAppStore((s) => s.transactions);
  const recentTxns = transactions.slice(0, 3);
  const daysLeft = daysUntil(wallet.nextDeductionDate);
  const thisMonthTxns = transactions.filter((t) => t.date.startsWith('2026-03'));
  const thisMonthTotal = thisMonthTxns.reduce((sum, t) => sum + t.amount, 0);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={colors.dark === '#1A1A1A' ? 'dark-content' : 'light-content'} backgroundColor={colors.screenBg} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name ?? 'Civil Servant'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatarInitials ?? 'CS'}</Text>
          </View>
        </View>

        <GradientCard wallet={wallet} userName={user?.name ?? ''} walletId={user?.walletId ?? ''} />

        <View style={styles.countdownRow}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNum}>{daysLeft}</Text>
            <Text style={styles.countdownLabel}>Days to deduction</Text>
          </View>
          <View style={styles.countdownDivider} />
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNum}>${wallet.nextDeductionAmount.toFixed(2)}</Text>
            <Text style={styles.countdownLabel}>Expected deduction</Text>
          </View>
          <View style={styles.countdownDivider} />
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNum}>{thisMonthTxns.length}</Text>
            <Text style={styles.countdownLabel}>Transactions</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route)} activeOpacity={0.8}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>{a.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>March 2026 Summary</Text>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>${thisMonthTotal.toFixed(2)}</Text>
              <Text style={styles.summaryLbl}>Total Spent</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{thisMonthTxns.length}</Text>
              <Text style={styles.summaryLbl}>Purchases</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.success }]}>${wallet.availableCredit.toFixed(2)}</Text>
              <Text style={styles.summaryLbl}>Remaining</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(wallet.amountUsed / wallet.creditLimit) * 100}%` as any }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Used: ${wallet.amountUsed.toFixed(2)}</Text>
            <Text style={styles.progressText}>Limit: ${wallet.creditLimit.toFixed(2)}</Text>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <Card noPadding style={styles.txnCard}>
          <View style={{ padding: Spacing.md }}>
            {recentTxns.map((txn, i) => (
              <TransactionItem key={txn.id} transaction={txn} showDivider={i < recentTxns.length - 1} />
            ))}
          </View>
        </Card>

        <View style={styles.deptRow}>
          <Badge label={user?.department ?? ''} variant="primary" />
          <Badge label={user?.ministry ?? ''} variant="neutral" />
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    scroll: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
    greeting: { fontSize: FontSize.sm, color: c.midGray, fontWeight: FontWeight.medium },
    userName: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
    countdownRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: c.cardBg, marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
    countdownItem: { flex: 1, alignItems: 'center' },
    countdownNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    countdownLabel: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    countdownDivider: { width: 1, height: 32, backgroundColor: c.lightGray },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.dark, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    seeAll: { color: c.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    quickActions: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm },
    actionBtn: { flex: 1, alignItems: 'center', backgroundColor: c.cardBg, borderRadius: Radius.lg, paddingVertical: Spacing.md, ...Shadow.sm },
    actionIcon: { width: 48, height: 48, backgroundColor: c.lightGray, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    actionEmoji: { fontSize: 22 },
    actionLabel: { fontSize: FontSize.xs, color: c.dark, fontWeight: FontWeight.medium, textAlign: 'center' },
    summaryCard: { marginHorizontal: Spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: c.dark },
    summaryLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    summaryDivider: { width: 1, height: 36, backgroundColor: c.lightGray },
    progressBg: { height: 6, backgroundColor: c.lightGray, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: 3 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
    progressText: { fontSize: FontSize.xs, color: c.midGray },
    txnCard: { marginHorizontal: Spacing.md },
    deptRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  });
}
