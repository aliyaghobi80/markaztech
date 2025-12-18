'use client';

import { useEffect, useCallback } from 'react';
import { orderWs } from './websocket';

export function useOrderWebSocket(onUpdate) {
  const handleMessage = useCallback((data) => {
    if (data.type === 'order_update' || data.type === 'order_delete') {
      onUpdate(data);
    }
  }, [onUpdate]);

  useEffect(() => {
    orderWs.connect();
    const unsubscribe = orderWs.subscribe(handleMessage);
    
    return () => {
      unsubscribe();
    };
  }, [handleMessage]);
}