// مسیر: src/components/admin/AdminTickets.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { Headphones, Send, Clock, MessageCircle, Loader2, User, CheckCircle } from "lucide-react";
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
            <Headphones className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
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
  const [sending, setSubmitting] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/users/tickets/${ticket.id}/add_message/`, { message: newMessage });
      setNewMessage("");
      mutate();
      onRefresh();
      toast.success("پاسخ ارسال شد");
    } catch (error) {
      toast.error("خطا در ارسال پاسخ");
    } finally {
      setSubmitting(false);
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
          <div className="space-y-4 max-h-[400px] overflow-y-auto px-2">
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  msg.is_me 
                  ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                  : "bg-card border border-border text-foreground rounded-tl-none"
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[10px] font-bold opacity-70">{msg.sender_name}</span>
                  </div>
                  <p className="leading-7">{msg.message}</p>
                  <div className={`mt-2 text-[9px] ${msg.is_me ? "text-primary-foreground/70" : "text-foreground-muted"}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {ticket.status !== 'CLOSED' && (
              <form onSubmit={handleSendMessage} className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پاسخ ادمین..."
                  className="w-full bg-card border border-border rounded-2xl p-4 pr-4 pl-14 text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px] outline-none"
                />
                <button 
                  disabled={sending || !newMessage.trim()}
                  className="absolute left-3 bottom-3 p-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
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
