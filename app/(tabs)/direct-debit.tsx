import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

type Channel = 'ECOCASH' | 'BANK_TRANSFER' | 'TELECASH' | 'INNBUCKS';
const CHANNELS: { value: Channel; label: string; icon: string; desc: string }[] = [
  { value: 'ECOCASH', label: 'EcoCash', icon: '📱', desc: 'Deduct from your EcoCash wallet' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', desc: 'Deduct directly from your bank account' },
  { value: 'TELECASH', label: 'TeleCash', icon: '💰', desc: 'Deduct from your TeleCash wallet' },
  { value: 'INNBUCKS', label: 'InnBucks', icon: '💳', desc: 'Deduct from your InnBucks account' },
];

const BANKS = ['CBZ Bank', 'Stanbic Bank', 'ZB Bank', 'BancABC', 'Ecobank', 'NMB Bank', 'Nedbank', 'FBC Bank', 'Steward Bank'];

export default function DirectDebitScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setDirectDebitActive = useAppStore((s) => s.setDirectDebitActive);

  const [channel, setChannel] = useState<Channel>('ECOCASH');
  const [deductionDay, setDeductionDay] = useState('25');
  const [ecocashNumber, setEcocashNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranchCode, setBankBranchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);

  useEffect(() => {
    api.directDebit.getSchedule()
      .then((s) => {
        if (s) {
          setExisting(s);
          setChannel(s.paymentChannel ?? 'ECOCASH');
          setDeductionDay(String(s.deductionDay ?? 25));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    const day = parseInt(deductionDay, 10);
    if (!day || day < 1 || day > 28) {
      Alert.alert('Invalid Day', 'Deduction day must be between 1 and 28.');
      return;
    }
    if (channel === 'ECOCASH' && ecocashNumber.replace(/\D/g, '').length < 9) {
      Alert.alert('Invalid Number', 'Please enter your EcoCash number.');
      return;
    }
    if (channel === 'BANK_TRANSFER' && (!bankAccount.trim() || !bankName)) {
      Alert.alert('Missing Details', 'Please enter your bank account number and select your bank.');
      return;
    }
    setLoading(true);
    try {
      await api.directDebit.setup({
        channel,
        ecocashNumber: channel === 'ECOCASH' || channel === 'TELECASH' || channel === 'INNBUCKS' ? ecocashNumber : undefined,
        bankAccount: channel === 'BANK_TRANSFER' ? bankAccount : undefined,
        bankName: channel === 'BANK_TRANSFER' ? bankName : undefined,
        bankBranchCode: channel === 'BANK_TRANSFER' ? bankBranchCode || undefined : undefined,
        deductionDay: day,
        deductionType: 'FULL_BALANCE',
      });
      setDirectDebitActive(true);
      Alert.alert(
        'Direct Debit Set Up',
        `Your salary deduction is scheduled for the ${day}${daySuffix(day)} of each month via ${CHANNELS.find((c) => c.value === channel)?.label}.`,
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Setup Failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Direct Debit Setup</Text>
          <Text style={styles.headerSub}>Automate your credit repayment</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {existing && (
          <View style={styles.existingBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.existingText}>
              Active schedule: {CHANNELS.find((c) => c.value === existing.paymentChannel)?.label} on the {existing.deductionDay}{daySuffix(existing.deductionDay)}
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Payment Channel</Text>
        <View style={styles.channelGrid}>
          {CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch.value}
              style={[styles.channelCard, channel === ch.value && styles.channelCardActive]}
              onPress={() => setChannel(ch.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.channelIcon}>{ch.icon}</Text>
              <Text style={[styles.channelLabel, channel === ch.value && styles.channelLabelActive]}>{ch.label}</Text>
              <Text style={styles.channelDesc} numberOfLines={2}>{ch.desc}</Text>
              {channel === ch.value && (
                <View style={styles.channelCheck}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Channel-specific fields */}
        {(channel === 'ECOCASH' || channel === 'TELECASH' || channel === 'INNBUCKS') && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>+263</Text>
              <TextInput
                style={styles.input}
                value={ecocashNumber}
                onChangeText={setEcocashNumber}
                placeholder="77 000 0000"
                placeholderTextColor={colors.midGray}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>
          </View>
        )}

        {channel === 'BANK_TRANSFER' && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bank</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setBankPickerOpen((o) => !o)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerBtnText, !bankName && { color: colors.midGray }]}>
                  {bankName || 'Select your bank'}
                </Text>
                <Ionicons name={bankPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.midGray} />
              </TouchableOpacity>
              {bankPickerOpen && (
                <View style={styles.dropdown}>
                  {BANKS.map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.dropdownItem, b === bankName && styles.dropdownItemActive]}
                      onPress={() => { setBankName(b); setBankPickerOpen(false); }}
                    >
                      <Text style={[styles.dropdownText, b === bankName && { color: colors.primary, fontWeight: FontWeight.bold }]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <TextInput
                style={styles.inputFull}
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholder="e.g. 0001234567890"
                placeholderTextColor={colors.midGray}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Branch Code (optional)</Text>
              <TextInput
                style={styles.inputFull}
                value={bankBranchCode}
                onChangeText={setBankBranchCode}
                placeholder="e.g. 001"
                placeholderTextColor={colors.midGray}
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Deduction Day</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldHint}>Day of the month to deduct (1–28)</Text>
          <TextInput
            style={styles.inputFull}
            value={deductionDay}
            onChangeText={(v) => setDeductionDay(v.replace(/\D/g, '').slice(0, 2))}
            placeholder="25"
            placeholderTextColor={colors.midGray}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        <View style={styles.deductionInfo}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.deductionInfoText}>Full balance deducted automatically each month</Text>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.noticeText}>
            Your deduction runs automatically when your salary is detected. OK Zimbabwe uses bank-grade encryption for all account details.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[...GradientRed]} style={styles.saveBtnGrad}>
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.saveBtnText}>{existing ? 'Update Schedule' : 'Activate Direct Debit'}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function daySuffix(d: number): string {
  if (d === 1 || d === 21) return 'st';
  if (d === 2 || d === 22) return 'nd';
  if (d === 3 || d === 23) return 'rd';
  return 'th';
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: FontWeight.extraBold },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 2 },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    existingBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#E6F5EC', padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: c.success },
    existingText: { color: c.dark, fontSize: FontSize.sm, flex: 1 },
    sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: c.midGray, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.lg, marginBottom: Spacing.sm },
    channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xs },
    channelCard: { width: '47%', backgroundColor: c.cardBg, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: c.borderGray, ...Shadow.sm },
    channelCardActive: { borderColor: c.primary, backgroundColor: '#FFF5F5' },
    channelIcon: { fontSize: 24, marginBottom: Spacing.xs },
    channelLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: c.dark, marginBottom: 2 },
    channelLabelActive: { color: c.primary },
    channelDesc: { fontSize: 11, color: c.midGray, lineHeight: 15 },
    channelCheck: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, width: 18, height: 18, borderRadius: 9, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    fieldGroup: { marginBottom: Spacing.md },
    fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: c.dark, marginBottom: Spacing.xs },
    fieldHint: { fontSize: FontSize.xs, color: c.midGray, marginBottom: Spacing.xs },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, backgroundColor: c.offWhite },
    prefix: { paddingHorizontal: Spacing.md, color: c.dark, fontWeight: FontWeight.medium, borderRightWidth: 1, borderRightColor: c.borderGray, paddingVertical: Spacing.sm + 4, fontSize: FontSize.md },
    input: { flex: 1, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark },
    inputFull: { borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark, backgroundColor: c.offWhite },
    pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md, backgroundColor: c.offWhite },
    pickerBtnText: { fontSize: FontSize.md, color: c.dark },
    dropdown: { borderWidth: 1, borderColor: c.borderGray, borderRadius: Radius.md, marginTop: 4, backgroundColor: c.cardBg, overflow: 'hidden', maxHeight: 200 },
    dropdownItem: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md },
    dropdownItemActive: { backgroundColor: c.offWhite },
    dropdownText: { fontSize: FontSize.md, color: c.dark },
    typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: c.cardBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: c.borderGray },
    typeRowActive: { borderColor: c.primary, backgroundColor: '#FFF5F5' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.borderGray, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    radioActive: { borderColor: c.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary },
    typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: c.dark, marginBottom: 2 },
    typeDesc: { fontSize: FontSize.xs, color: c.midGray },
    deductionInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#E6F5EC', padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.lg, borderLeftWidth: 3, borderLeftColor: c.success },
    deductionInfoText: { flex: 1, fontSize: FontSize.sm, color: c.dark },
    noticeBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#FFF5F5', padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.md, borderLeftWidth: 3, borderLeftColor: c.primary },
    noticeText: { flex: 1, fontSize: FontSize.xs, color: c.dark, lineHeight: 18 },
    saveBtn: { marginTop: Spacing.xl, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.md },
    saveBtnGrad: { paddingVertical: Spacing.md + 4, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  });
}
