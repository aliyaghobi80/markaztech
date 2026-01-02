"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wallet, 
  User, 
  Calendar, 
  Eye, 
  X, 
  Image as ImageIcon 
} from "lucide-react";
import { toast } from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminWalletRequests() {
  const { data: serverRequests, error, mutate } = useSWR("/users/wallet-requests/", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 0,
    revalidateIfStale: true,
    revalidateOnMount: true,
    fallbackData: null
  });
  
  const [localRequests, setLocalRequests] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // Sync server data with local state
  useEffect(() => {
    if (serverRequests) {
      setLocalRequests(serverRequests);
    }
  }, [serverRequests]);

  // Use local requests if available, otherwise server requests
  const requests = localRequests || serverRequests;

  // گوش دادن به تغییرات ریل‌تایم برای آپدیت لیست ادمین
  useEffect(() => {
    const handleStatusChange = (event) => {
      console.log('Wallet request status changed:', event.detail);
      // Update local state
      if (localRequests) {
        const updatedRequests = localRequests.map(req => 
          req.id === event.detail.request_id 
            ? { ...req, status: event.detail.status, admin_note: event.detail.admin_note } 
            : req
        );
        setLocalRequests(updatedRequests);
      }
      // Also force refresh from server
      setTimeout(() => mutate(), 100);
    };

    const handleWebSocketMessage = (data) => {
      console.log('WebSocket message received:', data);
      if (data.type === 'wallet_request_update') {
        // Update local state immediately
        if (localRequests) {
          const updatedRequests = localRequests.map(req => 
            req.id === data.request_id 
              ? { ...req, status: data.status, admin_note: data.admin_note } 
              : req
          );
          setLocalRequests(updatedRequests);
        }
        // Also force refresh from server
        setTimeout(() => mutate(), 100);
      }
    };

    window.addEventListener('wallet_request_status_changed', handleStatusChange);
    
    // Listen to WebSocket messages directly
    if (window.globalWebSocket) {
      window.globalWebSocket.subscribe('admin-wallet-requests', handleWebSocketMessage);
    }

    return () => {
      window.removeEventListener('wallet_request_status_changed', handleStatusChange);
      if (window.globalWebSocket) {
        window.globalWebSocket.unsubscribe('admin-wallet-requests');
      }
    };
  }, [mutate, localRequests]);

  const handleApprove = async (id) => {
    if (!confirm("آیا از تایید این درخواست اطمینان دارید؟")) return;
    setProcessing(true);
    try {
      console.log('Approving request:', id);
      const formData = new FormData();
      formData.append('admin_note', adminNote);
      const response = await api.post(`/users/wallet-requests/${id}/approve/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Approve response:', response.data);
      
      // Update local state immediately
      if (localRequests) {
        const updatedRequests = localRequests.map(req => 
          req.id === id ? { ...req, status: 'approved', admin_note: adminNote } : req
        );
        setLocalRequests(updatedRequests);
      }
      
      toast.success("درخواست تایید شد و موجودی کاربر افزایش یافت");
      setSelectedRequest(null);
      setAdminNote("");
      
      // Force refresh from server after a short delay
      setTimeout(() => mutate(), 500);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.response?.data?.error || "خطا در تایید درخواست");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("آیا از رد این درخواست اطمینان دارید؟")) return;
    setProcessing(true);
    try {
      console.log('Rejecting request:', id);
      const formData = new FormData();
      formData.append('admin_note', adminNote || "درخواست توسط ادمین رد شد.");
      const response = await api.post(`/users/wallet-requests/${id}/reject/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Reject response:', response.data);
      
      // Update local state immediately
      if (localRequests) {
        const updatedRequests = localRequests.map(req => 
          req.id === id ? { ...req, status: 'rejected', admin_note: adminNote || "درخواست توسط ادمین رد شد." } : req
        );
        setLocalRequests(updatedRequests);
      }
      
      toast.success("درخواست رد شد");
      setSelectedRequest(null);
      setAdminNote("");
      
      // Force refresh from server after a short delay
      setTimeout(() => mutate(), 500);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.response?.data?.error || "خطا در رد درخواست");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "در انتظار بررسی", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", icon: Clock },
      approved: { label: "تایید شده", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", icon: CheckCircle },
      rejected: { label: "رد شده", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", icon: XCircle }
    };
    return configs[status] || configs.pending;
  };

  if (error) return <div className="text-center py-10 text-error">خطا در دریافت درخواست‌ها</div>;
  if (!requests) return <div className="text-center py-10 text-foreground-muted">در حال بارگذاری...</div>;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          درخواست‌های شارژ کیف پول
        </h1>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              {pendingCount} در انتظار
            </span>
          )}
          <span className="bg-secondary text-foreground-muted px-3 py-1 rounded-full text-xs">
            {requests.length} درخواست
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-right p-4 font-bold text-foreground">کاربر</th>
                <th className="text-right p-4 font-bold text-foreground">مبلغ</th>
                <th className="text-right p-4 font-bold text-foreground">وضعیت</th>
                <th className="text-right p-4 font-bold text-foreground">تاریخ</th>
                <th className="text-center p-4 font-bold text-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-foreground-muted">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>هیچ درخواستی ثبت نشده است</p>
                  </td>
                </tr>
              )}
              {requests.map((req) => {
                const statusConfig = getStatusConfig(req.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={req.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-foreground-muted" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{req.user_details?.full_name || req.user?.full_name || "نام نامشخص"}</p>
                          <p className="text-xs text-foreground-muted">{req.user_details?.mobile || req.user?.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-primary text-lg">{formatPrice(req.amount)}</span>
                      <span className="text-xs text-foreground-muted mr-1">تومان</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-foreground-muted text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(req.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="تایید"
                              disabled={processing}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="رد"
                              disabled={processing}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">جزئیات درخواست شارژ</h3>
              <button
                onClick={() => { setSelectedRequest(null); setAdminNote(""); }}
                className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-foreground-muted" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedRequest.user_details?.full_name || selectedRequest.user?.full_name || "نام نامشخص"}</p>
                  <p className="text-sm text-foreground-muted">{selectedRequest.user_details?.mobile || selectedRequest.user?.mobile}</p>
                  <p className="text-xs text-foreground-muted mt-1">
                    موجودی فعلی: <span className="font-bold text-primary">{formatPrice(selectedRequest.user_details?.wallet_balance || selectedRequest.user?.wallet_balance || 0)} تومان</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-foreground-muted mb-1">مبلغ درخواستی</p>
                  <p className="font-black text-xl text-primary">{formatPrice(selectedRequest.amount)} تومان</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-foreground-muted mb-1">تاریخ درخواست</p>
                  <p className="font-bold text-foreground">
                    {new Date(selectedRequest.created_at).toLocaleDateString('fa-IR', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {selectedRequest.receipt_image && (
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    تصویر رسید پرداخت
                  </p>
                  <img 
                    src={selectedRequest.receipt_image} 
                    alt="رسید پرداخت" 
                    className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(selectedRequest.receipt_image, '_blank')}
                  />
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">توضیحات ادمین (اختیاری)</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="توضیحات خود را وارد کنید..."
                    className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    rows="3"
                  />
                </div>
              )}

              {selectedRequest.admin_note && (
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="text-xs text-foreground-muted mb-1">توضیحات ادمین</p>
                  <p className="text-foreground">{selectedRequest.admin_note}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    تایید و شارژ کیف پول
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    رد درخواست
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
