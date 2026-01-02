"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Archive, 
  File,
  Calendar,
  Package
} from "lucide-react";

const fetcher = (url) => api.get(url).then((res) => res.data);

const getFileIcon = (fileType) => {
  if (!fileType) return File;
  
  const type = fileType.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) return ImageIcon;
  if (['mp3', 'wav', 'flac', 'aac'].includes(type)) return Music;
  if (['zip', 'rar', '7z', 'tar'].includes(type)) return Archive;
  if (['pdf', 'doc', 'docx', 'txt'].includes(type)) return FileText;
  return File;
};

export default function UserDownloads() {
  const { data: orders, error, isLoading } = useSWR("/orders/", fetcher);
  const [downloading, setDownloading] = useState({});

  // Filter orders to get only paid orders with file products
  const fileOrders = orders?.filter(order => 
    ['paid', 'sent', 'PAID', 'SENT'].includes(order.status) && 
    order.items?.some(item => item.product?.product_type === 'file')
  ) || [];

  const handleDownload = async (product) => {
    setDownloading(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const response = await api.get(`/products/${product.slug}/download/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${product.title}.${product.file_type || 'file'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("دانلود شروع شد");
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("شما مجاز به دانلود این فایل نیستید");
      } else {
        toast.error("خطا در دانلود فایل");
      }
    } finally {
      setDownloading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className="h-4 bg-secondary rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-secondary rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">خطا در دریافت فایل‌ها</p>
      </div>
    );
  }

  if (fileOrders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 text-foreground-muted mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-foreground mb-2">فایلی برای دانلود وجود ندارد</h3>
        <p className="text-foreground-muted mb-6">
          هنوز هیچ محصول فایلی خریداری نکرده‌اید
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground">فایل‌های قابل دانلود</h2>
        <span className="text-sm text-foreground-muted">
          {fileOrders.reduce((acc, order) => acc + order.items.filter(item => item.product?.product_type === 'file').length, 0)} فایل
        </span>
      </div>

      <div className="grid gap-4">
        {fileOrders.map(order => (
          <div key={order.id} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">سفارش #{order.id}</h3>
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.created_at).toLocaleDateString('fa-IR')}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                ['paid', 'PAID'].includes(order.status) ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {['paid', 'PAID'].includes(order.status) ? 'پرداخت شده' : 'ارسال شده'}
              </span>
            </div>

            <div className="space-y-3">
              {order.items
                .filter(item => item.product?.product_type === 'file')
                .map(item => {
                  const FileIcon = getFileIcon(item.product.file_type);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{item.product.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-foreground-muted">
                            {item.product.file_type && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium uppercase">
                                {item.product.file_type}
                              </span>
                            )}
                            {item.product.file_size && (
                              <span>{item.product.file_size}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(item.product)}
                        disabled={downloading[item.product.id]}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        {downloading[item.product.id] ? 'در حال دانلود...' : 'دانلود'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}