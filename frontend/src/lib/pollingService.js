'use client';

import api from './axios';

class PollingService {
  constructor() {
    this.intervals = new Map();
    this.listeners = new Map();
    this.isActive = false;
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    console.log('🔄 Starting polling service (WebSocket alternative)');

    // Poll for site stats every 10 seconds
    this.addPolling('site-stats', async () => {
      try {
        // Mock data for frontend-only mode
        const mockStats = {
          total_visits: Math.floor(Math.random() * 10000) + 5000,
          today_visits: Math.floor(Math.random() * 500) + 100,
          online_users: Math.floor(Math.random() * 50) + 10,
          total_satisfied_customers: Math.floor(Math.random() * 1000) + 500,
          satisfaction_rate: 95.5 + Math.random() * 4,
          total_votes: Math.floor(Math.random() * 1200) + 600
        };
        
        this.notifyListeners('site-stats', {
          type: 'site_stats_update',
          data: mockStats
        });
      } catch (error) {
        console.log('Site stats polling (frontend-only mode)');
      }
    }, 10000);

    // Poll for wallet updates every 5 seconds (for logged in users)
    this.addPolling('wallet-updates', async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Mock wallet data for frontend-only mode
        const mockWallet = {
          wallet_balance: Math.floor(Math.random() * 100000) + 50000
        };
        
        this.notifyListeners('wallet-updates', {
          type: 'wallet_update',
          balance: mockWallet.wallet_balance
        });
      } catch (error) {
        console.log('Wallet polling (frontend-only mode)');
      }
    }, 5000);

    // Poll for admin notifications every 3 seconds (for admin users)
    this.addPolling('admin-notifications', async () => {
      try {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) return;

        // Mock admin data for frontend-only mode
        const mockAdminData = {
          new_orders: Math.floor(Math.random() * 5),
          new_tickets: Math.floor(Math.random() * 3)
        };

        this.notifyListeners('admin-notifications', {
          type: 'admin_update',
          new_orders: mockAdminData.new_orders,
          new_tickets: mockAdminData.new_tickets
        });
      } catch (error) {
        console.log('Admin polling (frontend-only mode)');
      }
    }, 3000);
  }

  stop() {
    console.log('🛑 Stopping polling service');
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    this.isActive = false;
  }

  addPolling(id, callback, interval) {
    if (this.intervals.has(id)) {
      clearInterval(this.intervals.get(id));
    }
    
    const intervalId = setInterval(callback, interval);
    this.intervals.set(id, intervalId);
    
    // Run immediately with error handling
    try {
      callback();
    } catch (error) {
      console.log('Polling callback error (expected in frontend-only mode):', error.message);
    }
  }

  subscribe(id, callback) {
    console.log('📝 Subscribing to polling service:', id);
    this.listeners.set(id, callback);
    
    // Start polling when first subscriber joins
    if (this.listeners.size === 1) {
      this.start();
    }
    
    return () => {
      console.log('📝 Unsubscribing from polling service:', id);
      this.listeners.delete(id);
      
      // Stop polling when no subscribers left
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  notifyListeners(type, data) {
    this.listeners.forEach((callback, id) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in polling listener ${id}:`, error);
      }
    });
  }
}

// Singleton instance
export const pollingService = new PollingService();

// Hook for using the polling service
export function usePollingService(id, callback) {
  const { useEffect, useCallback } = require('react');
  
  const handleMessage = useCallback((data) => {
    if (callback) {
      callback(data);
    }
  }, [callback]);

  useEffect(() => {
    const unsubscribe = pollingService.subscribe(id, handleMessage);
    return unsubscribe;
  }, [id, handleMessage]);
}