"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatButton from "@/components/chat/ChatButton";
import AdminOnlineStatus from "@/components/AdminOnlineStatus";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <AdminOnlineStatus />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <>
      <AdminOnlineStatus />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatButton />
    </>
  );
}
