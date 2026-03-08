import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { TransactionItem } from '../../components/TransactionItem';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useI18n } from '../../hooks/useI18n';
import { Transaction } from '../../data/mockData';
import { api } from '../../services/api';
import { showError } from '../../utils/errorHandler';

const MONTHS = ['March 2026', 'February 2026', 'January 2026'];
const monthPrefix: Record<string, string> = {
  'March 2026': '2026-03',
  'February 2026': '2026-02',
  'January 2026': '2026-01',
};

const DISPUTE_REASONS = ['Incorrect amount', 'Unrecognised transaction', 'Store error', 'Duplicate charge', 'Other'];

export default function HistoryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const t = useI18n();
  const transactions = useAppStore((s) => s.transactions);
  const wallet = useAppStore((s) => s.wallet);
  const [activeMonth, setActiveMonth] = useState('March 2026');
  const [search, setSearch] = useState('');

  // Dispute modal state
  const [disputeTxn, setDisputeTxn] = useState<Transaction | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNote, setDisputeNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = transactions
    .filter((t) => t.date.startsWith(monthPrefix[activeMonth]))
    .filter((t) => search === '' || t.storeName.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  const totalSpent = filtered.reduce((sum, t) => sum + t.amount, 0);

  const handleDispute = async () => {
    if (!disputeTxn || !disputeReason) return;
    setSubmitting(true);
    try {
      await api.transactions.dispute(disputeTxn.id, disputeReason, disputeNote || undefined);
      setDisputeTxn(null);
      setDisputeReason('');
      setDisputeNote('');
      Alert.alert('Dispute Submitted', 'Your dispute has been submitted. We will review within 3 business days.');
    } catch (e) {
      showError(e, 'Dispute Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t.historyTitle}</Text>
          <Text style={styles.headerSub}>{filtered.length} transactions · ${totalSpent.toFixed(2)} spent</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')} style={styles.analyticsBtn} activeOpacity={0.8}>
          <Ionicons name="bar-chart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.analyticsBtnText}>{t.analytics}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthTabsScroll} contentContainerStyle={styles.monthTabs}>
          {MONTHS.map((m) => (
            <TouchableOpacity key={m} style={[styles.monthTab, activeMonth === m && styles.monthTabActive]} onPress={() => setActiveMonth(m)} activeOpacity={0.8}>
              <Text style={[styles.monthTabText, activeMonth === m && styles.monthTabTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>${totalSpent.toFixed(2)}</Text>
              <Text style={styles.summaryLbl}>{t.totalSpent}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{filtered.length}</Text>
              <Text style={styles.summaryLbl}>{t.transactions}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.success }]}>${(wallet.creditLimit - totalSpent).toFixed(2)}</Text>
              <Text style={styles.summaryLbl}>{t.remaining}</Text>
            </View>
          </View>
          <View style={styles.categories}>
            {['Groceries', 'Pharmacy', 'Household', 'Bakery', 'Beverages'].map((cat) => {
              const catTotal = filtered.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);
              if (catTotal === 0) return null;
              return (
                <View key={cat} style={styles.catItem}>
                  <Text style={styles.catLabel}>{cat}</Text>
                  <Text style={styles.catVal}>${catTotal.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder={t.search + '...'}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.midGray}
          />
        </View>

        {filtered.length > 0 ? (
          <Card noPadding style={styles.txnCard}>
            <View style={{ padding: Spacing.md }}>
              {filtered.map((txn, i) => (
                <View key={txn.id}>
                  <TransactionItem transaction={txn} showDivider={i < filtered.length - 1} />
                  <TouchableOpacity style={styles.disputeLink} onPress={() => setDisputeTxn(txn)} activeOpacity={0.7}>
                    <Text style={styles.disputeLinkText}>Dispute</Text>
                  </TouchableOpacity>
                  {i < filtered.length - 1 && <View style={{ height: Spacing.sm }} />}
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧾</Text>
            <Text style={styles.emptyText}>{t.noTransactions}</Text>
          </View>
        )}

        {activeMonth === 'March 2026' && (
          <View style={styles.deductionNotice}>
            <Text style={styles.deductionIcon}>📅</Text>
            <View>
              <Text style={styles.deductionTitle}>Salary Deduction: 28 March 2026</Text>
              <Text style={styles.deductionSub}>${wallet.nextDeductionAmount.toFixed(2)} will be deducted from your salary</Text>
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Dispute Modal */}
      <Modal visible={!!disputeTxn} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispute Transaction</Text>
              <TouchableOpacity onPress={() => { setDisputeTxn(null); setDisputeReason(''); setDisputeNote(''); }}>
                <Ionicons name="close" size={22} color={colors.midGray} />
              </TouchableOpacity>
            </View>
            {disputeTxn && (
              <View style={styles.disputeTxnRow}>
                <Text style={styles.disputeTxnName}>{disputeTxn.storeName}</Text>
                <Text style={styles.disputeTxnAmt}>${disputeTxn.amount.toFixed(2)}</Text>
              </View>
            )}
            <Text style={styles.modalSectionLbl}>Reason</Text>
            {DISPUTE_REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.disputeReasonItem, disputeReason === r && styles.disputeReasonActive]}
                onPress={() => setDisputeReason(r)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, disputeReason === r && styles.radioActive]}>
                  {disputeReason === r && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.disputeReasonText, disputeReason === r && styles.disputeReasonTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.modalSectionLbl}>Additional Notes (optional)</Text>
            <TextInput
              style={styles.disputeInput}
              value={disputeNote}
              onChangeText={setDisputeNote}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.midGray}
              multiline
              numberOfLines={2}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => { setDisputeTxn(null); setDisputeReason(''); setDisputeNote(''); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, (!disputeReason || submitting) && { opacity: 0.5 }]}
                onPress={handleDispute}
                disabled={!disputeReason || submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.confirmText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    scroll: { flex: 1 },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xl + 4, flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 4 },
    analyticsBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2 },
    analyticsBtnText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: FontWeight.semiBold },
    monthTabsScroll: { marginTop: Spacing.sm },
    monthTabs: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm, flexDirection: 'row' },
    monthTab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: c.cardBg, alignItems: 'center', ...Shadow.sm },
    monthTabActive: { backgroundColor: c.primary },
    monthTabText: { color: c.midGray, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    monthTabTextActive: { color: '#FFFFFF', fontWeight: FontWeight.bold },
    summaryCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: c.dark },
    summaryLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    summaryDivider: { width: 1, height: 36, backgroundColor: c.lightGray },
    categories: { borderTopWidth: 1, borderTopColor: c.lightGray, paddingTop: Spacing.sm, gap: Spacing.xs },
    catItem: { flexDirection: 'row', justifyContent: 'space-between' },
    catLabel: { color: c.midGray, fontSize: FontSize.sm },
    catVal: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    searchInput: { backgroundColor: c.cardBg, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark, ...Shadow.sm },
    txnCard: { marginHorizontal: Spacing.md },
    disputeLink: { alignSelf: 'flex-end', paddingVertical: 2, paddingHorizontal: Spacing.xs },
    disputeLinkText: { color: c.primary, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
    emptyText: { color: c.midGray, fontSize: FontSize.md },
    deductionNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: c.infoLight, margin: Spacing.md, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: c.info },
    deductionIcon: { fontSize: 22 },
    deductionTitle: { color: c.info, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
    deductionSub: { color: c.midGray, fontSize: FontSize.xs, marginTop: 2 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: c.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    disputeTxnRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: c.lightGray, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
    disputeTxnName: { color: c.dark, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
    disputeTxnAmt: { color: c.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
    modalSectionLbl: { fontSize: FontSize.sm, color: c.midGray, fontWeight: FontWeight.medium, marginBottom: Spacing.sm, marginTop: Spacing.sm },
    disputeReasonItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.sm, paddingHorizontal: Spacing.xs },
    disputeReasonActive: { backgroundColor: '#FFF5F5' },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: c.midGray, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: c.primary },
    radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary },
    disputeReasonText: { fontSize: FontSize.sm, color: c.dark },
    disputeReasonTextActive: { color: c.primary, fontWeight: FontWeight.semiBold },
    disputeInput: { borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, fontSize: FontSize.sm, color: c.dark, marginBottom: Spacing.md, minHeight: 60, textAlignVertical: 'top', backgroundColor: c.offWhite },
    modalBtns: { flexDirection: 'row', gap: Spacing.md },
    modalBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: c.lightGray },
    confirmBtn: { backgroundColor: c.primary },
    cancelText: { color: c.dark, fontWeight: FontWeight.semiBold },
    confirmText: { color: '#FFFFFF', fontWeight: FontWeight.bold },
  });
}
