"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Calendar, User, Clock, ChevronRight, 
  Share2, Bookmark, MessageSquare, Loader2,
  ArrowRight, BookOpen
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import ArticleComments from "@/components/ArticleComments";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${slug}/`);
      setArticle(response.data);
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black">مقاله مورد نظر یافت نشد</h1>
        <Link href="/articles" className="text-primary hover:underline flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست مقالات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image & Title */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-6 bg-background/20 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {article.created_at_human}
              </div>
              <div className="w-1 h-1 bg-border rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                {article.author_name}
              </div>
              <div className="w-1 h-1 bg-border rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                {article.comments_count} دیدگاه
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground max-w-4xl leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none text-foreground-secondary leading-loose"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
            />
            
              <div className="mt-12 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-secondary/50 rounded-3xl border border-border gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white overflow-hidden border-2 border-primary/20">
                      {article.author_avatar ? (
                        <img src={article.author_avatar} alt={article.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-foreground-muted mb-1">نویسنده مقاله</div>
                      <div className="font-black text-xl text-foreground">{article.author_name}</div>
                      {article.author_bio && (
                        <p className="text-xs text-foreground-muted mt-1 max-w-md line-clamp-2">{article.author_bio}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-card border border-border rounded-xl hover:border-primary transition-colors text-foreground-muted hover:text-primary group" title="اشتراک‌گذاری">
                      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="p-3 bg-card border border-border rounded-xl hover:border-primary transition-colors text-foreground-muted hover:text-primary group" title="نشان کردن">
                      <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {article.author_note && (
                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground mb-2">یادداشت نویسنده:</h4>
                        <p className="text-sm text-foreground-secondary leading-relaxed italic">
                          "{article.author_note}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* Comments Section */}
            <ArticleComments 
              articleId={article.id} 
              initialComments={article.comments} 
              onRefresh={fetchArticle} 
            />
          </article>

          {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-card border border-border rounded-3xl p-6 sticky top-24">
                <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  مطالب مرتبط
                </h3>
                
                <div className="space-y-4">
                  {article.related_articles_detail?.length > 0 ? (
                    article.related_articles_detail.map((related) => (
                      <Link 
                        key={related.id}
                        href={`/articles/${related.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
                          <img 
                            src={related.image} 
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <span className="text-[10px] text-foreground-muted mt-1">
                            {new Date(related.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-foreground-muted/20 mx-auto mb-2" />
                      <p className="text-foreground-muted text-sm">مقاله مرتبطی یافت نشد.</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <Link 
                    href="/articles"
                    className="block w-full bg-secondary text-foreground py-4 rounded-2xl font-black text-center hover:bg-secondary-hover transition-all text-sm mb-3"
                  >
                    آرشیو مقالات
                  </Link>
                  <Link 
                    href="/search"
                    className="block w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
                  >
                    مشاهده فروشگاه
                  </Link>
                </div>
              </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
