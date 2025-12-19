// مسیر: src/components/CommentsSection.jsx
"use client";

import { useState } from "react";
import { MessageSquare, Star, Send, User, Clock, CheckCircle, Reply, CornerDownLeft, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns-jalali";

export default function CommentsSection({ productId, comments = [], onCommentSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
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
      await api.post("/products/comments/", {
        product: productId,
        content: text,
        rating: parentId ? 5 : rating,
        parent: parentId
      });
      toast.success(parentId ? "پاسخ شما ثبت شد" : "نظر شما ثبت شد و پس از تایید مدیر نمایش داده خواهد شد");
      
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
              placeholder="تجربه خود را از استفاده از این محصول بنویسید..."
              className="w-full bg-secondary border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[120px] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 mr-auto"
          >
            {submitting ? "در حال ارسال..." : "ثبت نظر"}
          </button>
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
  const isAdminComment = comment.user_mobile === '09123456789' || comment.is_approved; // Example check or add role to serializer

  return (
    <div className={`space-y-4 ${isReply ? "mr-8 border-r-2 border-primary/10 pr-4" : ""}`}>
      <div className={`bg-card border border-border rounded-3xl p-6 transition-all hover:shadow-md ${isAdminComment ? "ring-1 ring-primary/20 bg-primary/5" : ""}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdminComment ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
              {isAdminComment ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">{comment.user_name || "کاربر مرکز تک"}</h4>
                {isAdminComment && <span className="bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">مدیر</span>}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-foreground-muted mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!isReply && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= comment.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
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
        <div className="mr-8 bg-secondary/30 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-foreground-muted">
            <CornerDownLeft className="w-3 h-3" />
            در حال پاسخ به {comment.user_name}
          </div>
          <textarea
            value={replyTo.content}
            onChange={(e) => setReplyTo({ ...replyTo, content: e.target.value })}
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

