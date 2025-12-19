// مسیر: src/components/admin/AdminComments.jsx
"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { MessageSquare, CheckCircle, XCircle, Trash2, Loader2, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns-jalali";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminComments() {
  const { data: comments, mutate, isLoading } = useSWR("/products/comments/", fetcher);

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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black text-foreground flex items-center gap-2 mb-6">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        مدیریت نظرات
      </h1>

      <div className="space-y-4">
        {comments?.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground-muted">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{comment.user_name || "کاربر ناشناس"} ({comment.user_mobile})</h3>
                    <p className="text-[10px] text-foreground-muted">برای محصول: <span className="font-bold text-primary">{comment.product_title}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    comment.is_approved ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {comment.is_approved ? "تایید شده" : "در انتظار تایید"}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-foreground-muted leading-relaxed">{comment.content}</p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                {!comment.is_approved ? (
                  <button 
                    onClick={() => handleApprove(comment.id)}
                    className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-success/90 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تایید نظر
                  </button>
                ) : (
                  <button 
                    onClick={() => handleReject(comment.id)}
                    className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    لغو تایید
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1.5 bg-error/10 text-error px-4 py-2 rounded-xl text-xs font-bold hover:bg-error/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
            <p className="text-foreground-muted">نظری برای مدیریت وجود ندارد</p>
          </div>
        )}
      </div>
    </div>
  );
}
