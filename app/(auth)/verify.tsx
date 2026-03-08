import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
  { label: 'Submitting application', delay: 600 },
  { label: 'Verifying National ID', delay: 1200 },
  { label: 'Confirming employment records', delay: 1900 },
  { label: 'Assessing salary grade', delay: 2500 },
  { label: 'Calculating credit limit', delay: 3100 },
  { label: 'Activating wallet', delay: 3700 },
];

export default function VerifyScreen() {
  const [phase, setPhase] = useState<'otp' | 'loading'>('otp');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  const verifyOtp = useAppStore((s) => s.verifyOtp);
  const verifyEmployment = useAppStore((s) => s.verifyEmployment);
  const user = useAppStore((s) => s.user);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) return;
    setSubmitting(true);
    const ok = await verifyOtp(otp);
    setSubmitting(false);
    if (ok) {
      setPhase('loading');
    } else {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect or has expired. Please try again.');
      setOtp('');
    }
  };

  useEffect(() => {
    if (phase !== 'loading') return;

    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();

    STEPS.forEach((step, i) => {
      setTimeout(() => setCompletedSteps(i + 1), step.delay);
    });

    const run = async () => {
      await verifyEmployment();
      router.replace('/(auth)/direct-debit-setup');
    };
    run();
  }, [phase]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const allDone = completedSteps >= STEPS.length;

  if (phase === 'otp') {
    return (
      <LinearGradient colors={['#CC0000', '#7A0000']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#CC0000" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.otpInner}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>OK</Text>
          </View>

          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your phone.{'\n'}
            (Check the backend console if using sandbox)
          </Text>

          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="rgba(255,255,255,0.4)"
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.otpBtn, (otp.length !== 6 || submitting) && { opacity: 0.5 }]}
            onPress={handleOtpSubmit}
            disabled={otp.length !== 6 || submitting}
          >
            <Text style={styles.otpBtnText}>{submitting ? 'Verifying...' : 'Verify Code'}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#CC0000', '#7A0000']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>OK</Text>
      </View>

      <Text style={styles.title}>{allDone ? 'All Set!' : 'Verifying Your Employment'}</Text>
      <Text style={styles.subtitle}>
        {allDone
          ? `Welcome, ${user?.name}! One last step — set up direct debit.`
          : 'Please wait while we verify your details...'}
      </Text>

      {!allDone && (
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
      )}

      {allDone && (
        <View style={styles.successCircle}>
          <Text style={styles.successTick}>✓</Text>
        </View>
      )}

      <View style={styles.checklist}>
        {STEPS.map((step, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps;
          return (
            <View key={i} style={styles.checkItem}>
              <View style={[styles.checkDot, done && styles.checkDotDone, active && styles.checkDotActive]}>
                {done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>{step.label}</Text>
            </View>
          );
        })}
      </View>

      {allDone && (
        <View style={styles.creditCard}>
          <Text style={styles.creditCardLabel}>Credit Limit Approved</Text>
          <Text style={styles.creditCardAmount}>${user?.creditLimit?.toFixed(2) ?? '0.00'}</Text>
          <Text style={styles.creditCardSub}>per month · salary deduction</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  otpInner: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  logoBox: {
    width: 64, height: 64, backgroundColor: '#FFFFFF',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  logoText: { color: '#CC0000', fontSize: 28, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: FontSize.xxl + 2, fontWeight: FontWeight.extraBold, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl },
  otpInput: {
    width: 200, borderBottomWidth: 2, borderColor: '#FFFFFF',
    color: '#FFFFFF', fontSize: 32, fontWeight: FontWeight.bold,
    letterSpacing: 8, paddingVertical: Spacing.sm, marginBottom: Spacing.xl,
  },
  otpBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl * 2,
  },
  otpBtnText: { color: '#CC0000', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  spinner: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#FFFFFF', marginBottom: Spacing.xl,
  },
  spinnerInner: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'transparent',
    top: 4, left: 4,
  },
  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#00843D',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  successTick: { color: '#FFFFFF', fontSize: 32, fontWeight: FontWeight.bold },
  checklist: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  checkDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkDotDone: { backgroundColor: '#00843D' },
  checkDotActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: FontWeight.bold },
  checkLabel: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm },
  checkLabelDone: { color: '#FFFFFF', fontWeight: FontWeight.medium },
  creditCard: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: Spacing.lg,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  creditCardLabel: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginBottom: Spacing.xs },
  creditCardAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: FontWeight.extraBold },
  creditCardSub: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, marginTop: Spacing.xs },
});
