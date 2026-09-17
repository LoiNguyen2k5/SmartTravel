export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CSKH_REPLY' | 'BOOKING' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
  replyContent?: string;
  sender?: string;
}

const STORAGE_PREFIX = 'smarttravel_notifications_';

export const notificationService = {
  getStorageKey: (userEmail?: string): string => {
    const email = userEmail || localStorage.getItem('user_email') || 'default_user';
    return `${STORAGE_PREFIX}${email}`;
  },

  getNotifications: (userEmail?: string): NotificationItem[] => {
    const key = notificationService.getStorageKey(userEmail);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: NotificationItem[] = JSON.parse(raw);
        // Tự động dọn dẹp thông báo mock cskh ban đầu nếu có
        const cleaned = parsed.filter((n) => n.id !== 'notif-cskh-1');
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch (e) {
      console.error('Error reading notifications:', e);
    }

    // Default seeded notifications: Chỉ có duy nhất 1 thông báo chào mừng
    const initial: NotificationItem[] = [
      {
        id: 'notif-system-welcome',
        title: '✨ Chào mừng bạn đến với Smart Travel',
        message: 'Khám phá hàng trăm tour du lịch chất lượng cao và tận hưởng các ưu đãi đặt vé tiện lợi.',
        type: 'SYSTEM',
        createdAt: 'Hôm nay',
        isRead: false,
      },
    ];
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch (e) { /* ignore */ }
    return initial;
  },

  addNotification: (
    item: { title: string; message: string; type?: 'CSKH_REPLY' | 'BOOKING' | 'SYSTEM'; replyContent?: string; sender?: string },
    userEmail?: string
  ): NotificationItem => {
    const key = notificationService.getStorageKey(userEmail);
    const current = notificationService.getNotifications(userEmail);
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: item.title,
      message: item.message,
      type: item.type || 'CSKH_REPLY',
      replyContent: item.replyContent,
      sender: item.sender || 'CSKH Smart Travel',
      createdAt: 'Vừa xong',
      isRead: false,
    };
    const updated = [newNotif, ...current];
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('smarttravel_notification_updated'));
    } catch (e) {
      console.error('Error saving notification:', e);
    }
    return newNotif;
  },

  markAsRead: (id: string, userEmail?: string) => {
    const key = notificationService.getStorageKey(userEmail);
    const current = notificationService.getNotifications(userEmail);
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('smarttravel_notification_updated'));
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  },

  markAllAsRead: (userEmail?: string) => {
    const key = notificationService.getStorageKey(userEmail);
    const current = notificationService.getNotifications(userEmail);
    const updated = current.map((n) => ({ ...n, isRead: true }));
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('smarttravel_notification_updated'));
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  },

  deleteNotification: (id: string, userEmail?: string) => {
    const key = notificationService.getStorageKey(userEmail);
    const current = notificationService.getNotifications(userEmail);
    const updated = current.filter((n) => n.id !== id);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('smarttravel_notification_updated'));
    } catch (e) {
      console.error('Error deleting notification:', e);
    }
  },
};
