"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { 
  Wallet, CheckCircle, XCircle, Clock, 
  User, Phone, Calendar, Image, Eye, X,
  Search, Filter
} from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminWalletRequests() {
  const { data: requests, error, mutate } = useSWR("/users/wallet/topup/", fetcher, { refreshInterval: 5000 });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedImage, setSelectedImage] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/users/wallet/topup/${id}/approve/`, { admin_note: adminNote });
      toast.success("درخواست تایید شد و موجودی کاربر افزایش یافت");
      setAdminNote("");
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.error || "خطا در تایید درخواست");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/users/wallet/topup/${id}/reject/`, { admin_note: adminNote || "رد شده توسط ادمین" });
      toast.success("درخواست رد شد");
      setAdminNote("");
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.error || "خطا در رد درخواست");
    } finally {
      setProcessingId(null);
    }
  };

  if (error) return <div className="text-center py-10 text-error">خطا در دریافت درخواست‌ها</div>;
  if (!requests) return <div className="text-center py-10 text-foreground-muted">در حال بارگذاری...</div>;

  const filteredRequests = filterStatus === "ALL" 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          درخواست‌های شارژ کیف پول
        </h1>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {pendingCount} در انتظار
            </span>
          )}
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {requests.length} درخواست
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-foreground-muted" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-secondary border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="ALL">همه درخواست‌ها</option>
            <option value="PENDING">در انتظار بررسی</option>
            <option value="APPROVED">تایید شده</option>
            <option value="REJECTED">رد شده</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 text-foreground-muted bg-card rounded-2xl border border-dashed border-border">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">درخواستی یافت نشد</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    request.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                    request.status === 'APPROVED' ? 'bg-success/10 text-success' :
                    'bg-error/10 text-error'
                  }`}>
                    {request.status === 'PENDING' ? <Clock className="w-7 h-7" /> :
                     request.status === 'APPROVED' ? <CheckCircle className="w-7 h-7" /> :
                     <XCircle className="w-7 h-7" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-foreground-muted" />
                      <span className="font-bold text-foreground">{request.user?.full_name || "بدون نام"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {request.user?.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="text-2xl font-black text-primary">{formatPrice(request.amount)}</p>
                    <p className="text-xs text-foreground-muted">تومان</p>
                  </div>

                  <button
                    onClick={() => setSelectedImage(request.receipt_image)}
                    className="p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                    title="مشاهده رسید"
                  >
                    <Image className="w-5 h-5 text-foreground-muted" />
                  </button>

                  {request.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        تایید
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        رد
                      </button>
                    </div>
                  )}

                  {request.status !== 'PENDING' && (
                    <StatusBadge status={request.status} />
                  )}
                </div>
              </div>

              {request.admin_note && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-xl text-sm text-foreground-muted">
                  <span className="font-medium">یادداشت ادمین:</span> {request.admin_note}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-card rounded-2xl p-4 max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">تصویر رسید پرداخت</h3>
              <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={selectedImage.startsWith('http') ? selectedImage : `http://127.0.0.1:8000${selectedImage}`} 
              alt="رسید پرداخت" 
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: { bg: "bg-warning/10", text: "text-warning", label: "در انتظار بررسی" },
    APPROVED: { bg: "bg-success/10", text: "text-success", label: "تایید شده" },
    REJECTED: { bg: "bg-error/10", text: "text-error", label: "رد شده" },
  };

  const style = styles[status] || { bg: "bg-secondary", text: "text-foreground-muted", label: status };

  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
