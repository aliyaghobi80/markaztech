// مسیر: src/app/admin/comments/page.jsx
"use client";

import AdminComments from "@/components/admin/AdminComments";

export default function AdminCommentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-6">مدیریت نظرات</h1>
      <AdminComments />
    </div>
  );
}
