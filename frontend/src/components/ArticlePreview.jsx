// مسیر: src/components/ArticlePreview.jsx
"use client";

import { useState } from 'react';
import { Eye, X } from 'lucide-react';

export default function ArticlePreview({ content, title = "پیش‌نمایش مقاله" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <>
      {/* دکمه پیش‌نمایش */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all hover:scale-105 font-medium"
        title="پیش‌نمایش مقاله"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm">پیش‌نمایش</span>
      </button>

      {/* مودال پیش‌نمایش */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            
            {/* هدر */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوای پیش‌نمایش */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* فوتر */}
            <div className="flex justify-center p-4 border-t border-border bg-secondary/30">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}