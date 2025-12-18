// مسیر: src/components/admin/AdminUsers.jsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  Users, Search, Filter, MoreVertical, 
  Shield, User, Wallet, Calendar, Phone,
  Edit, Trash2, Plus, X
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
                        {user.avatar ? (
                          <img src={user.avatar} alt="پروفایل" className="w-full h-full object-cover" />
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
        />
      )}
    </div>
  );
}

// کامپوننت مودال ویرایش
function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    role: user.role || "CUSTOMER",
    wallet_balance: user.wallet_balance || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">ویرایش کاربر</h3>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">نقش</label>
            <select
              className="w-full bg-secondary border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="CUSTOMER">مشتری</option>
              <option value="ADMIN">مدیر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">موجودی کیف پول (تومان)</label>
            <input
              type="number"
              className="w-full bg-secondary border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
              value={formData.wallet_balance}
              onChange={(e) => setFormData({ ...formData, wallet_balance: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary py-2.5 rounded-xl"
            >
              ذخیره تغییرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2.5 rounded-xl"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}