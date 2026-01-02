// مسیر: src/components/admin/AdminUsers.jsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  Users, Search, Filter, MoreVertical, 
  Shield, User, Wallet, Calendar, Phone,
  Edit, Trash2, Plus, X, Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState([]); // تنظیم آرایه خالی به عنوان مقدار اولیه
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // بارگذاری کاربران
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/list/");
      // اطمینان از اینکه داده‌ها به صورت آرایه دریافت شوند
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری کاربران");
      console.error(error);
      setUsers([]); // تنظیم آرایه خالی در صورت خطا
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کاربران - اطمینان از اینکه users یک آرایه است
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile?.includes(searchTerm);
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // حذف کاربر
  const handleDeleteUser = async (userId) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;
    
    try {
      await api.delete(`/users/list/${userId}/`);
      toast.success("کاربر با موفقیت حذف شد");
      fetchUsers();
    } catch (error) {
      toast.error("خطا در حذف کاربر");
    }
  };

  // ویرایش کاربر
  const handleEditUser = async (userData) => {
    try {
      await api.patch(`/users/list/${selectedUser.id}/`, userData);
      toast.success("اطلاعات کاربر بروزرسانی شد");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("خطا در بروزرسانی کاربر");
    }
  };

  // تنظیم موجودی کیف پول
  const handleWalletAdjust = async (userId, amount) => {
    try {
      await api.post("/users/wallet/adjust/", { user_id: userId, amount: amount });
      toast.success("موجودی کیف پول با موفقیت تغییر کرد");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "خطا در تغییر موجودی");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* هدر */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          مدیریت کاربران
        </h1>
        <div className="text-sm text-foreground-muted bg-secondary px-3 py-1 rounded-full">
          {filteredUsers.length} کاربر
        </div>
      </div>

      {/* فیلترها */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* جستجو */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام یا شماره موبایل..."
              className="w-full bg-secondary border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* فیلتر نقش */}
          <div className="relative">
            <Filter className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
            <select
              className="bg-secondary border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none min-w-[150px]"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">همه نقش‌ها</option>
              <option value="ADMIN">مدیر</option>
              <option value="CUSTOMER">مشتری</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-right p-4 font-bold text-foreground">کاربر</th>
                <th className="text-right p-4 font-bold text-foreground">نقش</th>
                <th className="text-right p-4 font-bold text-foreground">موجودی</th>
                <th className="text-right p-4 font-bold text-foreground">تاریخ عضویت</th>
                <th className="text-center p-4 font-bold text-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="پروفایل" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.full_name || "نام نامشخص"}</p>
                        <p className="text-sm text-foreground-muted flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.mobile}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                      user.role === 'ADMIN' 
                        ? 'bg-error/10 text-error border border-error/20' 
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'ADMIN' ? 'مدیر' : 'مشتری'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-foreground">
                      <Wallet className="w-4 h-4 text-foreground-muted" />
                      <span className="font-bold">{formatPrice(user.wallet_balance || 0)}</span>
                      <span className="text-xs text-foreground-muted">تومان</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-foreground-muted text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.date_joined).toLocaleDateString('fa-IR')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="حذف"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 text-foreground-muted">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>کاربری یافت نشد</p>
          </div>
        )}
      </div>

        {/* مودال ویرایش کاربر */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditUser}
            onWalletAdjust={handleWalletAdjust}
          />
        )}
    </div>
  );
}

// کامپوننت مودال ویرایش
function EditUserModal({ user, onClose, onSave, onWalletAdjust }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
  });
  const [walletAdjustAmount, setWalletAdjustAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleWalletChange = async (isIncrease) => {
    const amount = parseInt(walletAdjustAmount);
    if (!amount || amount <= 0) {
      toast.error("لطفاً مبلغ معتبر وارد کنید");
      return;
    }
    
    setWalletLoading(true);
    const finalAmount = isIncrease ? amount : -amount;
    await onWalletAdjust(user.id, finalAmount);
    setWalletAdjustAmount("");
    setWalletLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">ویرایش کاربر</h3>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="پروفایل" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-foreground-muted" />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground">{user.full_name || "نام نامشخص"}</p>
              <p className="text-sm text-foreground-muted">{user.mobile}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground-muted">موجودی فعلی:</span>
            </div>
            <span className="font-black text-lg text-primary">{formatPrice(user.wallet_balance || 0)} تومان</span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            تنظیم موجودی کیف پول
          </h4>
          <input
            type="number"
            placeholder="مبلغ (تومان)"
            className="w-full bg-card border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground mb-3"
            value={walletAdjustAmount}
            onChange={(e) => setWalletAdjustAmount(e.target.value)}
            min="1"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleWalletChange(true)}
              disabled={walletLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              افزایش
            </button>
            <button
              onClick={() => handleWalletChange(false)}
              disabled={walletLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              کاهش
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">نام کامل</label>
            <input
              type="text"
              className="w-full bg-secondary border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              ذخیره تغییرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-foreground py-2.5 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}