"use client";

import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function TestUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [orderId, setOrderId] = useState("14"); // تست با آخرین سفارش
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!file) {
      toast.error("لطفا فایل انتخاب کنید");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("payment_receipt", file);

    try {
      const response = await api.post(`/orders/${orderId}/upload_receipt/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Success:", response.data);
      toast.success("آپلود موفق!");
      
    } catch (error) {
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      toast.error("خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto bg-card p-6 rounded-xl border border-border">
        <h1 className="text-xl font-bold text-foreground mb-4">تست آپلود فیش</h1>
        
        {user ? (
          <div className="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm">
            ✅ لاگین شده: {user.full_name || user.mobile}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm">
            ❌ لاگین نشده - <a href="/login" className="underline">ورود</a>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">شماره سفارش:</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-secondary text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">انتخاب فایل:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border border-border rounded-lg bg-secondary text-foreground"
            />
          </div>
          
          {file && (
            <div className="text-sm text-foreground-muted">
              <p>نام فایل: {file.name}</p>
              <p>حجم: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>نوع: {file.type}</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? "در حال آپلود..." : "آپلود"}
          </button>
        </div>
      </div>
    </div>
  );
}