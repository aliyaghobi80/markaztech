// مسیر: src/components/RichTextEditor.jsx
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
import { Node } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Undo, Redo,
  Image as ImageIcon, Link as LinkIcon,
  Video, Highlighter, Plus, Code, Table as TableIcon,
  Music, ExternalLink, Trash2, Subscript as SubIcon,
  Superscript as SupIcon, Palette, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';

// Extension سفارشی برای ویدیو
const CustomVideo = Node.create({
  name: 'customVideo',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      style: {
        default: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;',
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    }
  },
  parseHTML() {
    return [
      { 
        tag: 'video',
        getAttrs: (node) => ({
          src: node.getAttribute('src'),
          controls: node.hasAttribute('controls'),
          style: node.getAttribute('style'),
          width: node.getAttribute('width'),
          height: node.getAttribute('height'),
        }),
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, controls: true }, ['source', { src: HTMLAttributes.src }]]
  },
  addNodeView() {
    return ({ node }) => {
      const video = document.createElement('video');
      video.src = node.attrs.src;
      video.controls = true;
      video.style.cssText = node.attrs.style || 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;';
      
      const wrapper = document.createElement('div');
      wrapper.appendChild(video);
      
      return {
        dom: wrapper,
      };
    };
  },
});

// Extension سفارشی برای صدا
const CustomAudio = Node.create({
  name: 'customAudio',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      style: {
        default: 'width: 100%; margin: 16px 0;',
      },
    }
  },
  parseHTML() {
    return [
      { 
        tag: 'audio',
        getAttrs: (node) => ({
          src: node.getAttribute('src'),
          controls: node.hasAttribute('controls'),
          style: node.getAttribute('style'),
        }),
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['audio', { ...HTMLAttributes, controls: true }, ['source', { src: HTMLAttributes.src }]]
  },
  addNodeView() {
    return ({ node }) => {
      const audio = document.createElement('audio');
      audio.src = node.attrs.src;
      audio.controls = true;
      audio.style.cssText = node.attrs.style || 'width: 100%; margin: 16px 0;';
      
      const wrapper = document.createElement('div');
      wrapper.appendChild(audio);
      
      return {
        dom: wrapper,
      };
    };
  },
});

const MenuBar = ({ editor, cleanBlobUrls }) => {
  const { user } = useAuth(); // اضافه کردن useAuth
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const fileInputRef = useRef(null);

  // همه Hook ها باید قبل از return باشن
  const addImageFromFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file && editor) {
      try {
        // بررسی اندازه فایل (حداکثر 100MB)
        if (file.size > 100 * 1024 * 1024) {
          toast.error('حجم فایل نباید بیشتر از 100 مگابایت باشد');
          return;
        }

        // بررسی authentication
        if (!user) {
          toast.error('لطفاً ابتدا وارد شوید');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('لطفاً ابتدا وارد شوید');
          return;
        }

        // آپلود فایل به سرور با استفاده از axios
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const data = response.data;
        const serverUrl = data.url || data.location;
        
        if (file.type.startsWith('image/')) {
          editor.chain().focus().setImage({ src: serverUrl, alt: file.name }).run();
          toast.success('تصویر آپلود و اضافه شد');
        } else if (file.type.startsWith('video/')) {
          // استفاده از extension سفارشی برای ویدیو
          editor.chain().focus().insertContent({
            type: 'customVideo',
            attrs: {
              src: serverUrl,
              controls: true,
              style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;'
            }
          }).run();
          toast.success('ویدیو آپلود و اضافه شد');
        } else if (file.type.startsWith('audio/')) {
          // استفاده از extension سفارشی برای صدا
          editor.chain().focus().insertContent({
            type: 'customAudio',
            attrs: {
              src: serverUrl,
              controls: true,
              style: 'width: 100%; margin: 16px 0;'
            }
          }).run();
          toast.success('فایل صوتی آپلود و اضافه شد');
        }
        
        // پاک کردن input برای امکان آپلود مجدد همان فایل
        e.target.value = '';
        
      } catch (error) {
        console.error('خطا در آپلود:', error);
        
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          if (status === 401) {
            toast.error('احراز هویت نامعتبر. لطفاً دوباره وارد شوید');
          } else if (status === 413) {
            toast.error('حجم فایل بیش از حد مجاز است');
          } else {
            const errorMessage = errorData.error || errorData.detail || 'خطا در آپلود فایل';
            toast.error(errorMessage);
          }
        } else {
          toast.error('خطا در آپلود فایل. لطفاً دوباره تلاش کنید');
        }
      }
    }
  }, [editor, user]);

  const addMediaFromUrl = useCallback(() => {
    if (!mediaUrl || !editor) return;
    
    if (mediaType === 'image') {
      editor.chain().focus().setImage({ src: mediaUrl }).run();
      toast.success('تصویر از لینک اضافه شد');
    } else if (mediaType === 'video') {
      // استفاده از extension سفارشی برای ویدیو
      editor.chain().focus().insertContent({
        type: 'customVideo',
        attrs: {
          src: mediaUrl,
          controls: true,
          style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;'
        }
      }).run();
      toast.success('ویدیو از لینک اضافه شد');
    } else if (mediaType === 'audio') {
      // استفاده از extension سفارشی برای صدا
      editor.chain().focus().insertContent({
        type: 'customAudio',
        attrs: {
          src: mediaUrl,
          controls: true,
          style: 'width: 100%; margin: 16px 0;'
        }
      }).run();
      toast.success('فایل صوتی از لینک اضافه شد');
    }
    
    setMediaUrl('');
    setShowMediaDialog(false);
  }, [editor, mediaUrl, mediaType]);

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
      toast.success('لینک اضافه شد');
    }
  }, [editor, linkUrl]);

  // Show floating menu when text is selected
  useEffect(() => {
    if (!editor) return;

    const updateFloatingMenu = () => {
      const { selection } = editor.state;
      const { from, to } = selection;
      
      if (from !== to) {
        setShowFloatingMenu(true);
      } else {
        setShowFloatingMenu(false);
      }
    };

    editor.on('selectionUpdate', updateFloatingMenu);
    return () => editor.off('selectionUpdate', updateFloatingMenu);
  }, [editor]);

  // حالا بعد از همه Hook ها میتونیم return کنیم
  if (!editor) return null;

  return (
    <>
      {/* Floating Toolbar */}
      {showFloatingMenu && (
        <div className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl p-3 flex gap-1 top-4 left-1/2 transform -translate-x-1/2 max-w-md flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-blue-600' : ''}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-blue-600' : ''}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-blue-600' : ''}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('highlight') ? 'bg-yellow-600' : ''}`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1"></div>
          
          {/* رنگ‌های اصلی */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#ef4444').run()}
            className="w-6 h-6 rounded bg-red-500 hover:scale-110 transition-transform"
            title="قرمز"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#f97316').run()}
            className="w-6 h-6 rounded bg-orange-500 hover:scale-110 transition-transform"
            title="نارنجی"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#f59e0b').run()}
            className="w-6 h-6 rounded bg-yellow-500 hover:scale-110 transition-transform"
            title="زرد"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#10b981').run()}
            className="w-6 h-6 rounded bg-green-500 hover:scale-110 transition-transform"
            title="سبز"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
            className="w-6 h-6 rounded bg-blue-500 hover:scale-110 transition-transform"
            title="آبی"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#8b5cf6').run()}
            className="w-6 h-6 rounded bg-purple-500 hover:scale-110 transition-transform"
            title="بنفش"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#ec4899').run()}
            className="w-6 h-6 rounded bg-pink-500 hover:scale-110 transition-transform"
            title="صورتی"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#000000').run()}
            className="w-6 h-6 rounded bg-black border border-gray-500 hover:scale-110 transition-transform"
            title="سیاه"
          />
        </div>
      )}

      {/* Main Toolbar */}
      <div className="border-b border-border bg-secondary/30">
        {/* ردیف اول: فرمت‌دهی اصلی */}
        <div className="p-3 flex flex-wrap gap-1 items-center">
          
          {/* انتخاب فونت */}
          <select
            onChange={(e) => {
              if (e.target.value === 'unset') {
                editor.chain().focus().unsetFontFamily().run();
              } else {
                editor.chain().focus().setFontFamily(e.target.value).run();
              }
            }}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium min-w-[140px]"
            value={editor.getAttributes('textStyle').fontFamily || 'unset'}
          >
            <option value="unset">فونت پیش‌فرض</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Impact, sans-serif">Impact</option>
            <option value="Comic Sans MS, cursive">Comic Sans MS</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
            <option value="Vazirmatn, sans-serif">وزیر متن</option>
            <option value="IRANSans, sans-serif">ایران سنس</option>
            <option value="Yekan, sans-serif">یکان</option>
          </select>

          {/* انتخاب نوع متن */}
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium min-w-[120px]"
            value={
              editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
              editor.isActive('heading', { level: 3 }) ? 3 : 0
            }
          >
            <option value={0}>پاراگراف</option>
            <option value={1}>عنوان بزرگ</option>
            <option value={2}>عنوان متوسط</option>
            <option value={3}>عنوان کوچک</option>
          </select>

          <div className="w-px h-8 bg-border mx-2"></div>

          {/* فرمت‌دهی متن - B, I, U */}
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('bold') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('italic') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('underline') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('strike') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('highlight') ? 'bg-yellow-500 text-white shadow-lg border-yellow-500' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="Highlight"
            >
              <Highlighter className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('subscript') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="زیرنویس"
            >
              <SubIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('superscript') ? 'bg-primary text-primary-foreground shadow-lg border-primary' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="بالانویس"
            >
              <SupIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center border ${
                editor.isActive('code') ? 'bg-gray-600 text-white shadow-lg border-gray-600' : 'hover:bg-secondary bg-background border-border'
              }`}
              title="کد درون‌خطی"
            >
              <Code className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-8 bg-border mx-2"></div>

          {/* رنگ متن - ردیف اول */}
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#ef4444').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-red-500"
              title="قرمز"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#f97316').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-orange-500"
              title="نارنجی"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#f59e0b').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-yellow-500"
              title="زرد"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#84cc16').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-lime-500"
              title="سبز لیمویی"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#10b981').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-green-500"
              title="سبز"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#06b6d4').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-cyan-500"
              title="فیروزه‌ای"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-blue-500"
              title="آبی"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#6366f1').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-indigo-500"
              title="نیلی"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#8b5cf6').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-purple-500"
              title="بنفش"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#d946ef').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-fuchsia-500"
              title="صورتی بنفش"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#ec4899').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-pink-500"
              title="صورتی"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#f43f5e').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-rose-500"
              title="گلی"
            />
          </div>
          
          {/* رنگ متن - ردیف دوم (رنگ‌های تیره) */}
          <div className="flex gap-1 flex-wrap mt-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#dc2626').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-red-600"
              title="قرمز تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#ea580c').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-orange-600"
              title="نارنجی تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#d97706').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-yellow-600"
              title="زرد تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#65a30d').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-lime-600"
              title="سبز لیمویی تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#059669').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-green-600"
              title="سبز تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#0891b2').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-cyan-600"
              title="فیروزه‌ای تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#2563eb').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-blue-600"
              title="آبی تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#4f46e5').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-indigo-600"
              title="نیلی تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#7c3aed').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-purple-600"
              title="بنفش تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#c026d3').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-fuchsia-600"
              title="صورتی بنفش تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#db2777').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-pink-600"
              title="صورتی تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#e11d48').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-rose-600"
              title="گلی تیره"
            />
          </div>
          
          {/* رنگ‌های خاکستری و سیاه و سفید */}
          <div className="flex gap-1 flex-wrap mt-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#000000').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-black"
              title="سیاه"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#374151').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-gray-700"
              title="خاکستری تیره"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#6b7280').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-gray-500"
              title="خاکستری"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#9ca3af').run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-gray-400"
              title="خاکستری روشن"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().setColor('#ffffff').run()}
              className="w-7 h-7 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform shadow-sm bg-white"
              title="سفید"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="w-7 h-7 rounded-lg border-2 border-border hover:scale-110 transition-transform shadow-sm bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 relative"
              title="حذف رنگ"
            >
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">×</span>
            </button>
          </div>
          
          <div className="w-px h-8 bg-border mx-2"></div>

          {/* تراز متن */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="راست‌چین"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="وسط‌چین"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="چپ‌چین"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="تراز کامل"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-8 bg-border mx-2"></div>

          {/* لیست‌ها */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive('bulletList') ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="لیست نقطه‌ای"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive('orderedList') ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="لیست شماره‌دار"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                editor.isActive('blockquote') ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-secondary'
              }`}
              title="نقل قول"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
                toast.success('خط افقی اضافه شد');
              }}
              className="p-2 rounded-lg transition-all hover:scale-105 hover:bg-secondary"
              title="خط افقی"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ردیف دوم: رسانه و ابزارها */}
        <div className="px-3 pb-3 flex flex-wrap gap-2 items-center border-t border-border/50 pt-3">
          
          {/* رسانه */}
          <button
            type="button"
            onClick={addImageFromFile}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 font-medium ${
              user 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={user ? "افزودن تصویر/ویدیو/صدا" : "برای آپلود فایل ابتدا وارد شوید"}
          >
            <Plus className="w-4 h-4" />
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">رسانه</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMediaDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-all hover:scale-105 font-medium"
            title="افزودن از لینک"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">از لینک</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLinkDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-all hover:scale-105 font-medium"
            title="افزودن لینک"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="text-sm">لینک</span>
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              toast.success('جدول اضافه شد');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg transition-all hover:scale-105 font-medium"
            title="افزودن جدول"
          >
            <TableIcon className="w-4 h-4" />
            <span className="text-sm">جدول</span>
          </button>

          {/* دکمه‌های مدیریت جدول - فقط وقتی در جدول هستیم */}
          {editor.isActive('table') && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="px-3 py-2 bg-indigo-400 text-white hover:bg-indigo-500 rounded-lg text-xs"
                title="افزودن ردیف بالا"
              >
                +ردیف بالا
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-3 py-2 bg-indigo-400 text-white hover:bg-indigo-500 rounded-lg text-xs"
                title="افزودن ردیف پایین"
              >
                +ردیف پایین
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="px-3 py-2 bg-indigo-400 text-white hover:bg-indigo-500 rounded-lg text-xs"
                title="افزودن ستون چپ"
              >
                +ستون چپ
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-3 py-2 bg-indigo-400 text-white hover:bg-indigo-500 rounded-lg text-xs"
                title="افزودن ستون راست"
              >
                +ستون راست
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-xs"
                title="حذف جدول"
              >
                حذف جدول
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              toast.success('بلاک کد اضافه شد');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 font-medium ${
              editor.isActive('codeBlock') 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
            title="بلاک کد"
          >
            <Code className="w-4 h-4" />
            <span className="text-sm">کد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().clearNodes().unsetAllMarks().run();
              toast.success('فرمت‌ها پاک شدند');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-all hover:scale-105 font-medium"
            title="پاک کردن فرمت‌ها"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm">پاک کردن فرمت</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (editor) {
                const currentContent = editor.getHTML();
                const cleanedContent = cleanBlobUrls(currentContent);
                if (cleanedContent !== currentContent) {
                  editor.commands.setContent(cleanedContent);
                  toast.success('عکس‌های نامعتبر پاک شدند');
                } else {
                  toast.info('عکس نامعتبری یافت نشد');
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all hover:scale-105 font-medium"
            title="پاک کردن عکس‌های نامعتبر"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">پاک کردن عکس‌های نامعتبر</span>
          </button>

          <div className="flex-1"></div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded-lg hover:bg-secondary bg-background transition-all hover:scale-105 border border-border"
              title="بازگشت (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded-lg hover:bg-secondary bg-background transition-all hover:scale-105 border border-border"
              title="تکرار (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* فایل input مخفی */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
        />

        {/* دیالوگ لینک */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl border border-border max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">افزودن لینک</h3>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 border border-border rounded-xl mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-foreground-muted hover:bg-secondary rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={setLink}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  افزودن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* دیالوگ رسانه از لینک */}
        {showMediaDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl border border-border max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">افزودن رسانه از لینک</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">نوع رسانه:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      mediaType === 'image' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    تصویر
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      mediaType === 'video' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    ویدیو
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('audio')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      mediaType === 'audio' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    صدا
                  </button>
                </div>
              </div>

              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/media.jpg"
                className="w-full p-3 border border-border rounded-xl mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowMediaDialog(false)}
                  className="px-4 py-2 text-foreground-muted hover:bg-secondary rounded-lg"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={addMediaFromUrl}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  افزودن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "محتوای مقاله را بنویسید..." }) {
  const [showInstructions, setShowInstructions] = useState(!content);
  const [lastContent, setLastContent] = useState(content || '');
  
  // تابع پاک کردن blob URLs از محتوا
  const cleanBlobUrls = useCallback((htmlContent) => {
    if (!htmlContent) return htmlContent;
    
    // حذف تگ‌های img که src آنها blob است
    return htmlContent.replace(/<img[^>]*src="blob:[^"]*"[^>]*>/gi, '');
  }, []);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // غیرفعال کردن Link و Underline از StarterKit چون خودمون اضافه می‌کنیم
        link: false,
        codeBlock: false, // غیرفعال کردن تا از CodeBlockLowlight استفاده کنیم
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 cursor-pointer hover:shadow-lg transition-shadow',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded',
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 dark:border-gray-600 my-4 w-full table-fixed',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-3 font-bold text-center min-w-[100px]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 p-3 min-w-[100px] min-h-[40px]',
        },
      }),
      CustomVideo,
      CustomAudio,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto',
        },
      }),
    ],
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-6',
      },
    },
    content: content || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      // پاک کردن blob URLs از محتوا
      const cleanedContent = cleanBlobUrls(newContent);
      
      // فقط اگر محتوا واقعاً تغییر کرده باشه onChange رو صدا بزن
      if (cleanedContent !== lastContent) {
        setLastContent(cleanedContent);
        // فقط onChange رو صدا بزن، بدون تاخیر
        if (onChange) {
          onChange(cleanedContent);
        }
      }
      if (showInstructions) {
        setShowInstructions(false);
      }
    },
  });

  // به‌روزرسانی محتوا وقتی content از بیرون تغییر می‌کند
  useEffect(() => {
    if (editor && content !== undefined && content !== lastContent) {
      // پاک کردن blob URLs قدیمی
      const cleanContent = content ? content.replace(/blob:[^"]+/g, '') : '';
      editor.commands.setContent(cleanContent);
      setLastContent(cleanContent);
    }
  }, [content, editor, lastContent]);

  return (
    <div className="w-full border-2 border-border rounded-xl overflow-hidden bg-card relative shadow-lg">
      <MenuBar editor={editor} cleanBlobUrls={cleanBlobUrls} />
      <div className="min-h-[500px] max-h-[700px] overflow-y-auto bg-white dark:bg-gray-900 relative">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none text-foreground [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:bg-white [&_.ProseMirror]:dark:bg-gray-900
          [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-lg [&_video]:my-4 [&_video]:border [&_video]:border-gray-300 [&_video]:dark:border-gray-600
          [&_audio]:w-full [&_audio]:my-4 [&_audio]:rounded-lg [&_audio]:border [&_audio]:border-gray-300 [&_audio]:dark:border-gray-600
          [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:font-mono
          [&_code]:bg-gray-200 [&_code]:dark:bg-gray-700 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
          [&_sup]:text-xs [&_sup]:align-super
          [&_sub]:text-xs [&_sub]:align-sub
          [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gray-300 [&_hr]:dark:bg-gray-600 [&_hr]:my-6"
          style={{
            minHeight: '500px',
            direction: 'rtl',
            textAlign: 'right'
          }}
        />
        
        {/* راهنمای استفاده - فقط وقتی محتوا خالی است */}
        {!content && showInstructions && (
          <div className="absolute inset-6 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center bg-blue-50 dark:bg-blue-950/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 max-w-lg backdrop-blur-sm">
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <Bold className="w-8 h-8 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">
                نحوه استفاده از ویرایشگر
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• متن را انتخاب کنید و دکمه‌های B, I, U را ببینید</p>
                <p>• برای رنگ، متن را انتخاب کرده و روی رنگ کلیک کنید (۳۶ رنگ مختلف!)</p>
                <p>• برای عکس/ویدیو/صدا، دکمه "رسانه" را بزنید</p>
                <p>• برای لینک، متن را انتخاب کرده و "لینک" را بزنید</p>
                <p>• برای جدول، دکمه "جدول" را بزنید (۳×۲ با هدر)</p>
                <p>• برای کد، دکمه "کد" را بزنید (کد درون‌خطی یا بلاک)</p>
                <p>• از زیرنویس (H₂O) و بالانویس (X²) برای فرمول‌ها استفاده کنید</p>
                <p>• فونت‌های مختلف فارسی و انگلیسی در دسترس است</p>
                <p>• دکمه "پاک کردن فرمت" همه استایل‌ها را حذف می‌کند</p>
                <p className="text-orange-600 font-medium">• برای آپلود فایل، ابتدا وارد شوید</p>
                <p className="text-red-600 font-medium">• اگر عکس نمایش داده نمی‌شود، دکمه "پاک کردن عکس‌های نامعتبر" را بزنید</p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-4">
                شروع به تایپ کنید تا این راهنما ناپدید شود
              </p>
            </div>
          </div>
        )}
        
        {/* Placeholder وقتی محتوا خالی است اما راهنما نمایش داده نمی‌شود */}
        {!content && !showInstructions && (
          <div className="absolute top-24 right-10 text-foreground-muted pointer-events-none text-lg font-medium">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}