"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  Megaphone, 
  LogOut, 
  LayoutDashboard,
  CalendarDays,
  FolderOpen,
  MessageSquare
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // AuthContext will handle redirect

  const navItems = [];

  if (user.role === "owner") {
    navItems.push(
      { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Manage Teachers", href: "/dashboard/admin/teachers", icon: BookOpen },
      { name: "Manage Students", href: "/dashboard/admin/students", icon: Users }
    );
  } else if (user.role === "teacher") {
    navItems.push(
      { name: "Announcements", href: "/dashboard/teacher", icon: Megaphone },
      { name: "Attendance", href: "/dashboard/teacher/attendance", icon: CalendarDays },
      { name: "Resources", href: "/dashboard/teacher/resources", icon: FolderOpen },
      { name: "Doubts", href: "/dashboard/teacher/doubts", icon: MessageSquare }
    );
  } else if (user.role === "student") {
    navItems.push(
      { name: "Announcements", href: "/dashboard/student", icon: Megaphone },
      { name: "Attendance", href: "/dashboard/student/attendance", icon: CalendarDays },
      { name: "Resources", href: "/dashboard/student/resources", icon: FolderOpen },
      { name: "Doubts", href: "/dashboard/student/doubts", icon: MessageSquare }
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <BookOpen className="h-6 w-6 text-amber-500 mr-2" />
          <span className="font-bold text-xl tracking-tight text-slate-900">Sagar Coaching</span>
        </div>
        
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.userId.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.name || user.userId}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-slate-900 text-amber-500" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (simplified) */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-lg text-slate-900">Sagar Coaching</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
