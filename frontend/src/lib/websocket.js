import { WS_ENABLED } from "./wsConfig";

class ProductWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.fallback = true; // WebSocket disabled on host
  }

  connect() {
    // WebSockets disabled; always fallback
    this.triggerFallback();
  }

  attemptReconnect() {
    this.triggerFallback();
  }

  disconnect() {
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

  triggerFallback() {
    if (this.fallback) return;
    console.log('Switching to polling fallback for products');
    this.fallback = true;
    this.notifyListeners({ type: 'fallback', mode: 'polling' });
    this.disconnect();
  }
}

class OrderWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (!WS_ENABLED) {
      console.log('🔌 Order WebSocket disabled on shared host');
      return;
    }
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws/orders/`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('Order WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners(data);
      } catch (error) {
        console.error('Error parsing Order WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Order WebSocket disconnected');
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('Order WebSocket error:', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect Order WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
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

export const productWs = new ProductWebSocket();
export const orderWs = new OrderWebSocket();
