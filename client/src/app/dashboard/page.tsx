"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "owner") {
        router.replace("/dashboard/admin");
      } else if (user.role === "teacher") {
        router.replace("/dashboard/teacher");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}
