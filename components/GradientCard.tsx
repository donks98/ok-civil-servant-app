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
  const usedPercent = (wallet.amountUsed / wallet.creditLimit) * 100;

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

      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.cardLabel}>OK Civil Servant Wallet</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.okBadge}>
          <Text style={styles.okText}>OK</Text>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.availableLabel}>Available Credit</Text>
        <Text style={styles.availableAmount}>${wallet.availableCredit.toFixed(2)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.min(usedPercent, 100)}%` as any }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>Used: ${wallet.amountUsed.toFixed(2)}</Text>
          <Text style={styles.progressText}>Limit: ${wallet.creditLimit.toFixed(2)}</Text>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottomRow}>
        <Text style={styles.walletId}>{walletId}</Text>
        <View style={styles.deductionBadge}>
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
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userName: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  okBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  okText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  balanceSection: {
    marginBottom: Spacing.lg,
  },
  availableLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  availableAmount: {
    color: Colors.white,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: Radius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  progressText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  walletId: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },
  deductionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
  deductionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
});
