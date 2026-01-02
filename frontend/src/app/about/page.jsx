"use client";

import { useState, useEffect } from "react";
import { 
  Users, Target, Award, Heart, Star, 
  CheckCircle, ArrowRight, Mail, Phone, 
  MapPin, Clock, Shield, Zap, Globe,
  TrendingUp, Sparkles, Building2, Youtube, Instagram, Send
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'مرکزتک',
    site_description: 'فروشگاه آنلاین محصولات دیجیتال و فناوری'
  });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await api.get("/users/site-settings/");
        setSiteSettings(response.data);
      } catch (error) {
        console.error("Error fetching site settings");
      }
    };

    fetchSiteSettings();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "امنیت بالا",
      description: "تمام اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود"
    },
    {
      icon: Zap,
      title: "سرعت بالا",
      description: "تجربه خرید سریع و روان با بهترین تکنولوژی‌های روز دنیا"
    },
    {
      icon: Heart,
      title: "پشتیبانی ۲۴/۷",
      description: "تیم پشتیبانی ما همیشه آماده کمک به شما هستند"
    },
    {
      icon: Globe,
      title: "دسترسی جهانی",
      description: "خدمات ما در سراسر جهان قابل دسترسی است"
    }
  ];

  const stats = [
    { number: "10K+", label: "مشتری راضی", icon: Users },
    { number: "500+", label: "محصول متنوع", icon: Award },
    { number: "99%", label: "رضایت مشتری", icon: Star },
    { number: "24/7", label: "پشتیبانی", icon: Clock }
  ];

  const team = [
    {
      name: "علی احمدی",
      role: "مدیر عامل",
      description: "با بیش از ۱۰ سال تجربه در حوزه فناوری"
    },
    {
      name: "سارا محمدی",
      role: "مدیر فنی",
      description: "متخصص توسعه نرم‌افزار و معماری سیستم"
    },
    {
      name: "حسین رضایی",
      role: "مدیر فروش",
      description: "کارشناس بازاریابی دیجیتال و روابط مشتریان"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              درباره {siteSettings.site_name}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              ما کیستیم؟
            </h1>
            
            <p className="text-lg md:text-xl text-foreground-muted mb-8 leading-relaxed">
              {siteSettings.site_description || 'ما یک تیم پرشور از متخصصان فناوری هستیم که با هدف ارائه بهترین محصولات و خدمات دیجیتال، تجربه‌ای بی‌نظیر برای شما فراهم می‌کنیم.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                مشاهده محصولات
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#contact" 
                className="inline-flex items-center gap-2 bg-secondary text-foreground px-8 py-4 rounded-xl font-bold hover:bg-secondary/80 transition-all border border-border hover:border-primary/30"
              >
                تماس با ما
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-secondary/30 to-secondary/10 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black text-primary mb-2">{stat.number}</div>
                <div className="text-sm font-bold text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Target className="w-4 h-4" />
                ماموریت ما
              </div>
              <h2 className="text-3xl font-black mb-6">
                ارائه بهترین تجربه خرید آنلاین
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-6">
                ما متعهد هستیم که با ارائه محصولات باکیفیت، خدمات مطمئن و پشتیبانی عالی، 
                تجربه‌ای فراموش‌نشدنی برای مشتریان خود ایجاد کنیم. هدف ما ساخت پلی میان 
                نیازهای شما و بهترین راه‌حل‌های موجود است.
              </p>
              <div className="space-y-3">
                {[
                  "کیفیت بالای محصولات",
                  "قیمت‌های رقابتی و منصفانه", 
                  "ارسال سریع و ایمن",
                  "پشتیبانی حرفه‌ای"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl p-8 border border-border">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <TrendingUp className="w-4 h-4" />
                  چشم‌انداز ما
                </div>
                <h3 className="text-2xl font-black mb-4">
                  پیشرو در دنیای دیجیتال
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  چشم‌انداز ما تبدیل شدن به پیشروترین پلتفرم فروش آنلاین در منطقه است. 
                  ما می‌خواهیم با بهره‌گیری از جدیدترین فناوری‌ها و نوآوری‌های روز دنیا، 
                  استانداردهای جدیدی در صنعت تجارت الکترونیک تعریف کنیم.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-r from-secondary/20 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">چرا ما را انتخاب کنید؟</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              ویژگی‌هایی که ما را از سایر رقبا متمایز می‌کند
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Users className="w-4 h-4" />
              تیم ما
            </div>
            <h2 className="text-3xl font-black mb-4">متخصصان حرفه‌ای</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              تیمی از بهترین متخصصان که با تجربه و تخصص خود، خدمات باکیفیت ارائه می‌دهند
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-lg text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black group-hover:scale-110 transition-transform">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold mb-2">{member.name}</h3>
                <div className="text-primary font-bold text-sm mb-3">{member.role}</div>
                <p className="text-foreground-muted text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-primary/5 to-blue-500/5 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">با ما در تماس باشید</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              سوال، پیشنهاد یا نظری دارید؟ ما همیشه آماده شنیدن صدای شما هستیم
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <a 
              href="mailto:info@markaztech.com"
              className="bg-card rounded-2xl p-6 border border-border text-center hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-green-500/10 group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">ایمیل</h3>
              <p className="text-foreground-muted text-sm">info@markaztech.com</p>
            </a>
            
            <a 
              href="tel:+989174320243"
              className="bg-card rounded-2xl p-6 border border-border text-center hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">تلفن</h3>
              <p className="text-foreground-muted text-sm">۰۹۱۷-۴۳۲-۰۲۴۳</p>
            </a>
            
            <div className="bg-card rounded-2xl p-6 border border-border text-center hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">دفتر مرکزی</h3>
              <p className="text-foreground-muted text-sm">شیراز، ایران</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">ما را در شبکه‌های اجتماعی دنبال کنید</h3>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <a 
                  href="https://t.me/markaztech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  تلگرام
                </a>
                <a 
                  href="https://instagram.com/markaztech_official" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-pink-500/25 text-sm sm:text-base"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  اینستاگرام
                </a>
                <a 
                  href="https://www.youtube.com/@markaztech-2000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base"
                >
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                  یوتوب
                </a>
              </div>
            </div>
            
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              شروع خرید
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}