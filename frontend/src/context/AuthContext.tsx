"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/api/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { email: string; password?: string }) => Promise<void>;
  signup: (data: { name: string; email: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate from cookies or localStorage
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const storedToken = cookieToken || localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: { email: string; password?: string }) => {
    const res = await api.post("/auth/login", data);
    const { accessToken, refreshToken, user: newUser } = res.data;
    setToken(accessToken);
    setUser(newUser);
    document.cookie = `token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
    localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const signup = async (data: { name: string; email: string; password?: string }) => {
    const res = await api.post("/auth/signup", data);
    const { accessToken, refreshToken, user: newUser } = res.data;
    setToken(accessToken);
    setUser(newUser);
    document.cookie = `token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
    localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      try {
        await api.patch(`/sessions/${sessionId}`, { closedAt: new Date().toISOString(), closingAmount: 0 });
      } catch (e) {
        // ignore mock
      }
    }
    
    setToken(null);
    setUser(null);
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
