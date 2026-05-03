"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Clock, User } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/announcements`, { withCredentials: true });
        setAnnouncements(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Class Feed</h1>
        <p className="text-blue-100">
          Viewing announcements for batch: <span className="font-semibold bg-white/20 px-2 py-1 rounded">{user?.batch || 'Unassigned'}</span>
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No Announcements Yet</h3>
            <p className="text-slate-500 mt-1">Your teacher hasn't posted anything for this batch.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{ann.teacher?.name || ann.teacher?.userId || 'Teacher'}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
