// مسیر: src/context/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { mutate } from "swr";
import { useGlobalWebSocket } from "@/lib/globalWebSocket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // استفاده از WebSocket مرکزی
  const handleWebSocketMessage = useCallback((data) => {
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
  }, []);

  useGlobalWebSocket('auth-context', handleWebSocketMessage);

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
      // Allow admins to access /dashboard if they want (don't force redirect)
      const isAdmin = user.role === 'ADMIN' || user.is_staff || user.is_superuser;
      if (!isAdmin && pathname.startsWith('/admin')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!user) return;

    const handleFocus = () => refreshUser();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
