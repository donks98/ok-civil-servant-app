import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { SALARY_RANGES } from '../../data/mockData';

const REASONS = [
  'Family medical expenses',
  'School fees and education',
  'Home improvements',
  'Emergency needs',
  'Other',
];

export default function CreditRequestScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wallet = useAppStore((s) => s.wallet);
  const user = useAppStore((s) => s.user);
  const creditRequestStatus = useAppStore((s) => s.creditRequestStatus);
  const submitCreditRequest = useAppStore((s) => s.submitCreditRequest);

  const [desiredLimit, setDesiredLimit] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAllowed = SALARY_RANGES.find((r) => r.value >= (user?.monthlySalary ?? 0))?.creditLimit ?? 200;

  const handleSubmit = async () => {
    const desired = parseFloat(desiredLimit);
    if (!desired || desired <= wallet.creditLimit || !selectedReason) return;
    setIsSubmitting(true);
    await submitCreditRequest(desired, selectedReason + (notes ? ` - ${notes}` : ''));
    setIsSubmitting(false);
  };

  if (creditRequestStatus === 'submitted') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successMsg}>
            Your credit limit increase request has been received. We will review and respond within 5 business days.
          </Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <LinearGradient colors={[...GradientRed]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backHomeBtnGrad}>
              <Text style={styles.backHomeBtnText}>Back to Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const desired = parseFloat(desiredLimit) || 0;
  const canSubmit = desired > wallet.creditLimit && desired <= maxAllowed && selectedReason !== '' && !isSubmitting;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Credit Limit Request</Text>
          <Text style={styles.headerSub}>Request an increase to your credit</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Current info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoVal}>${wallet.creditLimit.toFixed(0)}</Text>
              <Text style={styles.infoLbl}>Current Limit</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.midGray} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoVal, { color: colors.primary }]}>
                {desired > 0 ? `$${desired.toFixed(0)}` : '?'}
              </Text>
              <Text style={styles.infoLbl}>Requested</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoVal, { color: colors.success }]}>${maxAllowed}</Text>
              <Text style={styles.infoLbl}>Max Allowed</Text>
            </View>
          </View>
          <Text style={styles.infoNote}>
            Based on your salary of ${user?.monthlySalary}/month, your maximum credit limit is ${maxAllowed}.
          </Text>
        </View>

        {/* Desired limit */}
        <Text style={styles.sectionLabel}>Desired Credit Limit (USD)</Text>
        <TextInput
          style={styles.input}
          value={desiredLimit}
          onChangeText={setDesiredLimit}
          placeholder={`${wallet.creditLimit + 10} – ${maxAllowed}`}
          placeholderTextColor={colors.midGray}
          keyboardType="numeric"
        />
        {desired > 0 && desired <= wallet.creditLimit && (
          <Text style={styles.errorNote}>Must be greater than your current limit of ${wallet.creditLimit}</Text>
        )}
        {desired > maxAllowed && (
          <Text style={styles.errorNote}>Cannot exceed your salary-based maximum of ${maxAllowed}</Text>
        )}

        {/* Reason */}
        <Text style={styles.sectionLabel}>Reason for Increase</Text>
        <View style={styles.reasonList}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonItem, selectedReason === r && styles.reasonItemActive]}
              onPress={() => setSelectedReason(r)}
              activeOpacity={0.8}
            >
              <View style={[styles.radio, selectedReason === r && styles.radioActive]}>
                {selectedReason === r && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, selectedReason === r && styles.reasonTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional notes */}
        <Text style={styles.sectionLabel}>Additional Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional context..."
          placeholderTextColor={colors.midGray}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Requests are subject to employer payroll verification and OK Zimbabwe's credit policy. Processing time: 3–5 business days.
        </Text>

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
    content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
    infoCard: { backgroundColor: c.cardBg, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadow.sm },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: Spacing.sm },
    infoItem: { alignItems: 'center' },
    infoVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    infoLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    infoNote: { color: c.midGray, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18, borderTopWidth: 1, borderTopColor: c.lightGray, paddingTop: Spacing.sm },
    sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: c.dark, marginBottom: Spacing.xs, marginTop: Spacing.md },
    input: { backgroundColor: c.cardBg, borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark, marginBottom: Spacing.xs },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm },
    errorNote: { color: c.primary, fontSize: FontSize.xs, marginBottom: Spacing.xs },
    reasonList: { gap: Spacing.sm, marginBottom: Spacing.xs },
    reasonItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: c.cardBg, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: 'transparent' },
    reasonItemActive: { borderColor: c.primary, backgroundColor: '#FFF5F5' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.midGray, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: c.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary },
    reasonText: { fontSize: FontSize.md, color: c.dark },
    reasonTextActive: { color: c.primary, fontWeight: FontWeight.semiBold },
    submitBtn: { backgroundColor: c.primary, borderRadius: Radius.md, paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.xl },
    submitBtnDisabled: { opacity: 0.4 },
    submitText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
    disclaimer: { color: c.midGray, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18, marginTop: Spacing.md, paddingHorizontal: Spacing.md },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl },
    successIcon: { marginBottom: Spacing.xl },
    successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: c.dark, marginBottom: Spacing.md, textAlign: 'center' },
    successMsg: { color: c.midGray, fontSize: FontSize.md, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xxl },
    backHomeBtn: { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
    backHomeBtnGrad: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
    backHomeBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  });
}
