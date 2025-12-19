// مسیر: src/components/UserComments.jsx
"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { MessageSquare, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns-jalali";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function UserComments() {
  const { data: comments, error, isLoading } = useSWR("/products/comments/", fetcher);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black text-foreground flex items-center gap-2 mb-6">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        نظرات من
      </h1>

      {comments?.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">برای محصول: {comment.product_title}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                  comment.is_approved 
                  ? "bg-success/10 text-success border border-success/20" 
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}>
                  {comment.is_approved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {comment.is_approved ? "تایید شده" : "در انتظار تایید"}
                </span>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed mb-4">{comment.content}</p>
              <div className="flex items-center gap-2 text-[10px] text-foreground-muted border-t border-border pt-4">
                <Clock className="w-3 h-3" />
                <span>ثبت شده در {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-foreground-muted" />
          <p className="text-foreground-muted">شما هنوز نظری ثبت نکرده‌اید</p>
        </div>
      )}
    </div>
  );
}
