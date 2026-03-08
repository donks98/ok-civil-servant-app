import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Modal, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientRed } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore, ShoppingItem } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ShoppingListScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shoppingList = useAppStore((s) => s.shoppingList);
  const wallet = useAppStore((s) => s.wallet);
  const addShoppingItem = useAppStore((s) => s.addShoppingItem);
  const toggleShoppingItem = useAppStore((s) => s.toggleShoppingItem);
  const removeShoppingItem = useAppStore((s) => s.removeShoppingItem);
  const clearCheckedItems = useAppStore((s) => s.clearCheckedItems);
  const loadShoppingList = useAppStore((s) => s.loadShoppingList);

  const [addVisible, setAddVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  useEffect(() => { loadShoppingList(); }, []);

  const estimatedTotal = shoppingList.reduce((s, i) => s + i.estimatedPrice, 0);
  const checkedTotal = shoppingList.filter((i) => i.checked).reduce((s, i) => s + i.estimatedPrice, 0);
  const uncheckedCount = shoppingList.filter((i) => !i.checked).length;

  const handleAdd = () => {
    const price = parseFloat(itemPrice) || 0;
    if (!itemName.trim()) return;
    addShoppingItem({ name: itemName.trim(), estimatedPrice: price });
    setItemName('');
    setItemPrice('');
    setAddVisible(false);
  };

  const handleClear = () => {
    if (shoppingList.filter((i) => i.checked).length === 0) return;
    Alert.alert('Clear Completed', 'Remove all checked items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCheckedItems },
    ]);
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.listItem}>
      <TouchableOpacity onPress={() => toggleShoppingItem(item.id)} style={styles.checkbox} activeOpacity={0.8}>
        {item.checked ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={colors.midGray} />
        )}
      </TouchableOpacity>
      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.itemPrice, item.checked && styles.itemPriceChecked]}>
        ${item.estimatedPrice.toFixed(2)}
      </Text>
      <TouchableOpacity onPress={() => removeShoppingItem(item.id)} style={styles.removeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={colors.midGray} />
      </TouchableOpacity>
    </View>
  );

  const overBudget = estimatedTotal > wallet.availableCredit;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient colors={[...GradientRed]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <Text style={styles.headerSub}>{uncheckedCount} items remaining</Text>
        </View>
        <TouchableOpacity onPress={handleClear} activeOpacity={0.8}>
          <Text style={styles.clearBtn}>Clear done</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Budget summary */}
      <View style={styles.budgetRow}>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetVal}>${estimatedTotal.toFixed(2)}</Text>
          <Text style={styles.budgetLbl}>Est. Total</Text>
        </View>
        <View style={styles.budgetDivider} />
        <View style={styles.budgetItem}>
          <Text style={[styles.budgetVal, { color: colors.success }]}>${wallet.availableCredit.toFixed(2)}</Text>
          <Text style={styles.budgetLbl}>Available</Text>
        </View>
        <View style={styles.budgetDivider} />
        <View style={styles.budgetItem}>
          <Text style={[styles.budgetVal, overBudget ? { color: colors.primary } : {}]}>
            ${Math.abs(wallet.availableCredit - estimatedTotal).toFixed(2)}
          </Text>
          <Text style={styles.budgetLbl}>{overBudget ? 'Over Budget' : 'Remaining'}</Text>
        </View>
      </View>

      {overBudget && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={16} color={colors.primary} />
          <Text style={styles.warningText}>Estimated total exceeds your available credit</Text>
        </View>
      )}

      {shoppingList.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySub}>Add items to pre-budget your shopping trip</Text>
        </View>
      ) : (
        <FlatList
          data={shoppingList}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.lightGray, marginLeft: 52 }} />}
          ListFooterComponent={
            checkedTotal > 0 ? (
              <View style={styles.checkedSummary}>
                <Ionicons name="checkmark-done" size={14} color={colors.success} />
                <Text style={styles.checkedSummaryText}>${checkedTotal.toFixed(2)} in cart</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)} activeOpacity={0.85}>
        <LinearGradient colors={[...GradientRed]} style={styles.fabGrad}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add item modal */}
      <Modal visible={addVisible} transparent animationType="slide" onRequestClose={() => { Keyboard.dismiss(); setAddVisible(false); }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>Add Item</Text>
                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); setAddVisible(false); setItemName(''); setItemPrice(''); }}>
                      <Ionicons name="close" size={22} color={colors.midGray} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalLbl}>Item name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. Bread, Milk, Sugar"
                    placeholderTextColor={colors.midGray}
                    autoFocus
                    returnKeyType="next"
                  />
                  <Text style={styles.modalLbl}>Estimated price ($)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.midGray}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleAdd}
                  />
                  <View style={styles.modalBtns}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.cancelBtn]}
                      onPress={() => { Keyboard.dismiss(); setAddVisible(false); setItemName(''); setItemPrice(''); }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAdd}>
                      <Text style={styles.confirmText}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
    clearBtn: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    budgetRow: { flexDirection: 'row', backgroundColor: c.cardBg, marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
    budgetItem: { flex: 1, alignItems: 'center' },
    budgetVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    budgetLbl: { fontSize: FontSize.xs, color: c.midGray, marginTop: 2 },
    budgetDivider: { width: 1, backgroundColor: c.lightGray },
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FFF0F0', marginHorizontal: Spacing.md, marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: Radius.md, borderLeftWidth: 3, borderLeftColor: c.primary },
    warningText: { color: c.primary, fontSize: FontSize.xs, fontWeight: FontWeight.medium, flex: 1 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
    emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: c.dark, marginBottom: Spacing.xs },
    emptySub: { color: c.midGray, fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: Spacing.xxl },
    listContent: { paddingTop: Spacing.md, paddingHorizontal: Spacing.md, paddingBottom: 100 },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, backgroundColor: c.cardBg, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
    checkbox: { marginRight: Spacing.sm },
    itemName: { flex: 1, fontSize: FontSize.md, color: c.dark, fontWeight: FontWeight.medium },
    itemNameChecked: { textDecorationLine: 'line-through', color: c.midGray },
    itemPrice: { fontSize: FontSize.md, color: c.dark, fontWeight: FontWeight.semiBold, marginRight: Spacing.sm },
    itemPriceChecked: { color: c.midGray },
    removeBtn: { padding: Spacing.xs },
    checkedSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, justifyContent: 'center', paddingVertical: Spacing.md },
    checkedSummaryText: { color: c.success, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
    fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, borderRadius: 28, overflow: 'hidden', ...Shadow.lg },
    fabGrad: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
    modalCard: { backgroundColor: c.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: Spacing.xxl },
    modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: c.dark },
    modalLbl: { fontSize: FontSize.sm, color: c.midGray, marginBottom: Spacing.xs, fontWeight: FontWeight.medium },
    modalInput: { borderWidth: 1.5, borderColor: c.borderGray, borderRadius: Radius.md, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: c.dark, marginBottom: Spacing.md, backgroundColor: c.offWhite },
    modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
    modalBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: c.lightGray },
    confirmBtn: { backgroundColor: c.primary },
    cancelText: { color: c.dark, fontWeight: FontWeight.semiBold },
    confirmText: { color: '#FFFFFF', fontWeight: FontWeight.bold },
  });
}
