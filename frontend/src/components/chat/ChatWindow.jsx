// مسیر: src/components/chat/ChatWindow.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, User, Phone, MessageCircle, Image, Mic, Paperclip, Play, Pause } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { WS_ENABLED } from "@/lib/wsConfig";

export default function ChatWindow({ onClose, onlineAdmins, onUnreadCountChange }) {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState(null);
  const [guestPhone, setGuestPhone] = useState("");
  const [guestSession, setGuestSession] = useState(null); // Store guest session info
  const [wsConnected, setWsConnected] = useState(false);
  const [adminRooms, setAdminRooms] = useState([]); // For admin: list of all chat rooms
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Load guest session from localStorage on component mount
  useEffect(() => {
    const savedGuestSession = localStorage.getItem('guestChatSession');
    if (savedGuestSession) {
      try {
        const session = JSON.parse(savedGuestSession);
        setGuestSession(session);
        setGuestPhone(session.phone);
        setRoom({ id: session.roomId });
        console.log('🔄 Restored guest session:', session);
        
        // Load messages for the restored session
        if (session.roomId) {
          loadGuestMessages(session.roomId);
          connectWebSocket(session.roomId);
        }
      } catch (error) {
        console.error('Error loading guest session:', error);
        localStorage.removeItem('guestChatSession');
      }
    }
  }, []);

  // Load messages for guest session
  const loadGuestMessages = async (roomId) => {
    try {
      setLoading(true);
      const messagesResponse = await api.get(`/chat/rooms/${roomId}/messages/`);
      setMessages(messagesResponse.data);
      console.log('✅ Guest messages loaded:', messagesResponse.data.length);
    } catch (error) {
      console.error('Error loading guest messages:', error);
      // If room doesn't exist anymore, clear the session
      if (error.response?.status === 404) {
        localStorage.removeItem('guestChatSession');
        setGuestSession(null);
        setRoom(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update admin status based on auth state
  useEffect(() => {
    if (!authLoading && user) {
      const userIsAdmin = user.is_staff || user.role === 'ADMIN';
      setIsAdmin(userIsAdmin);
      console.log('👤 User role updated:', { isAdmin: userIsAdmin, user: user.full_name || user.mobile });
    } else if (!authLoading) {
      setIsAdmin(false);
    }
  }, [user, authLoading]);

  // اسکرول به پایین پیام‌ها
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.chat-messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // فقط زمانی اسکرول کن که پیام‌ها تغییر کنند
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages]);

  // ایجاد یا دریافت اتاق چت
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }
    
    // Initialize chat for authenticated users
    if (user && user.id && localStorage.getItem('accessToken')) {
      console.log('🔄 User authenticated, initializing chat...');
      console.log('👤 User is admin:', user.is_staff || user.role === 'ADMIN');
      
      // Add a small delay to ensure authentication is properly set up
      const timer = setTimeout(() => {
        if (user.is_staff || user.role === 'ADMIN') {
          initializeAdminChat();
        } else {
          initializeChat();
        }
      }, 100);
      return () => clearTimeout(timer);
    } 
    // For guests, we don't need to initialize anything - they can directly send messages
    else if (!user) {
      console.log('👤 Guest user - ready to send messages');
    } 
    else {
      console.log('⚠️ User not authenticated or missing token:', {
        authLoading,
        user: !!user,
        userId: user?.id,
        hasToken: !!localStorage.getItem('accessToken')
      });
    }
  }, [user, authLoading]);

  const initializeAdminChat = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing admin chat...');
      
      // Double-check authentication
      if (!user || !user.id || !localStorage.getItem('accessToken')) {
        console.error('❌ Admin not authenticated');
        toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }
      
      // Get all chat rooms for admin
      const response = await api.get('/chat/rooms/');
      const rooms = response.data || [];
      console.log('✅ Admin chat rooms loaded:', rooms.length);
      
      // Store rooms for admin
      setAdminRooms(rooms);
      
      // Set the first room with messages as active, or create a new room
      let activeRoom = rooms.find(room => room.last_message) || rooms[0];
      
      if (!activeRoom && rooms.length === 0) {
        // No rooms exist, create one for admin
        const createResponse = await api.post('/chat/rooms/');
        activeRoom = createResponse.data;
        console.log('✅ Admin room created:', activeRoom);
      }
      
      if (activeRoom) {
        setRoom(activeRoom);
        
        // Load messages for the active room
        const messagesResponse = await api.get(`/chat/rooms/${activeRoom.id}/messages/`);
        setMessages(messagesResponse.data);
        console.log('✅ Admin messages loaded:', messagesResponse.data.length);
        
        // Connect WebSocket
        connectWebSocket(activeRoom.id);
        
        // Update unread count
        if (onUnreadCountChange) {
          const totalUnread = rooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
          onUnreadCountChange(totalUnread);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing admin chat:', error);
      if (error.response?.status === 401) {
        toast.error('لطفاً دوباره وارد حساب کاربری خود شوید');
      } else {
        toast.error('خطا در بارگذاری چت‌ها');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing chat...');
      console.log('🔑 User:', user);
      console.log('🔑 Access token exists:', !!localStorage.getItem('accessToken'));
      
      // Double-check authentication
      if (!user || !user.id || !localStorage.getItem('accessToken')) {
        console.error('❌ User not authenticated:', {
          user: !!user,
          userId: user?.id,
          hasToken: !!localStorage.getItem('accessToken')
        });
        toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }
      
      const response = await api.post('/chat/rooms/');
      const roomData = response.data;
      console.log('✅ Chat room created/retrieved:', roomData);
      
      setRoom(roomData);
      
      // دریافت پیام‌های موجود
      const messagesResponse = await api.get(`/chat/rooms/${roomData.id}/messages/`);
      setMessages(messagesResponse.data);
      console.log('✅ Messages loaded:', messagesResponse.data.length);
      
      // اتصال WebSocket
      connectWebSocket(roomData.id);
      
      // بروزرسانی تعداد پیام‌های خوانده نشده
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.status === 401) {
          toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
          // Redirect to login if not authenticated
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else if (error.response.status === 500) {
          toast.error('خطای سرور - لطفاً دوباره تلاش کنید');
        } else {
          toast.error('خطا در برقراری ارتباط با پشتیبانی');
        }
      } else {
        toast.error('خطا در اتصال به سرور');
      }
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (roomId) => {
    if (!WS_ENABLED) {
      console.log('?? Chat WebSocket disabled on shared host - using HTTP only');
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('localhost') ? 'localhost:8001' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${roomId}/`;
    
    console.log('🔌 Connecting to Chat WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('✅ Chat WebSocket connected');
      setWsConnected(true);
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        
        if (data.type === 'chat_message') {
          // بررسی اینکه پیام قبلاً اضافه نشده باشد
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.id === data.message_id);
            if (existingMessage) {
              console.log('⚠️ Message already exists:', data.message_id);
              return prev; // پیام قبلاً وجود دارد
            }
            
            const newMessage = {
              id: data.message_id,
              message: data.message,
              sender_type: data.sender_type,
              sender_name: data.sender_name,
              created_at: data.created_at,
              is_read: true
            };
            
            console.log('✅ Adding new message:', newMessage);
            return [...prev, newMessage];
          });
          
          // اگر ادمین است، لیست اتاق‌ها را به‌روزرسانی کن
          if (isAdmin) {
            setTimeout(async () => {
              try {
                const roomsResponse = await api.get('/chat/rooms/');
                setAdminRooms(roomsResponse.data || []);
                console.log('🔄 Admin rooms refreshed');
              } catch (error) {
                console.error('Error refreshing admin rooms via WebSocket:', error);
              }
            }, 500);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing Chat WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = (event) => {
      console.log('🔌 Chat WebSocket disconnected', event.code, event.reason);
      setWsConnected(false);
      
      // Auto-reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        console.log('🔄 Attempting to reconnect WebSocket in 3 seconds...');
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log('🔄 Reconnecting WebSocket...');
            connectWebSocket(roomId);
          }
        }, 3000);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌ Chat WebSocket error:', error);
      setWsConnected(false);
    };
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const selectAdminRoom = async (selectedRoom) => {
    try {
      console.log('🔄 Admin selecting room:', selectedRoom.id);
      setRoom(selectedRoom);
      
      // Load messages for selected room
      const messagesResponse = await api.get(`/chat/rooms/${selectedRoom.id}/messages/`);
      setMessages(messagesResponse.data);
      console.log('✅ Messages loaded for room:', messagesResponse.data.length);
      
      // Connect to new room's WebSocket
      connectWebSocket(selectedRoom.id);
      
    } catch (error) {
      console.error('❌ Error selecting admin room:', error);
      toast.error('خطا در بارگذاری پیام‌ها');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (user && room) {
      // کاربر لاگین شده (مشتری یا ادمین)
      try {
        const response = await api.post(`/chat/rooms/${room.id}/send_message/`, {
          message: newMessage
        });
        
        console.log('✅ Message sent:', response.data);
        
        // پیام از طریق WebSocket دریافت خواهد شد، نیازی به اضافه کردن دستی نیست
        setNewMessage("");
        
        // اگر ادمین است، لیست اتاق‌ها را به‌روزرسانی کن
        if (isAdmin) {
          try {
            const roomsResponse = await api.get('/chat/rooms/');
            setAdminRooms(roomsResponse.data || []);
          } catch (error) {
            console.error('Error refreshing admin rooms:', error);
          }
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        if (error.response?.status === 401) {
          toast.error('لطفاً دوباره وارد حساب کاربری خود شوید');
        } else if (error.response?.status === 404) {
          toast.error('اتاق چت یافت نشد - لطفاً صفحه را بازخوانی کنید');
        } else {
          toast.error('خطا در ارسال پیام - لطفاً دوباره تلاش کنید');
        }
      }
    } else if (!user && room && guestPhone) {
      // مهمان با اتاق چت موجود - ارسال پیام‌های بعدی
      try {
        const response = await api.post(`/chat/rooms/${room.id}/send_message/`, {
          message: newMessage
        });
        
        console.log('✅ Guest follow-up message sent:', response.data);
        
        // پیام از طریق WebSocket دریافت خواهد شد
        setNewMessage("");
        
      } catch (error) {
        console.error('Error sending guest follow-up message:', error);
        toast.error('خطا در ارسال پیام - لطفاً دوباره تلاش کنید');
      }
    } else if (!user && guestPhone) {
      // مهمان جدید - اولین پیام
      try {
        const response = await api.post('/chat/guest/', {
          phone: guestPhone,
          message: newMessage
        });
        
        toast.success('پیام شما ارسال شد');
        
        // Save guest session to localStorage
        const guestSessionData = {
          phone: guestPhone,
          roomId: response.data.room_id,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('guestChatSession', JSON.stringify(guestSessionData));
        setGuestSession(guestSessionData);
        
        // Clear the message input
        setNewMessage("");
        
        // ایجاد اتاق چت برای مهمان
        const roomData = { id: response.data.room_id };
        setRoom(roomData);
        
        // بارگذاری پیام‌های موجود (شامل پیام جدید ارسال شده)
        try {
          const messagesResponse = await api.get(`/chat/rooms/${response.data.room_id}/messages/`);
          setMessages(messagesResponse.data);
          console.log('✅ Guest messages loaded after sending:', messagesResponse.data.length);
        } catch (msgError) {
          console.error('Error loading messages:', msgError);
        }
        
        // Connect WebSocket after loading messages
        connectWebSocket(response.data.room_id);
        
      } catch (error) {
        console.error('Error sending guest message:', error);
        if (error.response?.data?.phone) {
          toast.error('شماره تلفن نامعتبر است');
        } else if (error.response?.data?.message) {
          toast.error('پیام نمی‌تواند خالی باشد');
        } else {
          toast.error('خطا در ارسال پیام - لطفاً دوباره تلاش کنید');
        }
      }
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `امروز ${formatTime(dateString)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `دیروز ${formatTime(dateString)}`;
    } else {
      return `${date.toLocaleDateString('fa-IR')} ${formatTime(dateString)}`;
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB for images, 100MB for audio)
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`حجم فایل نباید بیشتر از ${file.type.startsWith('image/') ? '10' : '100'} مگابایت باشد`);
        return;
      }
      setSelectedFile(file);
    }
  };

  // Send file message
  const handleSendFile = async (file, messageType) => {
    if (!file || !room) return;

    try {
      const formData = new FormData();
      formData.append('message_type', messageType);
      formData.append(messageType, file);
      // Don't send default message text for images, let them speak for themselves
      if (messageType !== 'image') {
        formData.append('message', 'فایل صوتی ارسال شد');
      }

      const response = await api.post(`/chat/rooms/${room.id}/send_message/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ File message sent:', response.data);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // اگر ادمین است، لیست اتاق‌ها را به‌روزرسانی کن
      if (isAdmin) {
        try {
          const roomsResponse = await api.get('/chat/rooms/');
          setAdminRooms(roomsResponse.data || []);
        } catch (error) {
          console.error('Error refreshing admin rooms:', error);
        }
      }

    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('خطا در ارسال فایل');
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        handleSendFile(file, 'audio');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('خطا در دسترسی به میکروفن');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
      {/* هدر */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">پشتیبانی مرکز تک</h3>
            <div className="text-xs opacity-90">
              {onlineAdmins.length > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {onlineAdmins.length} ادمین آنلاین - پاسخ سریع
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  آفلاین - پاسخ تا چند ساعت
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* محتوای چت */}
      <div className="flex-1 flex flex-col min-h-0">
        {!authLoading && !user && !room ? (
          /* فرم مهمان خیلی ساده */
          <div className="flex-1 flex flex-col min-h-0">
            {/* هدر ساده با ادمین‌های آنلاین */}
            <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
             
              
              {onlineAdmins.length > 0 ? (
                <div className="flex items-center justify-center gap-4 mb-2">
                  {onlineAdmins.slice(0, 4).map((admin, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        {admin.admin_avatar ? (
                          <img 
                            src={admin.admin_avatar} 
                            alt={admin.admin_name}
                            className="w-14 h-14 rounded-full object-cover border-3 border-green-400"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-3 border-green-400">
                            {admin.admin_name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {admin.admin_name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                  {onlineAdmins.length > 4 && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold border-3 border-gray-300">
                        +{onlineAdmins.length - 4}
                      </div>
                      <span className="text-sm text-gray-500">نفر دیگر</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-gray-400 rounded-full flex items-center justify-center border-3 border-gray-300">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">پشتیبانی (آفلاین)</span>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {onlineAdmins.length > 0 ? 'پاسخ فوری' : 'پاسخ تا چند ساعت'}
              </div>
            </div>
            
            {/* فرم ساده */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-md mx-auto space-y-4">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      شماره تماس
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="09xxxxxxxxx"
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                        required
                        pattern="09[0-9]{9}"
                        maxLength="11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      پیام شما
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="سوال یا درخواست خود را بنویسید..."
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none transition-all"
                      rows="4"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!guestPhone || !newMessage.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100"
                  >
                    <Send className="w-5 h-5" />
                    <span>شروع گفتگو</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : !authLoading && !user && room ? (
          /* رابط چت مهمان بعد از شروع گفتگو */
          <>
            {/* پیام‌ها برای مهمان */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0 chat-messages-container">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">در انتظار پاسخ پشتیبانی...</p>
                  <p className="text-xs mt-1">پیام شما ارسال شده است</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    // CORRECTED LOGIC: Customer messages RIGHT (blue), Admin messages LEFT (gray)
                    // For guest view: their own messages (user) should be RIGHT, admin messages LEFT
                    const isOwnMessage = message.sender_type === 'user';
                    const senderLabel = message.sender_type === 'admin' ? 'ادمین' : 'مهمان';
                    
                    return (
                      <div key={message.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <span className={`text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}>
                          {senderLabel}
                        </span>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl break-words ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                          }`}
                        >
                          {/* Render media files */}
                          {message.message_type === 'image' && message.file_url && (
                            <div className="mb-2">
                              <img 
                                src={message.file_url} 
                                alt="تصویر ارسالی"
                                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.file_url, '_blank')}
                              />
                            </div>
                          )}
                          
                          {message.message_type === 'audio' && message.file_url && (
                            <div className="mb-2">
                              <audio 
                                controls 
                                className="w-full max-w-xs"
                                preload="metadata"
                              >
                                <source src={message.file_url} type="audio/webm" />
                                <source src={message.file_url} type="audio/mp3" />
                                مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                              </audio>
                            </div>
                          )}
                          
                          {message.message_type === 'file' && message.file_url && (
                            <div className="mb-2">
                              <a 
                                href={message.file_url} 
                                download={message.file_name}
                                className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                              >
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{message.file_name || 'فایل'}</span>
                              </a>
                            </div>
                          )}
                          
                          {/* Only show message text if it exists and is not empty */}
                          {message.message && message.message.trim() && (
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-1" />
                </>
              )}
            </div>

            {/* فرم ارسال پیام برای مهمان */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex flex-col gap-2">
                {/* نمایش اطلاعات مهمان */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>چت به عنوان: {guestPhone}</span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('guestChatSession');
                      setGuestSession(null);
                      setRoom(null);
                      setMessages([]);
                      setGuestPhone("");
                      if (wsRef.current) {
                        wsRef.current.close();
                      }
                    }}
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    چت جدید
                  </button>
                </div>
                
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : authLoading ? (
          /* Loading state */
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
            </div>
          </div>
        ) : isAdmin ? (
          /* Admin Chat Interface */
          <div className="flex-1 flex flex-col min-h-0">
            {adminRooms.length > 0 && (
              /* Room selector for admin */
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <select
                  value={room?.id || ''}
                  onChange={(e) => {
                    const selectedRoom = adminRooms.find(r => r.id === parseInt(e.target.value));
                    if (selectedRoom) selectAdminRoom(selectedRoom);
                  }}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">انتخاب چت...</option>
                  {adminRooms.map((adminRoom) => (
                    <option key={adminRoom.id} value={adminRoom.id}>
                      {adminRoom.participant_name} 
                      {adminRoom.unread_count > 0 && ` (${adminRoom.unread_count} پیام جدید)`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Messages for admin */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0 chat-messages-container">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : !room ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">یک چت را انتخاب کنید</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">هنوز پیامی ارسال نشده</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    // FIXED LOGIC: Flip the logic for admin too
                    // Admin view: admin messages should be RIGHT, customer messages should be LEFT
                    // But based on customer view being flipped, we flip admin too
                    const isOwnMessage = message.sender_type === 'user';
                    const senderLabel = message.sender_type === 'admin' ? 'ادمین' : 'مشتری';
                    
                    return (
                      <div key={message.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <span className={`text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}>
                          {senderLabel}
                        </span>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl break-words ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-1" />
                </>
              )}
            </div>

            {/* Admin message form */}
            {room && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* پیام‌ها */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0 chat-messages-container">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">هنوز پیامی ارسال نشده</p>
                  <p className="text-xs mt-1">اولین پیام خود را بفرستید</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    // CORRECTED LOGIC: Customer messages RIGHT (blue), Admin messages LEFT (gray)
                    // For customer view: their own messages (user) should be RIGHT, admin messages LEFT
                    const isOwnMessage = message.sender_type === 'user';
                    const senderLabel = message.sender_type === 'admin' ? 'ادمین' : 'مشتری';
                    
                    return (
                      <div key={message.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <span className={`text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}>
                          {senderLabel}
                        </span>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl break-words ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                          }`}
                        >
                          {/* Render media files */}
                          {message.message_type === 'image' && message.file_url && (
                            <div className="mb-2">
                              <img 
                                src={message.file_url} 
                                alt="تصویر ارسالی"
                                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.file_url, '_blank')}
                              />
                            </div>
                          )}
                          
                          {message.message_type === 'audio' && message.file_url && (
                            <div className="mb-2">
                              <audio 
                                controls 
                                className="w-full max-w-xs"
                                preload="metadata"
                              >
                                <source src={message.file_url} type="audio/webm" />
                                <source src={message.file_url} type="audio/mp3" />
                                مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                              </audio>
                            </div>
                          )}
                          
                          {message.message_type === 'file' && message.file_url && (
                            <div className="mb-2">
                              <a 
                                href={message.file_url} 
                                download={message.file_name}
                                className="flex items-center gap-2 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                              >
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{message.file_name || 'فایل'}</span>
                              </a>
                            </div>
                          )}
                          
                          {/* Only show message text if it exists and is not empty */}
                          {message.message && message.message.trim() && (
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-1" />
                </>
              )}
            </div>

            {/* فرم ارسال پیام */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              {/* File preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedFile.type.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-blue-700 dark:text-blue-300">{selectedFile.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendFile(selectedFile, selectedFile.type.startsWith('image/') ? 'image' : 'file')}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        ارسال
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-700 dark:text-red-300">در حال ضبط صدا...</span>
                      <span className="text-sm font-mono text-red-600">{formatRecordingTime(recordingTime)}</span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      توقف و ارسال
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2">
                {/* Media buttons */}
                <div className="flex items-center gap-1">
                  {/* Image upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording || selectedFile}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="ارسال تصویر"
                  >
                    <Image className="w-4 h-4" />
                  </button>

                  {/* Audio recording button */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={selectedFile}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecording 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title={isRecording ? 'توقف ضبط' : 'ضبط صدا'}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  disabled={isRecording || selectedFile}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || isRecording}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
