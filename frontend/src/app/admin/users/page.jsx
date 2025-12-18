"use client";

import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { Users, Search, Edit, Trash2, Wallet, Shield, ShieldCheck, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function AdminUsersPage() {
  const { data: users, error, mutate, isLoading } = useSWR("/users/list/", fetcher, {
    refreshInterval: 10000
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [walletModal, setWalletModal] = useState({ open: false, user: null });
  const [walletAmount, setWalletAmount] = useState("");
  const [adjustingWallet, setAdjustingWallet] = useState(false);

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`آیا از حذف کاربر "${name}" مطمئن هستید؟`)) return;
    
    try {
      await api.delete(`/users/list/${id}/`);
      toast.success("کاربر حذف شد");
      mutate();
    } catch (err) {
      toast.error("خطا در حذف کاربر");
    }
  };

  const handleWalletAdjust = async () => {
    if (!walletAmount || isNaN(walletAmount)) {
      toast.error("مبلغ معتبر وارد کنید");
      return;
    }

    setAdjustingWallet(true);
    try {
      await api.post("/users/wallet/adjust/", {
        user_id: walletModal.user.id,
        amount: parseInt(walletAmount)
      });
      toast.success("موجودی کیف پول تغییر کرد");
      setWalletModal({ open: false, user: null });
      setWalletAmount("");
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.error || "خطا در تغییر موجودی");
    } finally {
      setAdjustingWallet(false);
    }
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center py-20">در حال بارگذاری لیست کاربران...</div>;
  if (error) return <div className="text-center py-20 text-error">خطا در بارگذاری کاربران</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">مدیریت کاربران</h1>
          <p className="text-foreground-muted text-sm">لیست تمام کاربران سایت ({users?.length || 0} کاربر)</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input
            type="text"
            placeholder="جستجو نام، موبایل یا ایمیل..."
            className="w-full bg-card border border-border rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">آواتار</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">نام کامل</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">موبایل</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">ایمیل</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">نقش</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground-muted">کیف پول</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-foreground-muted">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-foreground-muted" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-foreground">
                    {user.full_name || "بدون نام"}
                  </td>
                  <td className="px-6 py-3 text-foreground-muted font-mono">
                    {user.mobile}
                  </td>
                  <td className="px-6 py-3 text-foreground-muted text-sm">
                    {user.email || "-"}
                  </td>
                  <td className="px-6 py-3">
                    {user.role === 'ADMIN' || user.is_staff ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md text-xs font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        ادمین
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-xs font-bold">
                        <Shield className="w-3 h-3" />
                        کاربر
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 font-bold text-primary">
                    {formatPrice(user.wallet_balance || 0)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setWalletModal({ open: true, user })}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="تنظیم کیف پول"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="حذف"
                        disabled={user.role === 'ADMIN' || user.is_staff}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
        {filteredUsers?.map((user) => (
          <div key={user.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-foreground-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground truncate">{user.full_name || "بدون نام"}</h3>
                  {(user.role === 'ADMIN' || user.is_staff) && (
                    <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-foreground-muted text-sm font-mono">{user.mobile}</p>
                {user.email && <p className="text-foreground-muted text-xs truncate">{user.email}</p>}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div>
                <span className="text-xs text-foreground-muted">کیف پول:</span>
                <span className="font-bold text-primary mr-1">{formatPrice(user.wallet_balance || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWalletModal({ open: true, user })}
                  className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.full_name)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                  disabled={user.role === 'ADMIN' || user.is_staff}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>کاربری یافت نشد</p>
        </div>
      )}

      {/* Wallet Modal */}
      {walletModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">تنظیم کیف پول</h3>
            <p className="text-foreground-muted mb-4">
              کاربر: <span className="font-bold text-foreground">{walletModal.user?.full_name}</span>
            </p>
            <p className="text-foreground-muted mb-4">
              موجودی فعلی: <span className="font-bold text-primary">{formatPrice(walletModal.user?.wallet_balance || 0)}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                مبلغ (تومان) - مثبت برای افزایش، منفی برای کاهش
              </label>
              <input
                type="number"
                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="مثال: 50000 یا -20000"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleWalletAdjust}
                disabled={adjustingWallet}
                className="flex-1 btn-primary py-3 rounded-xl"
              >
                {adjustingWallet ? "در حال اعمال..." : "اعمال تغییرات"}
              </button>
              <button
                onClick={() => {
                  setWalletModal({ open: false, user: null });
                  setWalletAmount("");
                }}
                className="flex-1 btn-secondary py-3 rounded-xl"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
