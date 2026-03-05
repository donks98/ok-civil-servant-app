import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QRPayload {
  walletId: string;
  name: string;
  available: number;
  ts: number;
}

export function useOfflineQR(livePayload: string) {
  const [cachedPayload, setCachedPayload] = useState<string>(livePayload);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Cache the live payload whenever it changes
    AsyncStorage.setItem('cached_qr', livePayload).catch(() => {});
  }, [livePayload]);

  useEffect(() => {
    // Try to load cached version as fallback
    AsyncStorage.getItem('cached_qr').then((cached) => {
      if (cached) setCachedPayload(cached);
    }).catch(() => {});
  }, []);

  return { qrData: isOffline ? cachedPayload : livePayload, isOffline, setIsOffline };
}
