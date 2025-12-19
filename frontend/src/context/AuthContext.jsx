// مسیر: src/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { mutate } from "swr";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/users/profile/");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, refreshToken) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    checkUserLoggedIn();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/login");
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await api.get("/users/profile/");
      setUser(response.data);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Role-based redirection logic
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN' && pathname === '/dashboard') {
        router.push('/admin');
      } else if (user.role !== 'ADMIN' && pathname.startsWith('/admin')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/user/?token=${token}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "wallet_update") {
          setUser(prev => ({ ...prev, wallet_balance: data.balance }));
        } else if (data.type === 'wallet_request_update') {
          mutate("/users/wallet-requests/");
          window.dispatchEvent(new CustomEvent('wallet_request_status_changed', { detail: data }));
        } else if (data.type === 'ticket_update') {
          mutate("/users/tickets/");
          mutate(data.ticket_id ? `/users/tickets/${data.ticket_id}/messages/` : null);
          window.dispatchEvent(new CustomEvent('ticket_updated', { detail: data }));
        }
      };

      socket.onclose = () => console.log("User WebSocket disconnected");
      socket.onerror = (error) => console.error("User WebSocket error:", error);
    } catch (err) {
      console.error("WebSocket connection error:", err);
    }

    const handleFocus = () => refreshUser();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (socket) socket.close();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
