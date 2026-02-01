import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Check, Trash2, RefreshCw, Home, User, DollarSign, AlertTriangle } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for notification storage
const notificationStorage = new MMKV({ id: 'haus-notifications' });

// Notification types
export type NotificationType = 'property' | 'price' | 'agency' | 'system' | 'message';

export interface HausNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Storage keys
const NOTIFICATIONS_KEY = 'notifications';
const LAST_FETCH_KEY = 'lastNotificationFetch';

// Notification icons by type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'property':
      return Home;
    case 'price':
      return DollarSign;
    case 'agency':
      return User;
    case 'system':
      return AlertTriangle;
    default:
      return Bell;
  }
};

// Notification colors by type (HAUS brand colors)
const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'property':
      return '#FF6B35'; // HAUS primary orange
    case 'price':
      return '#10B981'; // Success green
    case 'agency':
      return '#3B82F6'; // Info blue
    case 'system':
      return '#F59E0B'; // Warning amber
    default:
      return '#737373'; // Muted gray
  }
};

// Group notifications by time period
const groupNotificationsByTime = (notifications: HausNotification[]) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const today: HausNotification[] = [];
  const earlier: HausNotification[] = [];

  for (const notification of notifications) {
    if (now - notification.timestamp < oneDayMs) {
      today.push(notification);
    } else {
      earlier.push(notification);
    }
  }

  return { today, earlier };
};

// Format timestamp
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
};

// Storage operations
const loadNotifications = (): HausNotification[] => {
  try {
    const data = notificationStorage.getString(NOTIFICATIONS_KEY);
    if (data) {
      return JSON.parse(data) as HausNotification[];
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
  return [];
};

const saveNotifications = (notifications: HausNotification[]) => {
  try {
    notificationStorage.set(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
};

// Add a new notification
export const addNotification = (notification: Omit<HausNotification, 'id' | 'timestamp' | 'read'>) => {
  const notifications = loadNotifications();
  const newNotification: HausNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  return newNotification;
};

// Configure expo-notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<HausNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    loadInitialData();
    setupNotificationListeners();
    checkPermissions();
  }, []);

  const loadInitialData = () => {
    setIsLoading(true);
    const stored = loadNotifications();
    setNotifications(stored);
    setIsLoading(false);
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const setupNotificationListeners = () => {
    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;

      const newNotif: HausNotification = {
        id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: title || 'New Notification',
        body: body || '',
        type: (data?.type as NotificationType) || 'system',
        read: false,
        timestamp: Date.now(),
        data: data as Record<string, unknown>,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveNotifications(updated);
        return updated;
      });
    });

    return () => subscription.remove();
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh - in production this would fetch from server
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notificationStorage.set(LAST_FETCH_KEY, Date.now().toString());
    setIsRefreshing(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== id);
            saveNotifications(updated);
            return updated;
          });
        },
      },
    ]);
  }, []);

  const clearAll = useCallback(() => {
    Alert.alert('Clear All', 'Are you sure you want to delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          setNotifications([]);
          saveNotifications([]);
        },
      },
    ]);
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                // Would need Linking API
              }
            },
          },
        ]
      );
    }
  };

  // Group notifications
  const { today, earlier } = groupNotificationsByTime(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render single notification item
  const NotificationItem = ({ item }: { item: HausNotification }) => {
    const IconComponent = getNotificationIcon(item.type);
    const color = getNotificationColor(item.type);

    return (
      <Pressable
        className={`flex-row p-4 mb-2 mx-2 rounded-xl border ${
          item.read ? 'bg-transparent border-border' : 'bg-muted/20 border-primary/30'
        }`}
        onPress={() => markAsRead(item.id)}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}15` }}
        >
          <IconComponent size={20} strokeWidth={2.5} style={{ color }} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-sm font-semibold flex-1 ${item.read ? 'text-muted-foreground' : 'text-foreground'}`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-muted-foreground ml-2">
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {!item.read && (
          <View className="w-2 h-2 rounded-full bg-primary ml-2 self-center" />
        )}

        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          className="ml-2 self-center p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={16} strokeWidth={2} className="text-muted-foreground" />
        </TouchableOpacity>
      </Pressable>
    );
  };

  // Render section header
  const SectionHeader = ({ title, count }: { title: string; count: number }) => {
    if (count === 0) return null;
    return (
      <View className="px-4 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title} ({count})
        </Text>
      </View>
    );
  };

  // Empty state
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-muted items-center justify-center mb-4">
        <Bell size={32} strokeWidth={2} className="text-muted-foreground" />
      </View>
      <Text className="text-lg font-semibold text-foreground mb-2">No Notifications</Text>
      <Text className="text-sm text-muted-foreground text-center px-8">
        {hasPermission
          ? 'You\'re all caught up! Notifications will appear here.'
          : 'Enable notifications to stay updated on properties and activity.'}
      </Text>
      {!hasPermission && (
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-4 px-6 py-3 bg-primary rounded-full"
        >
          <Text className="text-primary-foreground font-semibold">Enable Notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" className="text-primary" />
          <Text className="text-muted-foreground mt-3">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Bell size={24} strokeWidth={2.5} className="text-foreground mr-3" />
          <Text className="text-xl font-bold text-foreground">Notifications</Text>
          {unreadCount > 0 && (
            <View className="ml-2 px-2 py-0.5 bg-primary rounded-full">
              <Text className="text-xs font-semibold text-primary-foreground">{unreadCount}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} className="p-2">
              <Check size={20} strokeWidth={2} className="text-primary" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} className="p-2">
              <Trash2 size={20} strokeWidth={2} className="text-muted-foreground" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FF6B35"
            />
          }
        >
          {/* Permission banner */}
          {!hasPermission && (
            <View className="mx-4 mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <View className="flex-row items-start">
                <AlertTriangle size={18} strokeWidth={2} className="text-warning mt-0.5 mr-2" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-warning">Notifications Disabled</Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    Enable notifications to receive property updates and alerts
                  </Text>
                </View>
                <TouchableOpacity onPress={requestPermission} className="ml-2 px-3 py-1.5 bg-warning/20 rounded-full">
                  <Text className="text-xs font-semibold text-warning">Enable</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Today's notifications */}
          <SectionHeader title="Today" count={today.length} />
          {today.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}

          {/* Earlier notifications */}
          <SectionHeader title="Earlier" count={earlier.length} />
          {earlier.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// RefreshControl component for pull-to-refresh
const RefreshControl = ({ refreshing, onRefresh, tintColor }: { refreshing: boolean; onRefresh: () => void; tintColor: string }) => {
  return (
    <TouchableOpacity
      onPress={onRefresh}
      disabled={!refreshing}
      className="p-4 items-center"
    >
      {refreshing ? (
        <ActivityIndicator size="small" color={tintColor} />
      ) : (
        <View className="flex-row items-center">
          <RefreshCw size={16} strokeWidth={2} style={{ color: tintColor }} />
          <Text className="text-sm text-muted-foreground ml-2">Pull to refresh</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
