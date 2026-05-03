"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  userId: string;
  role: "owner" | "teacher" | "student";
  name?: string;
  batch?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/auth/me`, { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        setUser(null);
        // If not logged in and trying to access dashboard, redirect
        if (pathname?.startsWith("/dashboard")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router]);

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
