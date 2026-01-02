// مسیر: src/app/articles/[slug]/page.jsx
"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/axios";
import Link from "next/link";
import { 
  Calendar, User, ArrowRight, Share2, Eye, 
  MessageSquare, FileText, Clock 
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { data: article, error, isLoading } = useSWR(slug ? `/articles/${slug}/` : null, fetcher);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground-muted text-sm font-medium">در حال بارگذاری مقاله...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <FileText className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-foreground">مقاله یافت نشد!</h1>
        <Link href="/articles" className="text-primary hover:underline">بازگشت به لیست مقالات</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Article Header */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-primary transition-colors">مقالات</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{article.title}</span>
          </nav>

          {/* Back Button */}
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به مقالات
          </Link>

          {/* Article Title */}
          <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-foreground-muted mb-8">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{article.author_name || 'نامشخص'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{article.created_at_human || new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
            {article.category && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {article.category_name}
                </span>
              </div>
            )}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("لینک مقاله کپی شد");
              }}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" />
              اشتراک گذاری
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Article Image */}
            {article.image && (
              <div className="mb-8">
                <img 
                  src={getImageUrl(article.image)} 
                  alt={article.title}
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
              <div 
                className="prose prose-lg max-w-none text-foreground 
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:shadow-lg 
                [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg [&_video]:my-4 
                [&_audio]:w-full [&_audio]:my-4
                [&_.rounded-image]:rounded-full
                [&_.shadow-image]:shadow-xl
                [&_.bordered-image]:border-4 [&_.bordered-image]:border-primary [&_.bordered-image]:p-1
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                [&_th]:bg-secondary [&_th]:p-3 [&_th]:border [&_th]:border-border [&_th]:font-bold
                [&_td]:p-3 [&_td]:border [&_td]:border-border
                [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-secondary/30 [&_blockquote]:p-4 [&_blockquote]:my-4 [&_blockquote]:italic
                [&_code]:bg-secondary [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                [&_pre]:bg-secondary [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-6 [&_h1]:text-foreground
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-5 [&_h2]:text-foreground
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-4 [&_h3]:text-foreground
                [&_h4]:text-lg [&_h4]:font-bold [&_h4]:my-3 [&_h4]:text-foreground
                [&_h5]:text-base [&_h5]:font-bold [&_h5]:my-2 [&_h5]:text-foreground
                [&_h6]:text-sm [&_h6]:font-bold [&_h6]:my-2 [&_h6]:text-foreground
                [&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-4 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-4 [&_ol]:space-y-2
                [&_li]:text-foreground
                [&_a]:text-primary [&_a]:hover:underline
                [&_strong]:font-bold [&_strong]:text-foreground
                [&_em]:italic [&_em]:text-foreground"
                style={{ direction: 'rtl', textAlign: 'right' }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Author Note */}
            {article.author_note && (
              <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  نکته نویسنده
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {article.author_note}
                </p>
              </div>
            )}

            {/* Related Articles */}
            {article.related_articles_detail && article.related_articles_detail.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">مقالات مرتبط</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.related_articles_detail.map((relatedArticle) => (
                    <Link 
                      key={relatedArticle.id}
                      href={`/articles/${relatedArticle.slug}`}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {relatedArticle.image ? (
                          <img 
                            src={getImageUrl(relatedArticle.image)} 
                            alt={relatedArticle.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-sm text-foreground-muted">
                            {new Date(relatedArticle.created_at).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* Author Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">درباره نویسنده</h3>
                <div className="flex items-center gap-4 mb-4">
                  {article.author_avatar ? (
                    <img 
                      src={getImageUrl(article.author_avatar)} 
                      alt={article.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-foreground">{article.author_name || 'نامشخص'}</h4>
                    <p className="text-sm text-foreground-muted">نویسنده</p>
                  </div>
                </div>
                {article.author_bio && (
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {article.author_bio}
                  </p>
                )}
              </div>

              {/* Article Stats */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">آمار مقاله</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاریخ انتشار
                    </span>
                    <span className="text-foreground font-medium">
                      {new Date(article.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      تعداد نظرات
                    </span>
                    <span className="text-foreground font-medium">
                      {article.comments_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      زمان مطالعه
                    </span>
                    <span className="text-foreground font-medium">
                      {Math.ceil((article.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} دقیقه
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Article */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">اشتراک گذاری</h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("لینک مقاله کپی شد");
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  کپی لینک مقاله
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}