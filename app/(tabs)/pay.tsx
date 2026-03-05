import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useOfflineQR } from '../../hooks/useOfflineQR';

// Demo transaction for the success screen
const DEMO_STORE = 'OK Borrowdale';
const DEMO_AMOUNT = 12.80;

function generateRef() {
  return 'POS-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

export default function PayScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const biometricEnabled = useAppStore((s) => s.biometricEnabled);
  const [pinVisible, setPinVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [successVisible, setSuccessVisible] = useState(false);
  const [txRef] = useState(generateRef);

  const liveQrData = JSON.stringify({
    walletId: user?.walletId,
    name: user?.name,
    available: wallet.availableCredit,
    ts: Date.now(),
  });

  const { qrData, isOffline, setIsOffline } = useOfflineQR(liveQrData);

  useEffect(() => {
    const timer = setInterval(() => setRefreshKey((k) => k + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to confirm payment',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        setSuccessVisible(true);
      }
    } catch {
      Alert.alert('Error', 'Biometric authentication failed.');
    }
  };

  const handleConfirmPay = () => {
    if (pin === '123456') {
      Keyboard.dismiss();
      setPinVisible(false);
      setPin('');
      setSuccessVisible(true);
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  };

  const closePinModal = () => {
    Keyboard.dismiss();
    setPinVisible(false);
    setPin('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <Text style={styles.headerTitle}>Pay at Store</Text>
        <Text style={styles.headerSub}>Present QR code to the OK cashier</Text>
      </LinearGradient>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#856404" />
          <Text style={styles.offlineText}>Offline — showing cached QR code</Text>
          <TouchableOpacity onPress={() => setIsOffline(false)}>
            <Text style={styles.offlineRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.balancePill}>
        <View style={styles.balancePillInner}>
          <Text style={styles.balancePillLabel}>Available Credit</Text>
          <Text style={styles.balancePillAmount}>${wallet.availableCredit.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.qrCard}>
        <View style={styles.qrHeader}>
          <View style={styles.okChip}>
            <Text style={styles.okChipText}>OK</Text>
          </View>
          <View>
            <Text style={styles.qrName}>{user?.name}</Text>
            <Text style={styles.qrId}>{user?.walletId}</Text>
          </View>
        </View>

        <View style={styles.qrWrapper}>
          <QRCode key={refreshKey} value={qrData} size={200} color={colors.dark} backgroundColor={colors.cardBg} />
        </View>

        <Text style={styles.qrInstruction}>Show this code to the cashier at any OK, Bon Marché, or OKmart store</Text>

        <View style={styles.qrFooter}>
          <View style={styles.qrLimitRow}>
            <Text style={styles.qrLimitLabel}>Credit Limit</Text>
            <Text style={styles.qrLimitVal}>${wallet.creditLimit.toFixed(2)}</Text>
          </View>
          <View style={styles.qrLimitRow}>
            <Text style={styles.qrLimitLabel}>Used This Month</Text>
            <Text style={[styles.qrLimitVal, { color: colors.primary }]}>${wallet.amountUsed.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.authRow}>
        {biometricEnabled && (
          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricAuth} activeOpacity={0.85}>
            <Ionicons name="finger-print" size={20} color={colors.dark} />
            <Text style={styles.biometricText}>Biometric</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.pinBtn, !biometricEnabled && { flex: 1 }]}
          onPress={() => setPinVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[...GradientRed]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pinBtnGrad}>
            <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" style={{ marginRight: Spacing.xs }} />
            <Text style={styles.pinBtnText}>Confirm with PIN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.storeTitle}>Accepted at all OK stores</Text>
      <View style={styles.storeChips}>
        {['OK Stores', 'Bon Marché', 'OKmart'].map((s) => (
          <View key={s} style={styles.storeChip}>
            <Text style={styles.storeChipText}>{s}</Text>
          </View>
        ))}
      </View>

      {/* PIN Modal */}
      <Modal visible={pinVisible} transparent animationType="slide" onRequestClose={closePinModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Enter PIN to Confirm</Text>
                  <Text style={styles.modalSub}>Authorize your payment at the POS</Text>
                  <TextInput
                    style={styles.pinInput}
                    value={pin}
                    onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                    placeholderTextColor={colors.midGray}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmPay}
                    autoFocus
                  />
                  <View style={styles.modalBtns}>
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closePinModal}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleConfirmPay}>
                      <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pinHint}>Demo PIN: 123456</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment Success Modal */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            {/* Header */}
            <LinearGradient colors={['#00843D', '#006B31']} style={styles.successHeader}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Payment Authorized</Text>
              <Text style={styles.successAmount}>${DEMO_AMOUNT.toFixed(2)}</Text>
            </LinearGradient>

            {/* Details */}
            <View style={styles.successBody}>
              <SuccessRow label="Store" value={DEMO_STORE} />
              <SuccessRow label="Account" value={user?.name ?? ''} />
              <SuccessRow label="Wallet ID" value={user?.walletId ?? ''} />
              <SuccessRow label="Reference" value={txRef} mono />
              <SuccessRow
                label="Remaining Credit"
                value={`$${(wallet.availableCredit - DEMO_AMOUNT).toFixed(2)}`}
                highlight
              />
            </View>

            <View style={styles.successFooter}>
              <Text style={styles.successNote}>
                This transaction will appear on your next statement.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => setSuccessVisible(false)} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SuccessRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5E5' }}>
      <Text style={{ color: '#6B6B6B', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: highlight ? '#00843D' : '#1A1A1A', fontSize: 13, fontWeight: highlight ? '700' : '600', fontFamily: mono ? 'monospace' : undefined, maxWidth: '55%', textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl + 10 },
    headerTitle: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 4 },
    offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FFF3CD', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2 },
    offlineText: { flex: 1, fontSize: FontSize.xs, color: '#856404' },
    offlineRetry: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#856404', textDecorationLine: 'underline' },
    balancePill: { marginHorizontal: Spacing.xl, marginTop: -Spacing.lg, marginBottom: Spacing.md },
    balancePillInner: { backgroundColor: c.cardBg, borderRadius: Radius.xl, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Shadow.md },
    balancePillLabel: { color: c.midGray, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    balancePillAmount: { color: c.success, fontSize: FontSize.xl, fontWeight: FontWeight.extraBold },
    qrCard: { backgroundColor: c.cardBg, marginHorizontal: Spacing.md, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.lg, marginBottom: Spacing.md },
    qrHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
    okChip: { width: 44, height: 44, backgroundColor: c.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    okChipText: { color: '#FFFFFF', fontWeight: FontWeight.extraBold, fontSize: FontSize.md, letterSpacing: 1 },
    qrName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.dark },
    qrId: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    qrWrapper: { alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.lightGray, marginBottom: Spacing.md },
    qrInstruction: { color: c.midGray, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.md },
    qrFooter: { gap: Spacing.xs },
    qrLimitRow: { flexDirection: 'row', justifyContent: 'space-between' },
    qrLimitLabel: { color: c.midGray, fontSize: FontSize.sm },
    qrLimitVal: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    authRow: { flexDirection: 'row', marginHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
    biometricBtn: { backgroundColor: c.cardBg, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, ...Shadow.sm },
    biometricText: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    pinBtn: { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
    pinBtnGrad: { paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    pinBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
    storeTitle: { color: c.midGray, fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.sm },
    storeChips: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
    storeChip: { backgroundColor: c.lightGray, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderRadius: Radius.full },
    storeChipText: { color: c.dark, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    // PIN modal
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: c.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
    modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark, marginBottom: Spacing.xs },
    modalSub: { color: c.midGray, fontSize: FontSize.sm, marginBottom: Spacing.xl },
    pinInput: { borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, fontSize: FontSize.xxl, letterSpacing: 8, textAlign: 'center', color: c.dark, marginBottom: Spacing.xl, backgroundColor: c.offWhite },
    modalBtns: { flexDirection: 'row', gap: Spacing.md },
    modalBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: c.lightGray },
    confirmBtn: { backgroundColor: c.primary },
    cancelText: { color: c.dark, fontWeight: FontWeight.semiBold },
    confirmText: { color: '#FFFFFF', fontWeight: FontWeight.bold },
    pinHint: { color: c.midGray, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.sm },
    // Success modal
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl },
    successCard: { width: '100%', borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: c.cardBg, ...Shadow.lg },
    successHeader: { alignItems: 'center', paddingTop: Spacing.xxl, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
    successIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
    successTitle: { color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, marginBottom: Spacing.xs },
    successAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: FontWeight.extraBold, letterSpacing: -1 },
    successBody: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
    successFooter: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
    successNote: { color: c.midGray, fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.md, lineHeight: 18 },
    doneBtn: { backgroundColor: '#00843D', borderRadius: Radius.md, paddingVertical: Spacing.md + 2, alignItems: 'center' },
    doneBtnText: { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  });
}
