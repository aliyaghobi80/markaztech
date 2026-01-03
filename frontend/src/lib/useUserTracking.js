'use client';

import { useEffect, useCallback, useRef } from 'react';
import { WS_ENABLED } from './wsConfig';

class UserTrackingWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
  }

  connect() {
    if (!WS_ENABLED) {
      console.log('🔌 User tracking WebSocket disabled on shared host');
      return;
    }
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8001/ws/user/`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('User tracking WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners(data);
      } catch (error) {
        console.error('Error parsing User tracking WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('User tracking WebSocket disconnected');
      this.stopHeartbeat();
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('User tracking WebSocket error:', error);
    };
  }

  startHeartbeat() {
    // ارسال پیام heartbeat هر 30 ثانیه برای نگه داشتن connection
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
      console.log(`Attempting to reconnect User tracking WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }
}

// Singleton instance
let userTrackingWs = null;

export function useUserTracking(onStatsUpdate) {
  const wsRef = useRef(null);

  const handleMessage = useCallback((data) => {
    if (data.type === 'stats_update' && onStatsUpdate) {
      onStatsUpdate(data.stats);
    }
    
    // Forward all messages to global event system for other components
    window.dispatchEvent(new CustomEvent('userWebSocketMessage', { detail: data }));
  }, [onStatsUpdate]);

  useEffect(() => {
    // استفاده از singleton pattern برای جلوگیری از چند connection
    if (!userTrackingWs) {
      userTrackingWs = new UserTrackingWebSocket();
    }
    
    wsRef.current = userTrackingWs;
    wsRef.current.connect();
    const unsubscribe = wsRef.current.subscribe(handleMessage);
    
    return () => {
      unsubscribe();
      // فقط وقتی component unmount میشه، connection رو نبند
      // چون ممکنه component های دیگه هم ازش استفاده کنن
    };
  }, [handleMessage]);

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userTrackingWs) {
        userTrackingWs.disconnect();
        userTrackingWs = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
