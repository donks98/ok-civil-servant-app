import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform, useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LoginScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);

  useEffect(() => {
    AsyncStorage.getItem('saved_phone').then((saved) => {
      if (saved) {
        setPhone(saved);
        setStep('pin');
      }
    });
  }, []);

  const colorScheme = useAppStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || (colorScheme === 'auto' && systemScheme === 'dark');

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
    } else if (key !== '' && pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 6) handleLogin(newPin);
    }
  };

  const handleLogin = async (finalPin: string) => {
    setLoading(true);
    const success = await login(phone, finalPin);
    setLoading(false);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Invalid phone number or PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.screenBg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>OK</Text>
            </View>
          </View>

          <Text style={styles.title}>{step === 'phone' ? 'Welcome Back' : 'Enter Your PIN'}</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your registered mobile number'
              : `Signing in as ${phone}`}
          </Text>
          {step === 'pin' && (
            <TouchableOpacity onPress={() => { setStep('phone'); setPin(''); }} style={styles.changePhoneLink}>
              <Text style={styles.changePhoneText}>Not you? <Text style={{ color: colors.primary }}>Change number</Text></Text>
            </TouchableOpacity>
          )}

          {step === 'phone' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.flag}>🇿🇼 +263</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="77 000 0000"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={12}
                    placeholderTextColor={colors.midGray}
                  />
                </View>
              </View>
              <Button
                label="Continue"
                onPress={() => { if (phone.length >= 9) setStep('pin'); }}
                disabled={phone.length < 9}
                style={{ marginTop: Spacing.lg }}
              />
            </>
          ) : (
            <>
              <View style={styles.pinDots}>
                {[0,1,2,3,4,5].map((i) => (
                  <View
                    key={i}
                    style={[styles.dot, { backgroundColor: i < pin.length ? colors.primary : colors.lightGray }]}
                  />
                ))}
              </View>

              <View style={styles.keypad}>
                {KEYS.map((key, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.key, key === '' && { opacity: 0 }]}
                    onPress={() => handleKeyPress(key)}
                    disabled={key === ''}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.keyText, key === '⌫' && { color: colors.midGray }]}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {loading && <Text style={styles.loadingText}>Signing in...</Text>}

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: FontWeight.semiBold }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.screenBg },
    content: { padding: Spacing.xl, paddingTop: Spacing.lg, minHeight: '100%' },
    backBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: c.lightGray,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: Spacing.xl, alignSelf: 'flex-start',
    },
    logoRow: { marginBottom: Spacing.xl },
    logoBox: {
      width: 56, height: 56, backgroundColor: c.primary,
      borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    },
    logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
    title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extraBold, color: c.dark, marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.md, color: c.midGray, marginBottom: Spacing.xl },
    inputGroup: { marginBottom: Spacing.sm },
    inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: c.dark, marginBottom: Spacing.xs },
    inputWrapper: {
      flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
      borderColor: c.borderGray, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, backgroundColor: c.offWhite,
    },
    flag: { fontSize: FontSize.md, marginRight: Spacing.sm, color: c.dark },
    input: { flex: 1, paddingVertical: Spacing.sm + 4, fontSize: FontSize.md, color: c.dark },
    pinDots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
    dot: { width: 16, height: 16, borderRadius: 8 },
    keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
    key: {
      width: 80, height: 80, borderRadius: 40,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: c.offWhite, ...Shadow.sm,
    },
    keyText: { fontSize: FontSize.xxl, fontWeight: FontWeight.medium, color: c.dark },
    loadingText: { textAlign: 'center', color: c.midGray, marginTop: Spacing.lg },
    registerLink: { marginTop: Spacing.xl, alignItems: 'center' },
    registerText: { color: c.midGray, fontSize: FontSize.md },
    changePhoneLink: { alignSelf: 'center', marginTop: -Spacing.md, marginBottom: Spacing.md },
    changePhoneText: { color: c.midGray, fontSize: FontSize.sm },
  });
}
