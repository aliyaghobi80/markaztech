// مسیر: src/components/AdminOnlineStatus.jsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

export default function AdminOnlineStatus() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔍 AdminOnlineStatus - User:', user);
    console.log('🔍 AdminOnlineStatus - Loading:', loading);
    
    const isAdmin = user?.role === 'ADMIN' || user?.is_staff || user?.is_superuser;
    console.log('🔍 AdminOnlineStatus - Is Admin:', isAdmin);
    
    if (!loading && user && isAdmin) {
      console.log('✅ AdminOnlineStatus - Setting up admin online status');
      
      const updateOnlineStatus = async (isOnline) => {
        try {
          console.log(`🔄 Updating admin status to: ${isOnline ? 'online' : 'offline'}`);
          await api.post('/chat/admin-status/update_status/', {
            is_online: isOnline
          });
          console.log(`✅ Admin status updated: ${isOnline ? 'online' : 'offline'}`);
        } catch (error) {
          console.error('❌ Error updating admin status:', error);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
        }
      };

      // تنظیم آنلاین در شروع
      updateOnlineStatus(true);

      // تنظیم آفلاین در خروج
      const handleBeforeUnload = () => {
        console.log('🔄 Page unloading - setting admin offline');
        // Use sendBeacon for more reliable offline status update
        const data = JSON.stringify({ is_online: false });
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          navigator.sendBeacon('http://localhost:8001/api/chat/admin-status/update_status/', data);
        }
      };

      const handleVisibilityChange = () => {
        console.log('🔄 Visibility changed:', document.visibilityState);
        if (document.visibilityState === 'hidden') {
          updateOnlineStatus(false);
        } else {
          updateOnlineStatus(true);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        console.log('🔄 AdminOnlineStatus cleanup - setting offline');
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        updateOnlineStatus(false);
      };
    } else {
      console.log('⚠️ AdminOnlineStatus - Not setting up (loading:', loading, ', user:', !!user, ', isAdmin:', isAdmin, ')');
    }
  }, [user, loading]);

  // This component doesn't render anything
  return null;
}