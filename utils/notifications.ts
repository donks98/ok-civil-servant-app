import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDeductionReminder(deductionDate: string, amount: number) {
  try {
    const date = new Date(deductionDate);
    date.setDate(date.getDate() - 3);
    date.setHours(9, 0, 0, 0);
    if (date > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💳 Upcoming Salary Deduction',
          body: `$${amount.toFixed(2)} will be deducted from your salary on ${new Date(deductionDate).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long' })}.`,
          data: { type: 'deduction' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  } catch (_) {}
}

export async function sendTransactionNotification(storeName: string, amount: number, remaining: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Purchase Confirmed',
        body: `$${amount.toFixed(2)} at ${storeName}. $${remaining.toFixed(2)} remaining this month.`,
        data: { type: 'transaction' },
      },
      trigger: null,
    });
  } catch (_) {}
}

export async function sendLowBalanceAlert(available: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Low Credit Balance',
        body: `You have $${available.toFixed(2)} remaining in your civil servant credit this month.`,
        data: { type: 'low_balance' },
      },
      trigger: null,
    });
  } catch (_) {}
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
