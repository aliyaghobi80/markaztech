// مسیر: src/app/articles/page.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import Link from "next/link";
import { Calendar, User, Eye, ArrowLeft, FileText } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const fetcher = (url) => api.get(url).then((res) => res.data.results || res.data);

export default function ArticlesPage() {
  const { data: articles, isLoading } = useSWR("/articles/", fetcher);
  const { data: categories } = useSWR("/products/categories/?flat=true", fetcher);
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredArticles = articles?.filter(article => 
    !selectedCategory || article.category?.id === parseInt(selectedCategory)
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground-muted text-sm font-medium">در حال بارگذاری مقالات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-foreground mb-4">مقالات و آموزش‌ها</h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            آخرین مقالات، آموزش‌ها و اخبار دنیای تکنولوژی را در اینجا مطالعه کنید
          </p>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-foreground-muted hover:bg-secondary/80'
              }`}
            >
              همه مقالات
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCategory === category.id.toString()
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-foreground-muted hover:bg-secondary/80'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-foreground-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-foreground-muted">
              {selectedCategory ? 'در این دسته‌بندی مقاله‌ای وجود ندارد.' : 'هنوز مقاله‌ای منتشر نشده است.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article key={article.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                
                {/* Article Image */}
                <div className="relative aspect-video overflow-hidden">
                  {article.image ? (
                    <img 
                      src={getImageUrl(article.image)} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {article.category && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                        {article.category_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-6">
                  
                  {/* Article Meta */}
                  <div className="flex items-center gap-4 text-sm text-foreground-muted mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author_name || 'نامشخص'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {article.created_at_human || new Date(article.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>

                  {/* Article Excerpt */}
                  <div 
                    className="text-foreground-muted text-sm line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ 
                      __html: article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                    }}
                  />

                  {/* Read More Link */}
                  <Link 
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                  >
                    ادامه مطلب
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredArticles.length > 0 && filteredArticles.length % 9 === 0 && (
          <div className="text-center mt-12">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              مشاهده مقالات بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}