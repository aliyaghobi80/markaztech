'use client';

class GlobalWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.isConnecting = false;
  }

  connect() {
    // 🚨 cPanel از WebSocket پشتیبانی نمی‌کند - غیرفعال شده
    console.log('🔌 WebSocket disabled - cPanel does not support WebSocket connections');
    this.isConnecting = false;
    return;
    
    this.ws.onopen = () => {
      console.log('✅ Global WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Global WebSocket message:', data);
        this.notifyListeners(data);
      } catch (error) {
        console.error('❌ Error parsing Global WebSocket message:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('🔌 Global WebSocket disconnected', event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      // فقط اگر اتصال غیرعادی بسته شده باشد، دوباره تلاش کن
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ Global WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect Global WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting Global WebSocket');
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(id, callback) {
    console.log('📝 WebSocket subscription disabled (cPanel limitation):', id);
    this.listeners.set(id, callback);
    
    // WebSocket disabled - just return unsubscribe function
    return () => {
      console.log('📝 Unsubscribing from disabled WebSocket:', id);
      this.listeners.delete(id);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback, id) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in WebSocket listener ${id}:`, error);
      }
    });
  }

  getConnectionCount() {
    return this.listeners.size;
  }
}

// Singleton instance
export const globalWebSocket = new GlobalWebSocket();

// Hook for using the global WebSocket (now uses polling)
export function useGlobalWebSocket(id, callback) {
  const { useEffect, useCallback } = require('react');
  
  const handleMessage = useCallback((data) => {
    if (callback) {
      callback(data);
    }
  }, [callback]);

  useEffect(() => {
    // Import polling service dynamically to avoid SSR issues
    import('./pollingService').then(({ pollingService }) => {
      const unsubscribe = pollingService.subscribe(id, handleMessage);
      return unsubscribe;
    });
  }, [id, handleMessage]);
}