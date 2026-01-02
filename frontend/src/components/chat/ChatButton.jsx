// مسیر: src/components/chat/ChatButton.jsx
"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ChatWindow from "./ChatWindow";
import api from "@/lib/axios";

export default function ChatButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // دریافت وضعیت آنلاین ادمین‌ها
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        console.log('🔄 Fetching admin status...');
        const response = await api.get('/chat/admin-status/');
        const admins = response.data || [];
        console.log('📊 Admin status response:', admins);
        
        const onlineAdminsFiltered = admins.filter(admin => admin.is_online);
        console.log('✅ Online admins:', onlineAdminsFiltered.length);
        
        setOnlineAdmins(onlineAdminsFiltered);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching admin status:', error);
        setLoading(false);
      }
    };

    fetchAdminStatus();
    const interval = setInterval(fetchAdminStatus, 30000); // هر 30 ثانیه
    return () => clearInterval(interval);
  }, []);

  // دریافت تعداد پیام‌های خوانده نشده
  useEffect(() => {
    if (user && localStorage.getItem('accessToken')) {
      const fetchUnreadCount = async () => {
        try {
          const response = await api.get('/chat/rooms/');
          const rooms = response.data || [];
          const totalUnread = rooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
          setUnreadCount(totalUnread);
        } catch (error) {
          console.error('Error fetching unread count:', error);
          // If we get 401, the user is not properly authenticated
          if (error.response?.status === 401) {
            setUnreadCount(0);
          }
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000); // هر 10 ثانیه
      return () => clearInterval(interval);
    }
  }, [user]);

  const hasOnlineAdmins = onlineAdmins.length > 0;
  const onlineAdminCount = onlineAdmins.length;

  return (
    <>
      {/* دکمه چت شناور */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              hasOnlineAdmins 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
            } text-white flex items-center justify-center group`}
            title={
              hasOnlineAdmins 
                ? `چت با پشتیبانی (${onlineAdminCount} ادمین آنلاین)` 
                : "چت با پشتیبانی (آفلاین - پاسخ تا چند ساعت)"
            }
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <>
                <MessageCircle className="w-6 h-6" />
                {/* نقطه سبز برای نشان دادن آنلاین بودن */}
                {hasOnlineAdmins && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                )}
                {/* بج تعداد پیام‌های خوانده نشده */}
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </>
            )}
          </button>

          {/* نمایش تعداد ادمین‌های آنلاین */}
          {!isOpen && hasOnlineAdmins && (
            <div className="absolute -top-16 right-0 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3" />
                {onlineAdminCount} ادمین آنلاین
              </div>
              <div className="flex items-center gap-1">
                {onlineAdmins.slice(0, 2).map((admin, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {admin.admin_avatar ? (
                      <img 
                        src={admin.admin_avatar} 
                        alt={admin.admin_name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs">
                        {admin.admin_name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs">{admin.admin_name.split(' ')[0]}</span>
                    {index < Math.min(onlineAdmins.length, 2) - 1 && <span className="text-xs">،</span>}
                  </div>
                ))}
                {onlineAdmins.length > 2 && (
                  <span className="text-xs">و {onlineAdmins.length - 2} نفر دیگر</span>
                )}
              </div>
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
            </div>
          )}

          {/* نمایش وضعیت آفلاین */}
          {!isOpen && !hasOnlineAdmins && !loading && (
            <div className="absolute -top-12 right-0 bg-gray-600 text-white px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              پشتیبانی آفلاین
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* پنجره چت */}
      {isOpen && (
        <ChatWindow 
          onClose={() => setIsOpen(false)} 
          onlineAdmins={onlineAdmins}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </>
  );
}