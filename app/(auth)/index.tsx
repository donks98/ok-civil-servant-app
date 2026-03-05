import React from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { FontSize, FontWeight, Spacing } from '../../constants/theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#CC0000', '#7A0000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />

      {/* Decorative elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>OK</Text>
        </View>
        <Text style={styles.brandName}>Zimbabwe</Text>
      </View>

      {/* Hero text */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Civil Servant{'\n'}Credit Programme</Text>
        <Text style={styles.heroSub}>
          Shop now. Pay through salary deduction.{'\n'}No cash required at the counter.
        </Text>
      </View>

      {/* Feature pills */}
      <View style={styles.pills}>
        {['Verified Employment', 'Salary Deduction', 'Instant Wallet'].map((p) => (
          <View key={p} style={styles.pill}>
            <Text style={styles.pillText}>✓ {p}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Button
          label="Get Started"
          onPress={() => router.push('/(auth)/register')}
          style={styles.primaryBtn}
        />
        <Button
          label="Sign In"
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
          style={styles.outlineBtn}
          textStyle={{ color: '#FFFFFF' }}
        />
      </View>

      <Text style={styles.footer}>OK Zimbabwe Limited · Civil Servant Programme</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: height * 0.1,
    paddingBottom: Spacing.xl,
  },
  circle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -80,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: 100, left: -60,
  },
  circle3: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)', top: 180, right: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  logoBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#CC0000',
    fontSize: 26,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    opacity: 0.9,
  },
  heroSection: {
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: FontWeight.extraBold,
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  pills: {
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  cta: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
  },
  outlineBtn: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  footer: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
