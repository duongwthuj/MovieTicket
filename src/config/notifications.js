// Expo Go SDK 53 không hỗ trợ expo-notifications
// Dùng in-app notification thay thế

export async function registerForPushNotifications() {
  return null;
}

export async function notifyBookingSuccess(ticket) {
  // Handled by in-app success modal
  return null;
}

export async function scheduleShowtimeReminder(ticket) {
  // Handled by in-app reminder
  return null;
}
