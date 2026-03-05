import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
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
  const [completedSteps, setCompletedSteps] = useState(0);
  const verifyEmployment = useAppStore((s) => s.verifyEmployment);
  const user = useAppStore((s) => s.user);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start spin
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();

    // Step reveals
    STEPS.forEach((step, i) => {
      setTimeout(() => setCompletedSteps(i + 1), step.delay);
    });

    // Auto-navigate
    const run = async () => {
      await verifyEmployment();
      router.replace('/(tabs)');
    };
    run();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const allDone = completedSteps >= STEPS.length;

  return (
    <LinearGradient colors={['#CC0000', '#7A0000']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>OK</Text>
      </View>

      <Text style={styles.title}>{allDone ? 'All Set!' : 'Verifying Your Employment'}</Text>
      <Text style={styles.subtitle}>
        {allDone
          ? `Welcome, ${user?.name}! Your wallet is ready.`
          : 'Please wait while we verify your details...'}
      </Text>

      {/* Spinner */}
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

      {/* Checklist */}
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
          <Text style={styles.creditCardAmount}>${user?.creditLimit?.toFixed(2) ?? '120.00'}</Text>
          <Text style={styles.creditCardSub}>per month · salary deduction</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  logoBox: {
    width: 64, height: 64, backgroundColor: '#FFFFFF',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  logoText: { color: '#CC0000', fontSize: 28, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: FontSize.xxl + 2, fontWeight: FontWeight.extraBold, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl },
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
