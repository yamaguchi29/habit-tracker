import { useEffect } from 'react';
import { messaging, getToken, onMessage, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const VAPID_KEY = 'BHg5TspBAgbeseytpGb6aSfUyT0tY1vDmostLUSCBPn-D3IEAi9fmJy4Lvm0ggkhmtlVLm6TFLZ1snxMsHdZiSk';

const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('habit_tracker_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('habit_tracker_device_id', deviceId);
  }
  return deviceId;
};

export const requestNotificationPermission = async (userId: string) => {
  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);

    if (permission !== 'granted') {
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (token) {
      console.log('FCM Token取得成功:', token);
      const deviceId = getOrCreateDeviceId();
      await setDoc(doc(db, 'users', userId, 'fcmTokens', deviceId), {
        token,
        deviceId,
        updatedAt: serverTimestamp(),
        platform: 'web'
      });
      return true;
    } else {
      console.warn('FCM Tokenが取得できませんでした。');
      return false;
    }
  } catch (error) {
    console.error('FCM Token取得エラー:', error);
    return false;
  }
};

export function NotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 既に許可されている場合は、バックグラウンドでトークンを同期する（PC等の不具合対策）
    const syncToken = async () => {
      if (Notification.permission === 'granted') {
        await requestNotificationPermission(user.uid);
      }
    };

    syncToken();

    // フォアグラウンド時の通知受信処理
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('フォアグラウンドでメッセージ受信:', payload);
      if (payload.notification) {
        // フォアグラウンドでもシステム通知を出す（オプション）
        new Notification(payload.notification.title || 'リマインダー', {
          body: payload.notification.body,
          icon: '/icon.png'
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}



