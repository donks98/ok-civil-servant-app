import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Switch, Modal, TextInput, ActivityIndicator, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GradientRed, ColorScheme } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { LOCALE_LABELS, Locale } from '../../constants/i18n';

const THEME_OPTIONS: { label: string; value: ColorScheme; icon: string }[] = [
  { label: 'Light', value: 'light', icon: '☀️' },
  { label: 'Dark', value: 'dark', icon: '🌙' },
  { label: 'Auto', value: 'auto', icon: '⚙️' },
];

const LOCALES_LIST: Locale[] = ['en', 'sn', 'nd'];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const transactions = useAppStore((s) => s.transactions);
  const logout = useAppStore((s) => s.logout);
  const colorScheme = useAppStore((s) => s.colorScheme);
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const biometricEnabled = useAppStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useAppStore((s) => s.setBiometricEnabled);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const darkModeSchedule = useAppStore((s) => s.darkModeSchedule);
  const setDarkModeSchedule = useAppStore((s) => s.setDarkModeSchedule);
  const familyMembers = useAppStore((s) => s.familyMembers);
  const addFamilyMember = useAppStore((s) => s.addFamilyMember);
  const removeFamilyMember = useAppStore((s) => s.removeFamilyMember);

  const [addFamilyVisible, setAddFamilyVisible] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyRelationship, setFamilyRelationship] = useState('');
  const [familyNatId, setFamilyNatId] = useState('');
  const [familyLimit, setFamilyLimit] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [familyQrMember, setFamilyQrMember] = useState<import('../../store/useAppStore').FamilyMember | null>(null);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your OK Civil Servant account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)'); } },
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable biometric login' });
      if (result.success) setBiometricEnabled(true);
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleDownloadStatement = async () => {
    setGeneratingPdf(true);
    try {
      const marchTxns = transactions.filter((t) => t.date.startsWith('2026-03'));
      const total = marchTxns.reduce((s, t) => s + t.amount, 0);
      const rows = marchTxns.map((t) =>
        `<tr><td>${t.date}</td><td>${t.storeName}</td><td>${t.category}</td><td>$${t.amount.toFixed(2)}</td><td>$${t.balance.toFixed(2)}</td></tr>`
      ).join('');
      const html = `
        <html><body style="font-family:sans-serif;padding:20px">
          <h2 style="color:#CC0000">OK Zimbabwe Civil Servant Credit</h2>
          <p>Account: <b>${user?.name}</b> &middot; ${user?.walletId}</p>
          <p>Statement Period: March 2026 &middot; Credit Limit: $${wallet.creditLimit}</p>
          <hr/>
          <table border="1" cellpadding="6" style="width:100%;border-collapse:collapse;font-size:12px">
            <tr style="background:#CC0000;color:white"><th>Date</th><th>Store</th><th>Category</th><th>Amount</th><th>Balance</th></tr>
            ${rows}
            <tr style="font-weight:bold"><td colspan="3">Total Spent</td><td>$${total.toFixed(2)}</td><td></td></tr>
          </table>
          <p style="color:#888;font-size:11px;margin-top:20px">Generated: ${new Date().toLocaleDateString()}</p>
        </body></html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'March 2026 Statement' });
    } catch {
      Alert.alert('Error', 'Could not generate statement. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleAddFamily = () => {
    if (!familyName.trim() || !familyRelationship.trim()) return;
    addFamilyMember({
      name: familyName.trim(),
      relationship: familyRelationship.trim(),
      nationalId: familyNatId.trim() || 'N/A',
      subLimit: parseFloat(familyLimit) || 20,
      amountUsed: 0,
    });
    setFamilyName(''); setFamilyRelationship(''); setFamilyNatId(''); setFamilyLimit('');
    setAddFamilyVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[...GradientRed]} style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.avatarInitials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.id}>Employee ID: {user?.id}</Text>
          <View style={styles.badgeRow}>
            <Badge label={user?.department ?? ''} variant="primary" style={styles.whiteBadge} />
          </View>
        </LinearGradient>

        <View style={styles.creditRow}>
          <View style={styles.creditItem}>
            <Text style={styles.creditNum}>${wallet.creditLimit.toFixed(0)}</Text>
            <Text style={styles.creditLbl}>Credit Limit</Text>
          </View>
          <View style={styles.creditDivider} />
          <View style={styles.creditItem}>
            <Text style={[styles.creditNum, { color: colors.success }]}>${wallet.availableCredit.toFixed(2)}</Text>
            <Text style={styles.creditLbl}>Available</Text>
          </View>
          <View style={styles.creditDivider} />
          <View style={styles.creditItem}>
            <Text style={[styles.creditNum, { color: colors.primary }]}>${wallet.amountUsed.toFixed(2)}</Text>
            <Text style={styles.creditLbl}>Used</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <Card style={styles.card}>
          <InfoRow label="Full Name" value={user?.name ?? ''} colors={colors} />
          <InfoRow label="National ID" value={user?.nationalId ?? ''} colors={colors} />
          <InfoRow label="Mobile" value={user?.phone ?? ''} colors={colors} />
          <InfoRow label="Member Since" value={formatDate(user?.joinedDate ?? '')} colors={colors} last />
        </Card>

        <Text style={styles.sectionTitle}>Employment Details</Text>
        <Card style={styles.card}>
          <InfoRow label="Department" value={user?.department ?? ''} colors={colors} />
          <InfoRow label="Ministry" value={user?.ministry ?? ''} colors={colors} />
          <InfoRow label="Employer Code" value={user?.employerCode ?? ''} colors={colors} />
          <InfoRow label="Monthly Salary" value={`$${user?.monthlySalary?.toFixed(2) ?? '0.00'}`} colors={colors} last />
        </Card>

        <Text style={styles.sectionTitle}>Deduction Schedule</Text>
        <Card style={styles.card}>
          <InfoRow label="Next Deduction" value={formatDate(wallet.nextDeductionDate)} colors={colors} />
          <InfoRow label="Deduction Amount" value={`$${wallet.nextDeductionAmount.toFixed(2)}`} colors={colors} />
          <InfoRow label="Cycle Period" value={`${wallet.cycleStart} → ${wallet.cycleEnd}`} colors={colors} last />
        </Card>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card}>
          <Text style={styles.themeLabel}>Theme Mode</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themeBtn, colorScheme === opt.value && styles.themeBtnActive]}
                onPress={() => setColorScheme(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.themeIcon}>{opt.icon}</Text>
                <Text style={[styles.themeBtnText, colorScheme === opt.value && styles.themeBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {colorScheme === 'auto' && (
            <View style={styles.scheduleRow}>
              <Switch
                value={darkModeSchedule.enabled}
                onValueChange={(v) => setDarkModeSchedule({ ...darkModeSchedule, enabled: v })}
                trackColor={{ true: colors.primary }}
              />
              <Text style={styles.scheduleLabel}>Auto Dark Mode Schedule</Text>
              {darkModeSchedule.enabled && (
                <Text style={styles.scheduleTimes}>{darkModeSchedule.startTime} – {darkModeSchedule.endTime}</Text>
              )}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Language</Text>
        <Card style={styles.card}>
          {LOCALES_LIST.map((loc, i) => (
            <View key={loc}>
              <TouchableOpacity style={styles.localeRow} onPress={() => setLocale(loc)} activeOpacity={0.8}>
                <Text style={styles.localeLabel}>{LOCALE_LABELS[loc]}</Text>
                {locale === loc && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
              {i < LOCALES_LIST.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Family Sub-accounts</Text>
        <Card noPadding style={styles.card}>
          <View style={{ paddingHorizontal: Spacing.md }}>
            {familyMembers.map((m, i) => (
              <View key={m.id}>
                <View style={styles.familyItem}>
                  <View style={styles.familyAvatar}>
                    <Text style={styles.familyAvatarText}>{m.name.split(' ').map((n) => n[0]).join('')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familyName}>{m.name}</Text>
                    <Text style={styles.familyRel}>{m.relationship} · Limit: ${m.subLimit} · Used: ${m.amountUsed}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setFamilyQrMember(m)} style={{ marginRight: Spacing.sm }}>
                    <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${m.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeFamilyMember(m.id) },
                  ])}>
                    <Ionicons name="close-circle-outline" size={20} color={colors.midGray} />
                  </TouchableOpacity>
                </View>
                {i < familyMembers.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            <TouchableOpacity style={styles.addFamilyBtn} onPress={() => setAddFamilyVisible(true)} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={16} color={colors.primary} />
              <Text style={styles.addFamilyText}>+ Add Family Member</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Settings</Text>
        <Card noPadding style={styles.card}>
          <View style={{ paddingHorizontal: Spacing.md }}>
            <SettingRow icon="🔑" label="Change PIN" onPress={() => Alert.alert('Change PIN', 'PIN change flow would open here.')} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="🔔" label="Push Notifications" toggle toggleValue={notificationsEnabled} onToggle={setNotificationsEnabled} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="👆" label="Biometric Login" toggle toggleValue={biometricEnabled} onToggle={handleBiometricToggle} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="📊" label="Spending Analytics" onPress={() => router.push('/(tabs)/analytics')} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="🛍️" label="Shopping List" onPress={() => router.push('/(tabs)/shopping-list')} colors={colors} />
            <View style={styles.divider} />
            <SettingRow
              icon="📄"
              label={generatingPdf ? 'Generating...' : 'Download Statement PDF'}
              onPress={handleDownloadStatement}
              colors={colors}
              rightElement={generatingPdf ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
            />
            <View style={styles.divider} />
            <SettingRow icon="💳" label="Request Credit Limit Increase" onPress={() => router.push('/(tabs)/credit-request')} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="❓" label="Help & Support" onPress={() => Alert.alert('Support', 'Contact OK Zimbabwe: online@okzim.co.zw')} colors={colors} />
            <View style={styles.divider} />
            <SettingRow icon="📜" label="Terms & Conditions" onPress={() => Alert.alert('Terms', 'Civil Servant Credit Programme terms apply.')} colors={colors} />
          </View>
        </Card>

        <View style={styles.walletIdCard}>
          <Text style={styles.walletIdLabel}>Wallet ID</Text>
          <Text style={styles.walletIdVal}>{user?.walletId}</Text>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card noPadding style={styles.card}>
          <View style={{ paddingHorizontal: Spacing.md }}>
            <SettingRow icon="🚪" label="Sign Out" onPress={handleLogout} danger colors={colors} />
          </View>
        </Card>

        <Text style={styles.footer}>OK Zimbabwe Limited · Civil Servant Credit Programme{'\n'}Version 1.0.0</Text>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Family Member QR Modal */}
      <Modal visible={!!familyQrMember} transparent animationType="fade" onRequestClose={() => setFamilyQrMember(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: 'center', paddingTop: Spacing.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{familyQrMember?.name}</Text>
              <TouchableOpacity onPress={() => setFamilyQrMember(null)}>
                <Ionicons name="close" size={22} color={colors.midGray} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalLbl, { marginBottom: Spacing.lg, alignSelf: 'flex-start' }]}>
              {familyQrMember?.relationship} · Sub-limit: ${familyQrMember?.subLimit} · Used: ${familyQrMember?.amountUsed}
            </Text>
            <View style={styles.qrBox}>
              {familyQrMember && (
                <QRCode
                  value={JSON.stringify({
                    type: 'FAMILY_SUB',
                    walletId: user?.walletId,
                    memberId: familyQrMember.id,
                    name: familyQrMember.name,
                    subLimit: familyQrMember.subLimit,
                  })}
                  size={200}
                  color="#1A1A1A"
                  backgroundColor="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.qrHint}>Show this QR to the cashier at any OK store.</Text>
            <Text style={styles.qrSublimit}>Remaining: ${((familyQrMember?.subLimit ?? 0) - (familyQrMember?.amountUsed ?? 0)).toFixed(2)} of ${familyQrMember?.subLimit}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.confirmBtn, { width: '100%', marginTop: Spacing.lg }]}
              onPress={() => {
                Share.share({ message: `OK Civil Servant Sub-account QR for ${familyQrMember?.name} (${familyQrMember?.relationship}). Wallet: ${user?.walletId} | Sub-limit: $${familyQrMember?.subLimit}` });
              }}
            >
              <Text style={styles.confirmText}>Share Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addFamilyVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setAddFamilyVisible(false)}>
                <Ionicons name="close" size={22} color={colors.midGray} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLbl}>Full Name</Text>
            <TextInput style={styles.modalInput} value={familyName} onChangeText={setFamilyName} placeholder="e.g. Mary Moyo" placeholderTextColor={colors.midGray} />
            <Text style={styles.modalLbl}>Relationship</Text>
            <TextInput style={styles.modalInput} value={familyRelationship} onChangeText={setFamilyRelationship} placeholder="e.g. Spouse, Child" placeholderTextColor={colors.midGray} />
            <Text style={styles.modalLbl}>National ID (optional)</Text>
            <TextInput style={styles.modalInput} value={familyNatId} onChangeText={setFamilyNatId} placeholder="e.g. 63-1234567X18" placeholderTextColor={colors.midGray} />
            <Text style={styles.modalLbl}>Sub-limit (USD)</Text>
            <TextInput style={styles.modalInput} value={familyLimit} onChangeText={setFamilyLimit} placeholder="20" placeholderTextColor={colors.midGray} keyboardType="numeric" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAddFamilyVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAddFamily}>
                <Text style={styles.confirmText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors, last }: {
  label: string; value: string; colors: ReturnType<typeof useThemeColors>; last?: boolean;
}) {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm + 2 }}>
        <Text style={{ color: colors.midGray, fontSize: FontSize.sm }}>{label}</Text>
        <Text style={{ color: colors.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, textAlign: 'right', flex: 1, marginLeft: Spacing.md }}>{value}</Text>
      </View>
      {!last && <View style={{ height: 1, backgroundColor: colors.lightGray }} />}
    </>
  );
}

function SettingRow({ icon, label, onPress, danger, toggle, toggleValue, onToggle, colors, rightElement }: {
  icon: string; label: string; onPress?: () => void; danger?: boolean;
  toggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void;
  colors: ReturnType<typeof useThemeColors>; rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md }}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={toggle}
    >
      <View style={{ width: 36, height: 36, backgroundColor: danger ? '#FFF0F0' : colors.lightGray, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: FontSize.md, color: danger ? colors.primary : colors.dark, fontWeight: FontWeight.medium }}>{label}</Text>
      {rightElement ?? (toggle ? (
        <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ true: colors.primary }} />
      ) : (
        <Text style={{ color: colors.midGray, fontSize: FontSize.xl }}>›</Text>
      ))}
    </TouchableOpacity>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.screenBg },
    header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, paddingHorizontal: Spacing.xl },
    avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
    avatarText: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold },
    name: { color: '#FFFFFF', fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, marginBottom: 4 },
    id: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginBottom: Spacing.sm },
    badgeRow: { flexDirection: 'row', gap: Spacing.sm },
    whiteBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
    creditRow: { flexDirection: 'row', backgroundColor: c.cardBg, marginHorizontal: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.md, marginTop: -Spacing.lg },
    creditItem: { flex: 1, alignItems: 'center' },
    creditNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    creditLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    creditDivider: { width: 1, backgroundColor: c.lightGray },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: c.dark, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    card: { marginHorizontal: Spacing.md },
    divider: { height: 1, backgroundColor: c.lightGray },
    themeLabel: { fontSize: FontSize.sm, color: c.midGray, marginBottom: Spacing.sm, fontWeight: FontWeight.medium },
    themeRow: { flexDirection: 'row', gap: Spacing.sm },
    themeBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm + 2, borderRadius: Radius.md, backgroundColor: c.lightGray, borderWidth: 2, borderColor: 'transparent' },
    themeBtnActive: { backgroundColor: '#FFE8E8', borderColor: c.primary },
    themeIcon: { fontSize: 20, marginBottom: 2 },
    themeBtnText: { fontSize: FontSize.xs, color: c.midGray, fontWeight: FontWeight.medium },
    themeBtnTextActive: { color: c.primary, fontWeight: FontWeight.bold },
    scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: c.lightGray },
    scheduleLabel: { flex: 1, color: c.dark, fontSize: FontSize.sm },
    scheduleTimes: { color: c.midGray, fontSize: FontSize.xs },
    localeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md },
    localeLabel: { fontSize: FontSize.md, color: c.dark },
    familyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
    familyAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    familyAvatarText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.xs },
    familyName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: c.dark },
    familyRel: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    addFamilyBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
    addFamilyText: { color: c.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    walletIdCard: { backgroundColor: c.lightGray, marginHorizontal: Spacing.md, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
    walletIdLabel: { color: c.midGray, fontSize: FontSize.xs, marginBottom: 4 },
    walletIdVal: { color: c.dark, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, letterSpacing: 0.5 },
    footer: { color: c.midGray, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: c.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    modalLbl: { fontSize: FontSize.sm, color: c.midGray, marginBottom: Spacing.xs, fontWeight: FontWeight.medium },
    modalInput: { borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark, marginBottom: Spacing.md, backgroundColor: c.offWhite },
    modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
    modalBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: c.lightGray },
    confirmBtn: { backgroundColor: c.primary },
    cancelText: { color: c.dark, fontWeight: FontWeight.semiBold },
    confirmText: { color: '#FFFFFF', fontWeight: FontWeight.bold },
    qrBox: { backgroundColor: '#FFFFFF', borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md, marginBottom: Spacing.md },
    qrHint: { color: c.midGray, fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.xs },
    qrSublimit: { color: c.success, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  });
}
