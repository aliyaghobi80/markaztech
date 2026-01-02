'use client';

import { useEffect, useCallback, useRef } from 'react';
import { productWs } from './websocket';
import api from './axios';

export function useProductWebSocket(onUpdate) {
  const pollTimerRef = useRef(null);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) {
      return;
    }
    console.log('Product WebSocket fallback -> polling mode');
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        const items = Array.isArray(res.data?.results) ? res.data.results : (res.data || []);
        onUpdate?.({ type: 'poll', products: items });
      } catch (err) {
        console.warn('Polling products failed', err?.message);
      }
    };
    fetchProducts();
    pollTimerRef.current = setInterval(fetchProducts, 20000);
  }, [onUpdate]);

  const handleMessage = useCallback((data) => {
    if (data?.type === 'fallback') {
      startPolling();
      return;
    }
    if (data.type === 'product_update' || data.type === 'product_delete') {
      onUpdate?.(data);
    }
  }, [onUpdate, startPolling]);

  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
      try {
        const res = await api.get('/health/realtime/');
        if (res.data?.realtime && res.data.realtime !== 'websocket') {
          startPolling();
          return;
        }
      } catch (err) {
        console.warn('Realtime health check failed, trying WebSocket', err?.message);
      }

      productWs.connect();
      unsubscribe = productWs.subscribe(handleMessage);
    };

    init();
    
    return () => {
      unsubscribe();
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [handleMessage]);
}
