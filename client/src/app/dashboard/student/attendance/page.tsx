"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/attendance/my-records`, { withCredentials: true });
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching attendance records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const calculateStats = () => {
    const total = records.length;
    if (total === 0) return { present: 0, absent: 0, percentage: 0 };
    
    let present = 0;
    let absent = 0;

    records.forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
    });

    const percentage = Math.round((present / total) * 100);

    return { present, absent, percentage };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Attendance</h1>
          <p className="text-blue-100">
            Batch: <span className="font-semibold bg-white/20 px-2 py-1 rounded">{user?.batch || 'Unassigned'}</span>
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center min-w-[120px]">
          <p className="text-sm font-medium text-blue-100 mb-1">Total Attendance</p>
          <div className="text-4xl font-bold">{stats.percentage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Days Present</p>
            <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Days Absent</p>
            <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Attendance History</h2>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No attendance records found yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {records.map((record) => (
                <li key={record._id} className="px-4 md:px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="font-medium text-slate-700">
                    {/* Assuming date is stored as YYYY-MM-DD, parse it for friendly display */}
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div>
                    {record.status === 'present' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</span>}
                    {record.status === 'absent' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Absent</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
