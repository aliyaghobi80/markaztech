"use client";

import { useState, useEffect } from "react";
import { User, MessageSquare, Send, CornerDownLeft, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function ArticleComments({ articleId, initialComments: propComments = [], onRefresh }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(propComments);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setComments(propComments);
  }, [propComments]);

  // WebSocket for real-time comments
  useEffect(() => {
    if (!articleId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/articles/${articleId}/comments/`;
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
          
          // If it's a reply, find the parent
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
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("برای ثبت نظر باید وارد حساب خود شوید");
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/articles/comments/", {
        article: articleId,
        content: content,
        parent: replyTo?.id || null
      });
      
      toast.success(user.is_staff || replyTo ? "نظر شما ثبت شد" : "نظر شما ثبت شد و پس از تایید نمایش داده می‌شود");
      setContent("");
      setReplyTo(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`relative ${isReply ? 'mr-8 md:mr-12 mt-4' : 'mb-8'}`}>
      {isReply && (
        <div className="absolute -right-6 top-4 w-4 h-4 border-r-2 border-b-2 border-border rounded-br-lg"></div>
      )}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary overflow-hidden border border-border">
                {comment.user_avatar ? (
                  <img src={comment.user_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{comment.user_name}</span>
                {comment.user_is_staff && (
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    مدیر
                  </span>
                )}
              </div>
              <span className="text-[10px] text-foreground-muted">{comment.created_at_human}</span>
            </div>
          </div>
          {!isReply && user && (
            <button 
              onClick={() => {
                setReplyTo(comment);
                document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <CornerDownLeft className="w-3 h-3" />
              پاسخ
            </button>
          )}
        </div>
        
        <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {!comment.is_approved && comment.user === user?.id && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-yellow-500 font-bold bg-yellow-500/5 px-2 py-1 rounded-md w-fit">
            <Loader2 className="w-3 h-3 animate-spin" />
            در انتظار تایید مدیریت
          </div>
        )}
      </div>

      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground">نظرات کاربران</h2>
          <p className="text-sm text-foreground-muted">تجربیات خود را با دیگران به اشتراک بگذارید</p>
        </div>
      </div>

      {/* Form */}
      <div id="comment-form" className="bg-card border border-border rounded-3xl p-6 mb-12 shadow-sm">
        {replyTo && (
          <div className="mb-4 flex items-center justify-between bg-primary/5 border border-primary/10 p-3 rounded-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 text-sm">
              <CornerDownLeft className="w-4 h-4 text-primary" />
              <span className="text-foreground-muted">در پاسخ به:</span>
              <span className="font-bold text-foreground">{replyTo.user_name}</span>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-[10px] bg-secondary hover:bg-secondary-hover px-2 py-1 rounded-md transition-colors">
              انصراف
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-secondary border border-border rounded-2xl p-4 min-h-[120px] outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-foreground-muted transition-all resize-none mb-4"
            placeholder={user ? "نظر خود را اینجا بنویسید..." : "برای ثبت نظر باید وارد حساب خود شوید"}
            disabled={!user || submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-foreground-muted max-w-md">
              نظرات پس از تایید توسط مدیریت در سایت نمایش داده می‌شوند. پاسخ به نظرات به صورت خودکار تایید می‌گردد.
            </p>
            <button
              type="submit"
              disabled={!user || submitting || !content.trim()}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              ثبت نظر
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-3xl border border-dashed border-border">
            <MessageSquare className="w-12 h-12 text-foreground-muted/20 mx-auto mb-3" />
            <p className="text-foreground-muted text-sm">هنوز نظری ثبت نشده است. شما اولین نفر باشید!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
