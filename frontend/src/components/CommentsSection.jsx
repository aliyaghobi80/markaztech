// مسیر: src/components/CommentsSection.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Star, Send, User, Clock, CheckCircle, Reply, CornerDownLeft, ShieldCheck, Calendar } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function CommentsSection({ productId, comments: initialComments = [], onCommentSubmit }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // WebSocket for real-time comments
  useEffect(() => {
    if (!productId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/products/${productId}/comments/`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "comment_update") {
        const newComment = data.comment;
        
        setComments(prevComments => {
          // If it's a top-level comment
          if (!newComment.parent) {
            const exists = prevComments.some(c => c.id === newComment.id);
            if (exists) return prevComments.map(c => c.id === newComment.id ? newComment : c);
            return [newComment, ...prevComments];
          }
          
          // If it's a reply, we need to find the parent and add it there
          return prevComments.map(c => {
            if (c.id === newComment.parent) {
              const replies = c.replies || [];
              const replyExists = replies.some(r => r.id === newComment.id);
              if (replyExists) {
                return { ...c, replies: replies.map(r => r.id === newComment.id ? newComment : r) };
              }
              return { ...c, replies: [...replies, newComment] };
            }
            return c;
          });
        });
      }
    };

    return () => socket.close();
  }, [productId]);

  const handleSubmit = async (e, parentId = null) => {
    if (e) e.preventDefault();
    const text = parentId ? replyTo.content : content;
    
    if (!user) {
      toast.error("برای ثبت نظر ابتدا وارد حساب خود شوید");
      return;
    }
    if (!text.trim()) {
      toast.error("متن نظر نمی‌تواند خالی باشد");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/products/comments/", {
        product: productId,
        content: text,
        rating: parentId ? 5 : rating,
        parent: parentId
      });
      
      const newComment = response.data;
      const isAutoApproved = user.is_staff || parentId !== null;

      toast.success(isAutoApproved ? "نظر شما ثبت و منتشر شد" : "نظر شما ثبت شد و پس از تایید مدیر نمایش داده خواهد شد");
      
      // Update local state immediately for the user (only for replies or staff)
      if (isAutoApproved) {
        setComments(prev => {
          if (!parentId) {
            const exists = prev.some(c => c.id === newComment.id);
            if (exists) return prev;
            return [newComment, ...prev];
          }
          return prev.map(c => {
            if (c.id === parentId) {
              const replies = c.replies || [];
              const replyExists = replies.some(r => r.id === newComment.id);
              if (replyExists) return c;
              return { ...c, replies: [...replies, newComment] };
            }
            return c;
          });
        });
      }

      if (parentId) {
        setReplyTo(null);
      } else {
        setContent("");
        setRating(5);
      }
      
      if (onCommentSubmit) onCommentSubmit();
    } catch (error) {
      toast.error("خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">نظرات کاربران</h2>
        <span className="bg-secondary px-2 py-0.5 rounded-md text-xs text-foreground-muted">
          {comments.length} نظر
        </span>
      </div>

      {/* فرم ثبت نظر اصلی */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
          <Send className="w-4 h-4 text-primary" />
          ثبت نظر جدید
        </h3>
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-2">امتیاز شما:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="تجربه خود را از استفاده از این محصول بنویسید..."
                className="w-full bg-secondary border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[120px] transition-all"
              />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-foreground-muted">نظرات و پاسخ‌ها پس از ثبت نمایش داده می‌شوند.</p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? "در حال ارسال..." : "ثبت نظر"}
            </button>
          </div>
        </form>
      </div>

      {/* لیست نظرات */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <MessageSquare className="w-12 h-12 text-foreground-muted mx-auto mb-3 opacity-20" />
            <p className="text-foreground-muted text-sm">هنوز نظری برای این محصول ثبت نشده است.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              user={user}
              onReply={(c) => setReplyTo(c)}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              handleSubmit={handleSubmit}
              submitting={submitting}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, user, onReply, replyTo, setReplyTo, handleSubmit, submitting, isReply = false }) {
  const isAdminComment = comment.user_is_staff;
  const isPending = !comment.is_approved;

  return (
    <div className={`space-y-4 ${isReply ? "mr-4 sm:mr-8 border-r-2 border-primary/10 pr-4" : ""}`}>
      <div className={`bg-card border border-border rounded-3xl p-4 sm:p-6 transition-all hover:shadow-md ${isAdminComment ? "ring-1 ring-primary/30 bg-primary/5" : ""} ${isPending ? "opacity-70 grayscale-[0.5]" : ""}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdminComment ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
              {isAdminComment ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">{comment.user_name || "کاربر مرکز تک"}</h4>
                {isAdminComment && <span className="bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm">مدیر</span>}
                {isPending && <span className="bg-yellow-500/10 text-yellow-600 text-[8px] px-1.5 py-0.5 rounded-md font-bold">در انتظار تایید</span>}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-foreground-muted" title={comment.created_at_full}>
                  <Clock className="w-3 h-3" />
                  <span>{comment.created_at_human}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-foreground-muted/60">
                  <Calendar className="w-3 h-3" />
                  <span>{comment.created_at_full?.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!isReply && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${star <= comment.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                  />
                ))}
              </div>
            )}
            <button 
              onClick={() => onReply(replyTo?.id === comment.id ? null : { id: comment.id, content: "" })}
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
            >
              <Reply className="w-3 h-3" />
              پاسخ دادن
            </button>
          </div>
        </div>
        <p className="text-foreground-muted text-sm leading-7">
          {comment.content}
        </p>
      </div>

      {/* فرم پاسخ */}
      {replyTo?.id === comment.id && (
        <div className="mr-4 sm:mr-8 bg-secondary/30 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-foreground-muted">
            <CornerDownLeft className="w-3 h-3" />
            در حال پاسخ به {comment.user_name}
          </div>
            <textarea
              value={replyTo.content}
              onChange={(e) => setReplyTo({ ...replyTo, content: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e, comment.id);
                }
              }}
              placeholder="پاسخ خود را بنویسید..."
              className="w-full bg-card border border-border rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/20 min-h-[80px] outline-none transition-all"
            />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setReplyTo(null)}
              className="px-4 py-2 text-xs font-bold text-foreground-muted hover:bg-secondary rounded-lg transition-all"
            >
              انصراف
            </button>
            <button
              onClick={(e) => handleSubmit(e, comment.id)}
              disabled={submitting}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? "در حال ارسال..." : "ارسال پاسخ"}
            </button>
          </div>
        </div>
      )}

      {/* نمایش پاسخ‌ها (Recursive) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              user={user}
              onReply={onReply}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              handleSubmit={handleSubmit}
              submitting={submitting}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
