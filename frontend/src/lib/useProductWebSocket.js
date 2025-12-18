'use client';

import { useEffect, useCallback } from 'react';
import { productWs } from './websocket';

export function useProductWebSocket(onUpdate) {
  const handleMessage = useCallback((data) => {
    if (data.type === 'product_update' || data.type === 'product_delete') {
      onUpdate(data);
    }
  }, [onUpdate]);

  useEffect(() => {
    productWs.connect();
    const unsubscribe = productWs.subscribe(handleMessage);
    
    return () => {
      unsubscribe();
    };
  }, [handleMessage]);
}
