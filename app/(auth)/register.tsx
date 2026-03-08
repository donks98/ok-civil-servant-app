import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, useColorScheme, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { DEPARTMENTS, MINISTRIES, SALARY_RANGES } from '../../data/mockData';

type Step = 1 | 2 | 3;

export default function RegisterScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const colorScheme = useAppStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || (colorScheme === 'auto' && systemScheme === 'dark');

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: '', nationalId: '', phone: '',
    department: '', ministry: '', employerCode: '',
    salaryRange: '', pin: '', confirmPin: '',
  });
  const [loading, setLoading] = useState(false);
  const register = useAppStore((s) => s.register);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    } else {
      setLoading(true);
      try {
        const salaryData = SALARY_RANGES.find((r) => r.label === form.salaryRange);
        await register({
          name: form.name, nationalId: form.nationalId, phone: form.phone,
          department: form.department as any, ministry: form.ministry as any,
          employerCode: form.employerCode,
          monthlySalary: salaryData?.value ?? 450,
          creditLimit: salaryData?.creditLimit ?? 120,
        }, form.pin);
        router.push('/(auth)/verify');
      } catch (e: any) {
        Alert.alert('Registration Failed', e.message ?? 'Could not reach the server. Check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = () => {
    if (step === 1) return form.name.length > 2 && form.nationalId.length > 5 && form.phone.length >= 9;
    if (step === 2) return form.department !== '' && form.ministry !== '' && form.salaryRange !== '';
    return form.pin.length === 6 && form.pin === form.confirmPin;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.screenBg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <TouchableOpacity
            onPress={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progressRow}>
            {[1,2,3].map((s) => (
              <View key={s} style={[styles.progressStep, s <= step && styles.progressActive, s < step && styles.progressDone]}>
                <Text style={[styles.progressNum, s <= step && { color: '#FFFFFF' }]}>{s < step ? '✓' : s}</Text>
              </View>
            ))}
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          </View>
          <Text style={styles.stepLabel}>
            {step === 1 ? 'Personal Details' : step === 2 ? 'Employment Info' : 'Set Your PIN'}
          </Text>

          <Text style={styles.title}>
            {step === 1 ? 'Create Account' : step === 2 ? 'Employment Details' : 'Secure Your Account'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Enter your personal information' : step === 2 ? 'Verify your civil service employment' : 'Choose a 6-digit PIN'}
          </Text>

          {step === 1 && (
            <View style={styles.fields}>
              <InputField label="Full Name" value={form.name} onChangeText={(v: string) => update('name', v)} placeholder="e.g. John Moyo" colors={colors} />
              <InputField label="National ID" value={form.nationalId} onChangeText={(v: string) => update('nationalId', v)} placeholder="63-1234567X18" colors={colors} />
              <InputField label="Mobile Number" value={form.phone} onChangeText={(v: string) => update('phone', v)} placeholder="+263 77 000 0000" keyboardType="phone-pad" colors={colors} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.fields}>
              <SelectField label="Department / Role" value={form.department} options={DEPARTMENTS} onSelect={(v: string) => update('department', v)} colors={colors} />
              <SelectField label="Ministry / Employer" value={form.ministry} options={MINISTRIES} onSelect={(v: string) => update('ministry', v)} colors={colors} />
              <InputField label="Employer Code" value={form.employerCode} onChangeText={(v: string) => update('employerCode', v)} placeholder="e.g. MOE-HRE-0047" colors={colors} />
              <SelectField label="Monthly Salary Range (USD)" value={form.salaryRange} options={SALARY_RANGES.map((r) => r.label)} onSelect={(v: string) => update('salaryRange', v)} colors={colors} />
              {form.salaryRange !== '' && (
                <View style={styles.creditInfo}>
                  <Text style={styles.creditInfoText}>
                    💳 Your credit limit:{' '}
                    <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>
                      ${SALARY_RANGES.find((r) => r.label === form.salaryRange)?.creditLimit ?? 0}/month
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.fields}>
              <InputField label="6-Digit PIN" value={form.pin} onChangeText={(v: string) => update('pin', v.replace(/\D/g,'').slice(0,6))} placeholder="••••••" secureTextEntry keyboardType="numeric" colors={colors} />
              <InputField label="Confirm PIN" value={form.confirmPin} onChangeText={(v: string) => update('confirmPin', v.replace(/\D/g,'').slice(0,6))} placeholder="••••••" secureTextEntry keyboardType="numeric" colors={colors} />
              {form.confirmPin.length === 6 && form.pin !== form.confirmPin && (
                <Text style={styles.pinError}>PINs do not match</Text>
              )}
              <View style={styles.pinNote}>
                <Text style={styles.pinNoteText}>⚠️ Keep your PIN confidential. OK Zimbabwe will never ask for it.</Text>
              </View>
            </View>
          )}

          <Button
            label={step < 3 ? 'Continue →' : 'Submit Application'}
            onPress={handleNext}
            disabled={!canProceed()}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />

          {step === 1 && (
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already registered?{' '}
                <Text style={{ color: colors.primary, fontWeight: FontWeight.semiBold }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Colors = ReturnType<typeof useThemeColors>;

function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, colors }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean; keyboardType?: any; colors: Colors;
}) {
  const s = useMemo(() => StyleSheet.create({
    group: {},
    label: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: colors.dark, marginBottom: 6 },
    input: {
      borderWidth: 1.5, borderColor: colors.borderGray, borderRadius: Radius.md,
      paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md,
      fontSize: FontSize.md, color: colors.dark, backgroundColor: colors.offWhite,
    },
  }), [colors]);
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.midGray}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect, colors }: {
  label: string; value: string; options: string[]; onSelect: (v: string) => void; colors: Colors;
}) {
  const [open, setOpen] = useState(false);
  const s = useMemo(() => StyleSheet.create({
    group: {},
    label: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: colors.dark, marginBottom: 6 },
    select: {
      borderWidth: 1.5, borderColor: colors.borderGray, borderRadius: Radius.md,
      paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.offWhite,
    },
    selectText: { fontSize: FontSize.md, color: colors.dark },
    chevron: { color: colors.midGray, fontSize: FontSize.sm },
    dropdown: {
      borderWidth: 1, borderColor: colors.borderGray, borderRadius: Radius.md,
      marginTop: 4, backgroundColor: colors.cardBg, overflow: 'hidden',
    },
    dropdownItem: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md },
    dropdownItemActive: { backgroundColor: colors.offWhite },
    dropdownText: { fontSize: FontSize.md, color: colors.dark },
  }), [colors]);
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.select} onPress={() => setOpen((o) => !o)}>
        <Text style={[s.selectText, !value && { color: colors.midGray }]}>{value || `Select ${label}`}</Text>
        <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={s.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.dropdownItem, opt === value && s.dropdownItemActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[s.dropdownText, opt === value && { color: colors.primary, fontWeight: FontWeight.semiBold }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.screenBg },
    content: { padding: Spacing.xl, paddingTop: Spacing.lg },
    backBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: c.lightGray,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.xl, alignSelf: 'flex-start',
    },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.xs },
    progressStep: {
      width: 30, height: 30, borderRadius: 15, backgroundColor: c.lightGray,
      alignItems: 'center', justifyContent: 'center', zIndex: 1,
    },
    progressActive: { backgroundColor: c.primary },
    progressDone: { backgroundColor: c.success },
    progressNum: { color: c.midGray, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    progressLine: { height: 2, flex: 1, backgroundColor: c.lightGray },
    progressLineActive: { backgroundColor: c.primary },
    stepLabel: { color: c.midGray, fontSize: FontSize.sm, marginBottom: Spacing.sm },
    title: { fontSize: FontSize.xxl + 4, fontWeight: FontWeight.extraBold, color: c.dark, marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.md, color: c.midGray, marginBottom: Spacing.xl },
    fields: { gap: Spacing.md },
    creditInfo: {
      backgroundColor: c.offWhite, padding: Spacing.md, borderRadius: Radius.md,
      borderLeftWidth: 3, borderLeftColor: c.primary,
    },
    creditInfoText: { color: c.dark, fontSize: FontSize.sm },
    pinError: { color: c.primary, fontSize: FontSize.sm, marginTop: -Spacing.xs },
    pinNote: { backgroundColor: c.offWhite, padding: Spacing.md, borderRadius: Radius.md },
    pinNoteText: { color: c.midGray, fontSize: FontSize.sm, lineHeight: 20 },
    loginLink: { marginTop: Spacing.xl, alignItems: 'center', paddingBottom: Spacing.xl },
    loginText: { color: c.midGray, fontSize: FontSize.md },
  });
}
