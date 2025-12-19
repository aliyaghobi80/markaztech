// مسیر: src/components/UserTickets.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { Headphones, Plus, Send, Clock, MessageCircle, Loader2, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns-jalali";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function UserTickets() {
  const { data: tickets, error, mutate, isLoading } = useSWR("/users/tickets/", fetcher);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("لطفاً موضوع و متن پیام را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/users/tickets/", { subject });
      const ticketId = response.data.id;
      
      const formData = new FormData();
      formData.append("message", message);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      await api.post(`/users/tickets/${ticketId}/add_message/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("تیکت با موفقیت ایجاد شد");
      setSubject("");
      setMessage("");
      setAttachment(null);
      setShowCreateModal(false);
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.attachment?.[0] || "خطا در ایجاد تیکت");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          تیکت‌های پشتیبانی
        </h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          تیکت جدید
        </button>
      </div>

      {tickets?.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketListItem key={ticket.id} ticket={ticket} onRefresh={mutate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Headphones className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
          <p className="text-foreground-muted">شما هنوز تیکتی ثبت نکرده‌اید</p>
        </div>
      )}

      {/* مودال ایجاد تیکت */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-foreground mb-6">ارسال تیکت جدید</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground-muted mb-2">موضوع تیکت:</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثلاً: سوال در مورد شارژ کیف پول"
                  className="w-full bg-secondary border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground-muted mb-2">متن پیام:</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="جزئیات مشکل یا سوال خود را بنویسید..."
                  className="w-full bg-secondary border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[150px]"
                />
              </div>
              
              {/* بخش فایل پیوست */}
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.zip"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                  پیوست فایل (حداکثر 10MB)
                </button>
                {attachment && (
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                    <span className="truncate max-w-[150px]">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)}><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submitting ? "در حال ارسال..." : "ارسال تیکت"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-bold hover:bg-secondary/80 transition-all"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketListItem({ ticket, onRefresh }) {
  const [showMessages, setShowMessages] = useState(false);
  const { data: messages, mutate } = useSWR(showMessages ? `/users/tickets/${ticket.id}/messages/` : null, fetcher);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showMessages && messages) {
      scrollToBottom();
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
    } catch (error) {
      toast.error(error.response?.data?.attachment?.[0] || "خطا در ارسال پیام");
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

  const getStatusConfig = (status) => {
    const configs = {
      OPEN: { label: "باز", color: "text-success", bg: "bg-success/10" },
      CLOSED: { label: "بسته شده", color: "text-foreground-muted", bg: "bg-secondary" },
      PENDING: { label: "پاسخ مدیریت", color: "text-primary", bg: "bg-primary/10" }
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
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">{ticket.subject}</h3>
            <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
              <span>شناسه: #{ticket.id}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <div className={`transition-transform duration-300 ${showMessages ? "rotate-180" : ""}`}>
            <Plus className="w-5 h-5 text-foreground-muted" />
          </div>
        </div>
      </div>

      {showMessages && (
        <div className="border-t border-border bg-secondary/20 p-6 space-y-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  msg.is_me 
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                  : "bg-card border border-border text-foreground rounded-tl-none"
                }`}>
                  <p className="leading-7">{msg.message}</p>
                  
                  {msg.attachment && (
                    <div className="mt-3 p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-white/10">
                      {msg.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <a href={msg.attachment} target="_blank" rel="noreferrer">
                          <img 
                            src={msg.attachment} 
                            alt="Attachment" 
                            className="max-w-full h-auto rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : (
                        <a 
                          href={msg.attachment} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-[10px] font-bold py-1 px-2"
                        >
                          <FileText className="w-4 h-4" />
                          مشاهده فایل پیوست
                        </a>
                      )}
                    </div>
                  )}

                  <div className={`mt-2 text-[9px] ${msg.is_me ? "text-primary-foreground/70" : "text-foreground-muted"}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

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
                  placeholder="پاسخ خود را اینجا بنویسید... (Enter برای ارسال)"
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
        </div>
      )}
    </div>
  );
}
