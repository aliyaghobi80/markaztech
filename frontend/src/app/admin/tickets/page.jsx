// مسیر: src/app/admin/tickets/page.jsx
"use client";

import AdminTickets from "@/components/admin/AdminTickets";

export default function AdminTicketsPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-foreground mb-6">تیکت‌های پشتیبانی</h1>
      <AdminTickets />
    </div>
  );
}
