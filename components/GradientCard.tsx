import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GradientRed } from '../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { WalletState } from '../data/mockData';

interface GradientCardProps {
  wallet: WalletState;
  userName: string;
  walletId: string;
}

export function GradientCard({ wallet, userName, walletId }: GradientCardProps) {
  const usedPercent = Math.min((wallet.amountUsed / wallet.creditLimit) * 100, 100);
  // Format wallet ID as card-number style: last 8 chars in groups of 4
  const raw = walletId.replace(/\D/g, '').padStart(8, '0').slice(-8);
  const maskedNum = `•••• •••• ${raw.slice(0, 4)} ${raw.slice(4)}`;

  return (
    <LinearGradient
      colors={[...GradientRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Top row: label + OK logo */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.cardLabel}>CIVIL SERVANT WALLET</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.okBadge}>
          <Text style={styles.okText}>OK</Text>
        </View>
      </View>

      {/* Available credit (hero number) */}
      <View style={styles.balanceSection}>
        <Text style={styles.availableLabel}>Available Credit</Text>
        <Text style={styles.availableAmount}>${wallet.availableCredit.toFixed(2)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${usedPercent}%` as any }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>{usedPercent.toFixed(0)}% utilised</Text>
          <Text style={styles.progressText}>${wallet.amountUsed.toFixed(2)} of ${wallet.creditLimit.toFixed(0)}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row: masked number + deduction badge */}
      <View style={styles.bottomRow}>
        <Text style={styles.maskedNum}>{maskedNum}</Text>
        <View style={styles.deductionBadge}>
          <View style={styles.deductionDot} />
          <Text style={styles.deductionText}>Salary Deduction</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    overflow: 'hidden',
    ...Shadow.lg,
    shadowColor: '#CC0000',
    shadowOpacity: 0.35,
  },
  circle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -90,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 40,
    right: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  userName: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extraBold,
  },
  okBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  okText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  balanceSection: {
    marginBottom: Spacing.md,
  },
  availableLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  availableAmount: {
    color: Colors.white,
    fontSize: 38,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -1,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  progressText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maskedNum: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FontSize.sm,
    letterSpacing: 1,
    fontWeight: FontWeight.medium,
  },
  deductionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  deductionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  deductionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
});
