import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { GradientCard } from '../../components/GradientCard';
import { TransactionItem } from '../../components/TransactionItem';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useI18n } from '../../hooks/useI18n';


function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const t = useI18n();
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const transactions = useAppStore((s) => s.transactions);
  const directDebitActive = useAppStore((s) => s.directDebitActive);
  const recentTxns = transactions.slice(0, 3);
  const daysLeft = daysUntil(wallet.nextDeductionDate);
  const thisMonthTxns = transactions.filter((t) => t.date.startsWith('2026-03'));
  const thisMonthTotal = thisMonthTxns.reduce((sum, t) => sum + t.amount, 0);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t.goodMorning;
    if (h < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
  const quickActions: { icon: IoniconsName; label: string; route: '/(tabs)/pay' | '/(tabs)/analytics' | '/(tabs)/stores' | '/(tabs)/shopping-list'; color: string }[] = [
    { icon: 'qr-code',        label: t.payAtStore,    route: '/(tabs)/pay',           color: '#CC0000' },
    { icon: 'bar-chart',      label: t.analytics,     route: '/(tabs)/analytics',     color: '#3B82F6' },
    { icon: 'location',       label: t.findStore,     route: '/(tabs)/stores',        color: '#00843D' },
    { icon: 'list',           label: t.shoppingList,  route: '/(tabs)/shopping-list', color: '#F97316' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={colors.dark === '#1A1A1A' ? 'dark-content' : 'light-content'} backgroundColor={colors.screenBg} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name ?? 'Civil Servant'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={colors.dark} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <LinearGradient colors={['#CC0000', '#8B0000']} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatarInitials ?? 'CS'}</Text>
            </LinearGradient>
          </View>
        </View>

        {!directDebitActive && (
          <TouchableOpacity
            style={styles.ddBanner}
            onPress={() => router.push('/(tabs)/direct-debit')}
            activeOpacity={0.85}
          >
            <Ionicons name="warning" size={18} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.ddBannerTitle}>Credit Locked — Action Required</Text>
              <Text style={styles.ddBannerSub}>Set up Direct Debit to activate your grocery credit</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        )}

        <GradientCard wallet={wallet} userName={user?.name ?? ''} walletId={user?.walletId ?? ''} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{daysLeft}</Text>
            <Text style={styles.statLabel}>Days left</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>${wallet.nextDeductionAmount.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Next deduction</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{thisMonthTxns.length}</Text>
            <Text style={styles.statLabel}>Purchases</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.success }]}>${wallet.availableCredit.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t.quickActions}</Text>
        <View style={styles.quickActions}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route)} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
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
              <Text style={styles.summaryLbl}>{t.totalSpent}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{thisMonthTxns.length}</Text>
              <Text style={styles.summaryLbl}>Purchases</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.success }]}>${wallet.availableCredit.toFixed(2)}</Text>
              <Text style={styles.summaryLbl}>{t.remaining}</Text>
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
          <Text style={styles.sectionTitle}>{t.recentTransactions}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>{t.seeAll}</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
    greeting: { fontSize: FontSize.sm, color: c.midGray, fontWeight: FontWeight.medium },
    userName: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.cardBg, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
    notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#CC0000', borderWidth: 1.5, borderColor: c.cardBg },
    avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.cardBg, marginHorizontal: Spacing.md, marginTop: Spacing.sm, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, ...Shadow.sm },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: FontSize.lg, fontWeight: FontWeight.extraBold, color: c.dark },
    statLabel: { fontSize: 10, color: c.midGray, marginTop: 3, textAlign: 'center' },
    statDivider: { width: 1, height: 28, backgroundColor: c.lightGray },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.dark, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    seeAll: { color: c.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    quickActions: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm },
    actionBtn: { flex: 1, alignItems: 'center', backgroundColor: c.cardBg, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xs, ...Shadow.sm },
    actionIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    actionLabel: { fontSize: FontSize.xs, color: c.dark, fontWeight: FontWeight.medium, textAlign: 'center', lineHeight: 14 },
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
    ddBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: c.primary, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.md },
    ddBannerTitle: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    ddBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 1 },
  });
}
