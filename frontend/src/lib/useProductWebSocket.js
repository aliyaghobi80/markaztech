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
    startPolling();
  }, [onUpdate, startPolling]);

  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
      // Always use polling (WebSocket disabled on host)
      startPolling();
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
