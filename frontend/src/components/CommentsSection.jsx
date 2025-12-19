// مسیر: src/components/CommentsSection.jsx
"use client";

import { useState } from "react";
import { MessageSquare, Star, Send, User, Clock, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns-jalali";

export default function CommentsSection({ productId, comments = [], onCommentSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("برای ثبت نظر ابتدا وارد حساب خود شوید");
      return;
    }
    if (!content.trim()) {
      toast.error("متن نظر نمی‌تواند خالی باشد");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/products/comments/", {
        product: productId,
        content,
        rating
      });
      toast.success("نظر شما ثبت شد و پس از تایید مدیر نمایش داده خواهد شد");
      setContent("");
      setRating(5);
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

      {/* فرم ثبت نظر */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
          <Send className="w-4 h-4 text-primary" />
          ثبت نظر جدید
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <MessageSquare className="w-12 h-12 text-foreground-muted mx-auto mb-3 opacity-20" />
            <p className="text-foreground-muted text-sm">هنوز نظری برای این محصول ثبت نشده است.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-3xl p-6 transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{comment.user_name || "کاربر مرکز تک"}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-foreground-muted mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= comment.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-foreground-muted text-sm leading-7">
                {comment.content}
              </p>
              {comment.is_approved && (
                <div className="mt-4 flex items-center gap-1.5 text-success text-[10px] font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  تایید شده توسط مرکز تک
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
