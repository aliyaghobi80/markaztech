// مسیر: src/components/admin/AdminComments.jsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { MessageSquare, CheckCircle, XCircle, Trash2, Loader2, User, Clock, Reply, Send, CornerDownLeft, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminComments() {
  const { data: allComments, mutate, isLoading } = useSWR("/products/comments/", fetcher);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = "8000";
    const token = localStorage.getItem("accessToken");
    
    const socket = new WebSocket(`${protocol}//${host}:${port}/ws/user/?token=${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "comment_update") {
        mutate();
      }
    };

    return () => socket.close();
  }, [mutate]);

  // Filter to show only top-level comments
  const topLevelComments = allComments?.filter(c => !c.parent) || [];

  const handleApprove = async (id) => {
    try {
      await api.post(`/products/comments/${id}/approve/`);
      toast.success("نظر تایید شد");
      mutate();
    } catch (error) {
      toast.error("خطا در تایید نظر");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/products/comments/${id}/reject/`);
      toast.success("نظر رد شد");
      mutate();
    } catch (error) {
      toast.error("خطا در رد نظر");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    try {
      await api.delete(`/products/comments/${id}/`);
      toast.success("نظر حذف شد");
      mutate();
    } catch (error) {
      toast.error("خطا در حذف نظر");
    }
  };

  const handleSendReply = async (comment) => {
    if (!replyContent.trim()) {
      toast.error("متن پاسخ نمی‌تواند خالی باشد");
      return;
    }

    setSubmittingReply(true);
    try {
      await api.post("/products/comments/", {
        product: comment.product,
        content: replyContent,
        parent: comment.id,
        rating: 5
      });
      toast.success("پاسخ شما با موفقیت ثبت شد");
      setReplyTo(null);
      setReplyReplyContent("");
      mutate();
    } catch (error) {
      toast.error("خطا در ارسال پاسخ");
    } finally {
      setSubmittingReply(false);
    }
  };

  const CommentCard = ({ comment, isReply = false }) => (
    <div key={comment.id} className={`bg-card border border-border rounded-3xl p-6 shadow-sm transition-all hover:shadow-md ${isReply ? 'mr-12 border-r-4 border-primary/20 bg-secondary/10' : ''} mb-4`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comment.user_is_staff ? 'bg-primary text-white' : 'bg-secondary text-foreground-muted'}`}>
            {comment.user_is_staff ? <CheckCircle className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              {comment.user_name || "کاربر ناشناس"} 
              <span className="text-[10px] font-normal opacity-60">({comment.user_mobile})</span>
              {comment.user_is_staff && <span className="bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-md">مدیر</span>}
            </h3>
            {!isReply && (
              <p className="text-[10px] text-foreground-muted flex items-center gap-1">
                برای محصول: <span className="font-bold text-primary">{comment.product_title}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
              <Clock className="w-3 h-3" />
              <span>{comment.created_at_human}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-foreground-muted/50">
              <Calendar className="w-3 h-3" />
              <span>{comment.created_at_full}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
            comment.is_approved ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500"
          }`}>
            {comment.is_approved ? "تایید شده" : "در انتظار تایید"}
          </span>
        </div>
      </div>

      <div className="bg-secondary/30 rounded-2xl p-4 mb-4 border border-border/50">
        <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-line">{comment.content}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          {!isReply && (
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                replyTo === comment.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary text-foreground-muted hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Reply className="w-4 h-4" />
              پاسخ دادن
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!comment.is_approved ? (
            <button 
              onClick={() => handleApprove(comment.id)}
              className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-success/90 transition-all shadow-lg shadow-success/10"
            >
              <CheckCircle className="w-4 h-4" />
              تایید
            </button>
          ) : (
            <button 
              onClick={() => handleReject(comment.id)}
              className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10"
            >
              <XCircle className="w-4 h-4" />
              لغو تایید
            </button>
          )}
          <button 
            onClick={() => handleDelete(comment.id)}
            className="flex items-center gap-1.5 bg-error/10 text-error px-4 py-2 rounded-xl text-xs font-bold hover:bg-error/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>

      {replyTo === comment.id && (
        <div className="mt-4 bg-secondary/50 rounded-2xl p-4 border border-primary/10 animate-in slide-in-from-top-2">
          <textarea 
            value={replyContent}
            onChange={(e) => setReplyReplyContent(e.target.value)}
            placeholder="متن پاسخ خود را وارد کنید..."
            className="w-full bg-card border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px] outline-none transition-all mb-3"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setReplyTo(null)} className="px-4 py-2 text-xs font-bold text-foreground-muted">انصراف</button>
            <button 
              onClick={() => handleSendReply(comment)}
              disabled={submittingReply}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              {submittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              ارسال پاسخ
            </button>
          </div>
        </div>
      )}

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-6 space-y-4">
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
            <p className="text-foreground-muted">نظری برای مدیریت وجود ندارد</p>
          </div>
        )}
      </div>
    </div>
  );
}
