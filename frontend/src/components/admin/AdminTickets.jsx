// مسیر: src/components/admin/AdminTickets.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { Headphones, Send, Clock, MessageCircle, Loader2, User, CheckCircle, Paperclip, X, Trash2, Image as ImageIcon, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns-jalali";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminTickets() {
  const { data: tickets, mutate, isLoading } = useSWR("/users/tickets/", fetcher);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black text-foreground flex items-center gap-2 mb-6">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        مدیریت تیکت‌ها
      </h1>

      <div className="space-y-4">
        {tickets?.length > 0 ? (
          tickets.map((ticket) => (
            <AdminTicketListItem key={ticket.id} ticket={ticket} onRefresh={mutate} />
          ))
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            < Headphones className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
            <p className="text-foreground-muted">تیکتی برای مدیریت وجود ندارد</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminTicketListItem({ ticket, onRefresh }) {
  const [showMessages, setShowMessages] = useState(false);
  const { data: messages, mutate } = useSWR(showMessages ? `/users/tickets/${ticket.id}/messages/` : null, fetcher);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (showMessages && messages) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, showMessages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("اندازه فایل نباید بیشتر از 10 مگابایت باشد");
        return;
      }
      setAttachment(file);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("message", newMessage);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      await api.post(`/users/tickets/${ticket.id}/add_message/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setNewMessage("");
      setAttachment(null);
      mutate();
      onRefresh();
      toast.success("پاسخ ارسال شد");
    } catch (error) {
      toast.error(error.response?.data?.attachment?.[0] || "خطا در ارسال پاسخ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("آیا از حذف این پیام و فایل پیوست آن اطمینان دارید؟")) return;
    
    try {
      await api.post(`/users/tickets/${ticket.id}/delete_message/${messageId}/`);
      toast.success("پیام حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف پیام");
    }
  };

  const handleCloseTicket = async () => {
    try {
      await api.post(`/users/tickets/${ticket.id}/close/`);
      toast.success("تیکت بسته شد");
      onRefresh();
    } catch (error) {
      toast.error("خطا در بستن تیکت");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      OPEN: { label: "باز", color: "text-success", bg: "bg-success/10" },
      CLOSED: { label: "بسته شده", color: "text-foreground-muted", bg: "bg-secondary" },
      PENDING: { label: "در انتظار پاسخ ادمین", color: "text-amber-500", bg: "bg-amber-500/10" }
    };
    return configs[status] || configs.OPEN;
  };

  const status = getStatusConfig(ticket.status);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:shadow-md">
      <div 
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={() => setShowMessages(!showMessages)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bg} ${status.color}`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{ticket.subject}</h3>
            <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
              <span className="font-bold text-primary">{ticket.user_name} ({ticket.user_mobile})</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <div className={`transition-transform duration-300 ${showMessages ? "rotate-180" : ""}`}>
            <MessageCircle className="w-5 h-5 text-foreground-muted" />
          </div>
        </div>
      </div>

        {showMessages && (
          <div className="border-t border-border bg-secondary/20 p-6 space-y-6">
            <div 
              ref={scrollContainerRef}
              className="space-y-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar scroll-smooth"
            >
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.is_me ? "items-end" : "items-start"} mb-6`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      {!msg.is_me && <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"><User className="w-3 h-3" /></div>}
                      <span className="text-[10px] font-black text-foreground/50">{msg.sender_name}</span>
                      {msg.is_me && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground italic">A</div>}
                    </div>

                    <div className={`group relative max-w-[85%] transition-all duration-300 ${
                      msg.is_me 
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm shadow-[0_8px_30px_rgb(59,130,246,0.15)]" 
                      : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm"
                    }`}>
                      <div className="p-4">
                        <p className="leading-relaxed text-[13px] whitespace-pre-wrap">{msg.message}</p>
                        
                        {msg.attachment && (
                          <div className={`mt-3 overflow-hidden rounded-xl border ${msg.is_me ? "border-white/10 bg-black/10" : "border-border bg-secondary/50"}`}>
                            {msg.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <div className="relative group/img">
                                <a href={msg.attachment} target="_blank" rel="noreferrer">
                                  <img 
                                    src={msg.attachment} 
                                    alt="Attachment" 
                                    className="max-w-full h-auto object-cover max-h-[300px] w-full transition-transform duration-500 group-hover/img:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Paperclip className="text-white w-6 h-6" />
                                  </div>
                                </a>
                              </div>
                            ) : (
                              <a 
                                href={msg.attachment} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span>مشاهده فایل پیوست</span>
                                  <span className="text-[9px] opacity-50">کلیک برای دانلود</span>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`absolute -top-2 ${msg.is_me ? "-left-2" : "-right-2"} opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 bg-error text-error-foreground rounded-full shadow-lg hover:scale-110 active:scale-90"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-1.5 px-1 text-[9px] font-medium text-foreground/40`}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          <div className="flex flex-col gap-4">
            {ticket.status !== 'CLOSED' && (
              <div className="space-y-3">
                {attachment && (
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-bold w-fit">
                    <ImageIcon className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip"
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="پاسخ ادمین... (Enter برای ارسال)"
                    className="w-full bg-card border border-border rounded-2xl p-4 pr-4 pl-24 text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px] outline-none"
                  />
                  <div className="absolute left-3 bottom-3 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-3 bg-secondary text-foreground-muted rounded-xl hover:bg-secondary/80 transition-all"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                      disabled={sending || (!newMessage.trim() && !attachment)}
                      className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {ticket.status !== 'CLOSED' && (
              <button 
                onClick={handleCloseTicket}
                className="w-full md:w-auto mr-auto bg-error/10 text-error px-6 py-2 rounded-xl text-xs font-bold hover:bg-error/20 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                بستن تیکت
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
