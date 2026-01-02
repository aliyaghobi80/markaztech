// مسیر: src/components/admin/AdminChat.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Phone,
  Search,
  Circle,
  Image,
  Mic,
  Paperclip,
  Play,
  Pause
} from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminChat() {
  const { data: rooms, error, mutate } = useSWR("/chat/rooms/", fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    onSuccess: (data) => {
      console.log('✅ Chat rooms loaded:', data);
    },
    onError: (error) => {
      console.error('❌ Error fetching chat rooms:', error);
      if (error.response?.status === 401) {
        toast.error('لطفاً دوباره وارد حساب کاربری خود شوید');
      }
    }
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // بروزرسانی وضعیت آنلاین ادمین
  useEffect(() => {
    const updateOnlineStatus = async (isOnline) => {
      try {
        await api.post('/chat/admin-status/update_status/', {
          is_online: isOnline
        });
        setOnlineStatus(isOnline);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // تنظیم آنلاین در شروع
    updateOnlineStatus(true);

    // تنظیم آفلاین در خروج
    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateOnlineStatus(false);
    };
  }, []);

  // اسکرول به پایین پیام‌ها
  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // فقط زمانی اسکرول کن که پیام‌ها تغییر کنند و اتاق انتخاب شده باشد
    if (selectedRoom && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages, selectedRoom]);

  // انتخاب اتاق چت
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    
    try {
      console.log('🔄 Loading messages for room:', room.id);
      const response = await api.get(`/chat/rooms/${room.id}/messages/`);
      console.log('✅ Messages loaded:', response.data);
      setMessages(response.data);
      
      // اتصال WebSocket
      connectWebSocket(room.id);
      
      // اسکرول به پایین بعد از لود شدن پیام‌ها
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // بروزرسانی لیست اتاق‌ها
      mutate();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('خطا در بارگذاری پیام‌ها');
    }
  };

  const connectWebSocket = (roomId) => {
    // بستن اتصال قبلی
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('localhost') ? 'localhost:8001' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${roomId}/`;
    
    console.log('🔌 Connecting to Admin Chat WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('✅ Admin Chat WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          // بررسی اینکه پیام قبلاً اضافه نشده باشد
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.id === data.message_id);
            if (existingMessage) {
              return prev; // پیام قبلاً وجود دارد
            }
            
            return [...prev, {
              id: data.message_id,
              message: data.message,
              sender_type: data.sender_type,
              sender_name: data.sender_name,
              created_at: data.created_at,
              is_read: true
            }];
          });
          
          // بروزرسانی لیست اتاق‌ها
          mutate();
        }
      } catch (error) {
        console.error('❌ Error parsing Admin Chat WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = (event) => {
      console.log('🔌 Admin Chat WebSocket disconnected', event.code, event.reason);
      
      // Auto-reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        console.log('🔄 Attempting to reconnect Admin WebSocket in 3 seconds...');
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log('🔄 Reconnecting Admin WebSocket...');
            connectWebSocket(roomId);
          }
        }, 3000);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌ Admin Chat WebSocket error:', error);
    };
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await api.post(`/chat/rooms/${selectedRoom.id}/send_message/`, {
        message: newMessage
      });
      
      // پیام از طریق WebSocket دریافت خواهد شد
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطا در ارسال پیام');
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
    if (!file || !selectedRoom) return;

    try {
      const formData = new FormData();
      formData.append('message_type', messageType);
      formData.append(messageType, file);
      // Don't send default message text for images, let them speak for themselves
      if (messageType !== 'image') {
        formData.append('message', 'فایل صوتی ارسال شد');
      }

      const response = await api.post(`/chat/rooms/${selectedRoom.id}/send_message/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Admin file message sent:', response.data);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
        const file = new File([blob], `admin_audio_${Date.now()}.webm`, { type: 'audio/webm' });
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

  // فیلتر اتاق‌ها بر اساس جستجو
  const filteredRooms = rooms?.filter(room => 
    room.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  console.log('🏠 Filtered rooms:', filteredRooms.length);

  if (error) {
    console.error('❌ SWR Error:', error);
    return <div className="text-center py-10 text-error">خطا در دریافت چت‌ها</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          مدیریت چت پشتیبانی
        </h1>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            onlineStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <Circle className={`w-2 h-2 ${onlineStatus ? 'fill-green-500' : 'fill-gray-500'}`} />
            {onlineStatus ? 'آنلاین' : 'آفلاین'}
          </div>
          <span className="bg-secondary text-foreground-muted px-3 py-1 rounded-full text-xs">
            {filteredRooms.length} چت
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* لیست چت‌ها */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در چت‌ها..."
                className="w-full pr-10 pl-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>هیچ چتی یافت نشد</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-primary/10 border-r-4 border-r-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      {room.participant_avatar ? (
                        <img 
                          src={room.participant_avatar} 
                          alt={room.participant_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-foreground-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground truncate">{room.participant_name}</p>
                        {room.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                      {room.last_message && (
                        <p className="text-sm text-foreground-muted truncate">
                          {room.last_message.message}
                        </p>
                      )}
                      <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(room.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* پنجره چت */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl flex flex-col min-h-0">
          {selectedRoom ? (
            <>
              {/* هدر چت */}
              <div className="p-4 border-b border-border bg-secondary/30 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedRoom.participant_avatar ? (
                      <img 
                        src={selectedRoom.participant_avatar} 
                        alt={selectedRoom.participant_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-foreground-muted" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{selectedRoom.participant_name}</h3>
                    <p className="text-sm text-foreground-muted truncate">
                      آخرین فعالیت: {formatDateTime(selectedRoom.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* پیام‌ها */}
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0" 
                style={{ scrollBehavior: 'smooth' }}
                id="messages-container"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                    <p>هنوز پیامی ارسال نشده</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      // CORRECTED LOGIC: Admin messages RIGHT (blue), Customer messages LEFT (gray)
                      // For admin view: their own messages (admin) should be RIGHT, customer messages LEFT
                      const isOwnMessage = message.sender_type === 'admin';
                      const senderLabel = message.sender_type === 'admin' ? 'ادمین' : 'مشتری';
                      
                      return (
                        <div key={message.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <span className={`text-xs text-foreground-muted mb-1 px-2 ${
                            isOwnMessage ? 'text-right' : 'text-left'
                          }`}>
                            {senderLabel}
                          </span>
                          <div
                            className={`max-w-[70%] p-3 rounded-2xl break-words ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-secondary text-foreground rounded-bl-md'
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
                              isOwnMessage ? 'text-primary-foreground/70' : 'text-foreground-muted'
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
              <div className="p-4 border-t border-border flex-shrink-0">
                {/* File preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedFile.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-primary" />
                        ) : (
                          <Paperclip className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-sm text-foreground">{selectedFile.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendFile(selectedFile, selectedFile.type.startsWith('image/') ? 'image' : 'file')}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
                        >
                          ارسال
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-3 py-1 bg-secondary text-foreground rounded text-xs hover:bg-secondary/80 transition-colors"
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
                      className="p-2 text-foreground-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : 'text-foreground-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
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
                    placeholder="پاسخ خود را بنویسید..."
                    disabled={isRecording || selectedFile}
                    className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || isRecording}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-primary-foreground rounded-lg transition-colors flex items-center justify-center flex-shrink-0 disabled:cursor-not-allowed"
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-foreground-muted">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">یک چت را انتخاب کنید</p>
                <p className="text-sm mt-1">برای شروع مکالمه، یکی از چت‌ها را انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}