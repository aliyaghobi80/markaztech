// مسیر: src/components/ProfileEditModal.jsx
"use client";

import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { 
  X, User, Phone, Mail, Calendar, 
  Upload, Camera, Save, Loader2 
} from "lucide-react";

export default function ProfileEditModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    birth_date: user.birth_date || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      // اضافه کردن فیلدهای متنی
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // اضافه کردن فایل آواتار
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const response = await api.patch("/users/profile/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("پروفایل با موفقیت بروزرسانی شد");
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMsg = error.response?.data?.detail || "خطا در بروزرسانی پروفایل";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">ویرایش پروفایل</h2>
              <p className="text-sm text-foreground-muted">اطلاعات شخصی خود را بروزرسانی کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* آپلود آواتار */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-4 border-border">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="پیش‌نمایش آواتار" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-foreground-muted" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-foreground-muted">
              برای تغییر عکس پروفایل کلیک کنید (حداکثر 5MB)
            </p>
          </div>

          {/* نام کامل */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              نام و نام خانوادگی
            </label>
            <div className="relative">
              <User className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
              <input
                type="text"
                className="w-full bg-secondary border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="نام کامل خود را وارد کنید"
              />
            </div>
          </div>

          {/* شماره موبایل (غیرقابل تغییر) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              شماره موبایل
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
              <input
                type="text"
                className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none text-foreground-muted cursor-not-allowed"
                value={user.mobile}
                disabled
              />
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              شماره موبایل قابل تغییر نیست
            </p>
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ایمیل (اختیاری)
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
              <input
                type="email"
                className="w-full bg-secondary border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* تاریخ تولد */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              تاریخ تولد (اختیاری)
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-3 text-foreground-muted w-5 h-5" />
              <input
                type="date"
                className="w-full bg-secondary border border-border rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  ذخیره تغییرات
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}