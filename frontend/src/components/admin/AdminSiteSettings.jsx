"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import { 
  Settings, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Mail, 
  Phone, 
  Save, 
  Upload,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function AdminSiteSettings() {
  const { data: settings, error, mutate } = useSWR("/users/site-settings/", fetcher);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [heroLogoFile, setHeroLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [heroLogoPreview, setHeroLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || ''
      });
      setLogoPreview(settings.site_logo_url);
      setHeroLogoPreview(settings.hero_logo_url);
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'site_logo') {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setHeroLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setHeroLogoPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add logo files if selected
      if (logoFile) {
        console.log('Adding site_logo file:', logoFile.name);
        submitData.append('site_logo', logoFile);
      }
      if (heroLogoFile) {
        console.log('Adding hero_logo file:', heroLogoFile.name);
        submitData.append('hero_logo', heroLogoFile);
      }

      console.log('Submitting form data...');
      const response = await api.put("/users/site-settings/", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', response.data);
      toast.success("تنظیمات با موفقیت ذخیره شد!");
      mutate(); // Refresh data
      setLogoFile(null);
      setHeroLogoFile(null);
    } catch (error) {
      toast.error("خطا در ذخیره تنظیمات");
      console.error("Settings save error:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (error) return (
    <div className="text-center py-10">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p className="text-red-500">خطا در دریافت تنظیمات</p>
    </div>
  );

  if (!settings) return (
    <div className="text-center py-10">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-foreground-muted">در حال بارگذاری تنظیمات...</p>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'عمومی', icon: Settings },
    { id: 'branding', label: 'برندینگ', icon: Palette },
    { id: 'contact', label: 'تماس', icon: Phone }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          تنظیمات سایت
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            مشاهده سایت
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary/50 p-1 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-foreground-muted hover:bg-secondary hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">تنظیمات عمومی</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نام سایت
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="مرکزتک"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  توضیحات سایت
                </label>
                <textarea
                  name="site_description"
                  value={formData.site_description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                  placeholder="توضیحات کوتاه درباره سایت..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">برندینگ و لوگو</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Logo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  لوگوی اصلی سایت
                </label>
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="w-32 h-32 bg-secondary rounded-xl border border-border overflow-hidden">
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoChange(e, 'site_logo')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                      <Upload className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                      <p className="text-sm text-foreground-muted">
                        کلیک کنید یا فایل را بکشید
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Logo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  لوگوی بخش هیرو
                </label>
                <div className="space-y-4">
                  {heroLogoPreview && (
                    <div className="w-32 h-32 bg-secondary rounded-xl border border-border overflow-hidden">
                      <img 
                        src={heroLogoPreview} 
                        alt="Hero Logo Preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoChange(e, 'hero_logo')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                      <Upload className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                      <p className="text-sm text-foreground-muted">
                        کلیک کنید یا فایل را بکشید
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">اطلاعات تماس</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ایمیل تماس
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="info@markaztech.ir"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="0917 432 0243"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </form>
    </div>
  );
}