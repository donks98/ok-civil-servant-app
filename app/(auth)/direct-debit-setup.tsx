import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

type Channel = 'ECOCASH' | 'BANK_TRANSFER' | 'TELECASH' | 'INNBUCKS';

const CHANNELS: { value: Channel; label: string; icon: string; desc: string }[] = [
  { value: 'ECOCASH', label: 'EcoCash', icon: '📱', desc: 'Deduct from your EcoCash wallet' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', desc: 'Deduct from your bank account' },
  { value: 'TELECASH', label: 'TeleCash', icon: '💰', desc: 'Deduct from your TeleCash wallet' },
  { value: 'INNBUCKS', label: 'InnBucks', icon: '💳', desc: 'Deduct from your InnBucks account' },
];

const BANKS = ['CBZ Bank', 'Stanbic Bank', 'ZB Bank', 'BancABC', 'Ecobank', 'NMB Bank', 'Nedbank', 'FBC Bank', 'Steward Bank'];

export default function DirectDebitSetupScreen() {
  const setDirectDebitActive = useAppStore((s) => s.setDirectDebitActive);

  const [channel, setChannel] = useState<Channel>('ECOCASH');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranchCode, setBankBranchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);

  const handleSetup = async () => {
    if ((channel === 'ECOCASH' || channel === 'TELECASH' || channel === 'INNBUCKS') && mobileNumber.replace(/\D/g, '').length < 9) {
      Alert.alert('Missing Number', `Please enter your ${CHANNELS.find((c) => c.value === channel)?.label} number.`);
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
        ecocashNumber: channel !== 'BANK_TRANSFER' ? mobileNumber : undefined,
        bankAccount: channel === 'BANK_TRANSFER' ? bankAccount : undefined,
        bankName: channel === 'BANK_TRANSFER' ? bankName : undefined,
        bankBranchCode: channel === 'BANK_TRANSFER' ? bankBranchCode || undefined : undefined,
      });
      setDirectDebitActive(true);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Setup Failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#CC0000', '#7A0000']} style={styles.outerGrad}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      <View style={styles.topSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>OK</Text>
        </View>
        <Text style={styles.title}>Set Up Direct Debit</Text>
        <Text style={styles.subtitle}>
          Your full outstanding balance is deducted automatically the moment your salary arrives — no delays, no loopholes.
        </Text>
        <View style={styles.infoPill}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#FFFFFF" />
          <Text style={styles.infoPillText}>Deducted instantly on salary payment</Text>
        </View>
      </View>

      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>

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

          {(channel === 'ECOCASH' || channel === 'TELECASH' || channel === 'INNBUCKS') && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>+263</Text>
                <TextInput
                  style={styles.input}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="77 000 0000"
                  placeholderTextColor="#AAAAAA"
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
                  <Text style={[styles.pickerBtnText, !bankName && { color: '#AAAAAA' }]}>
                    {bankName || 'Select your bank'}
                  </Text>
                  <Ionicons name={bankPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#AAAAAA" />
                </TouchableOpacity>
                {bankPickerOpen && (
                  <View style={styles.dropdown}>
                    {BANKS.map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.dropdownItem, b === bankName && styles.dropdownItemActive]}
                        onPress={() => { setBankName(b); setBankPickerOpen(false); }}
                      >
                        <Text style={[styles.dropdownText, b === bankName && { color: '#CC0000', fontWeight: FontWeight.bold }]}>{b}</Text>
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
                  placeholderTextColor="#AAAAAA"
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
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.setupBtn, loading && { opacity: 0.6 }]}
            onPress={handleSetup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#CC0000', '#990000']} style={styles.setupBtnGrad}>
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.setupBtnText}>Activate Direct Debit</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
            <Text style={styles.skipHint}>(Credit will be locked until you set this up)</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outerGrad: { flex: 1 },
  topSection: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  logoBox: {
    width: 56, height: 56, backgroundColor: '#FFFFFF',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  logoText: { color: '#CC0000', fontSize: 24, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.md },
  infoPill: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  infoPillText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  card: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  cardContent: { padding: Spacing.xl, paddingBottom: 40 },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#6B6B6B',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xs },
  channelCard: {
    width: '47%', backgroundColor: '#F8F8F8',
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1.5, borderColor: '#EEEEEE',
  },
  channelCardActive: { borderColor: '#CC0000', backgroundColor: '#FFF5F5' },
  channelIcon: { fontSize: 22, marginBottom: Spacing.xs },
  channelLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#1A1A1A', marginBottom: 2 },
  channelLabelActive: { color: '#CC0000' },
  channelDesc: { fontSize: 11, color: '#6B6B6B', lineHeight: 15 },
  channelCheck: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#CC0000', alignItems: 'center', justifyContent: 'center',
  },
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: '#1A1A1A', marginBottom: Spacing.xs },
  fieldHint: { fontSize: FontSize.xs, color: '#6B6B6B', marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EEEEEE',
    borderRadius: Radius.md, backgroundColor: '#F8F8F8',
  },
  prefix: {
    paddingHorizontal: Spacing.md, color: '#1A1A1A', fontWeight: FontWeight.medium,
    borderRightWidth: 1, borderRightColor: '#EEEEEE',
    paddingVertical: Spacing.sm + 4, fontSize: FontSize.md,
  },
  input: { flex: 1, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: '#1A1A1A' },
  inputFull: {
    borderWidth: 1.5, borderColor: '#EEEEEE', borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md,
    fontSize: FontSize.md, color: '#1A1A1A', backgroundColor: '#F8F8F8',
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#EEEEEE', borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md, backgroundColor: '#F8F8F8',
  },
  pickerBtnText: { fontSize: FontSize.md, color: '#1A1A1A' },
  dropdown: {
    borderWidth: 1, borderColor: '#EEEEEE', borderRadius: Radius.md,
    marginTop: 4, backgroundColor: '#FFFFFF', overflow: 'hidden', maxHeight: 200,
  },
  dropdownItem: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md },
  dropdownItemActive: { backgroundColor: '#F8F8F8' },
  dropdownText: { fontSize: FontSize.md, color: '#1A1A1A' },
  setupBtn: { marginTop: Spacing.xl, borderRadius: Radius.lg, overflow: 'hidden' },
  setupBtnGrad: { paddingVertical: Spacing.md + 4, alignItems: 'center' },
  setupBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  skipBtn: { alignItems: 'center', marginTop: Spacing.lg, paddingVertical: Spacing.sm },
  skipText: { color: '#6B6B6B', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  skipHint: { color: '#AAAAAA', fontSize: FontSize.xs, marginTop: 2 },
});
