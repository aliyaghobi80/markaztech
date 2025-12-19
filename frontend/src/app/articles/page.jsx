"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Calendar, User, ChevronLeft, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get("/articles/");
        setArticles(response.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              مقالات و آموزش‌ها
            </h1>
            <p className="text-foreground-muted">آخرین اخبار دنیای تکنولوژی و هوش مصنوعی</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <BookOpen className="w-16 h-16 text-foreground-muted/30 mx-auto mb-4" />
            <p className="text-foreground-muted font-bold">هنوز مقاله‌ای منتشر نشده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.slug}`}
                className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-primary transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={article.image || "/placeholder-article.jpg"} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-foreground-muted mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {article.created_at_human}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {article.author_name}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-black text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-sm text-foreground-muted line-clamp-3 mb-6 flex-1">
                    {article.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className="text-primary font-bold text-sm flex items-center gap-1">
                      ادامه مطلب
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </span>
                    <div className="bg-secondary px-3 py-1 rounded-full text-[10px] font-bold text-foreground-muted">
                      {article.comments_count} دیدگاه
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
