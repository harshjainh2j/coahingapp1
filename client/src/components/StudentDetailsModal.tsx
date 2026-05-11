"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Phone, User as UserIcon, Calendar as CalendarIcon, Save } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  userId: string;
  phone?: string;
  remarks?: string;
  createdAt: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
}

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
  onUpdateRemarks: (studentId: string, remarks: string) => void;
}

export default function StudentDetailsModal({ student, onClose, onUpdateRemarks }: StudentDetailsModalProps) {
  const [remarks, setRemarks] = useState(student.remarks || "");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/attendance/student/${student._id}`, { withCredentials: true });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [student._id]);

  const handleSaveRemarks = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.put(`${apiUrl}/users/${student._id}/remarks`, { remarks }, { withCredentials: true });
      onUpdateRemarks(student._id, remarks);
    } catch (err) {
      console.error(err);
      alert("Failed to save remarks");
    } finally {
      setSaving(false);
    }
  };

  // Calculate percentages
  const presents = history.filter(r => r.status === 'present').length;
  const absents = history.filter(r => r.status === 'absent').length;
  const total = presents + absents;
  const percentage = total > 0 ? Math.round((presents / total) * 100) : 0;

  // Generate heatmap data (last 364 days, so 52 columns of 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time

  // Build a map of YYYY-MM-DD to status
  const historyMap = new Map<string, string>();
  history.forEach(r => historyMap.set(r.date, r.status));

  // Precompute dates for the last 364 days (ending on today)
  const days = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    days.push({
      dateStr,
      status: historyMap.get(dateStr) || 'none',
      isFuture: d > today, // Though we are looking backward, just in case
      isBeforeJoined: d < new Date(student.createdAt)
    });
  }

  // Create columns of 7 days
  const columns = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Student Profile
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Top Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Name</p>
                <p className="text-lg font-semibold text-slate-900">{student.name || student.userId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Phone</p>
                <p className="text-md text-slate-700 flex items-center gap-1.5 mt-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {student.phone || 'No phone added'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Joined Date</p>
                <p className="text-md text-slate-700 flex items-center gap-1.5 mt-1">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex flex-col justify-center items-center text-center shadow-inner">
              <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Total Presents</p>
              <div className="text-5xl font-black text-blue-600 drop-shadow-sm">{percentage}%</div>
              <p className="text-xs text-blue-600/70 mt-2 font-medium bg-blue-100/50 px-3 py-1 rounded-full">
                {presents} days present out of {total} recorded
              </p>
            </div>
          </div>

          {/* Remarks Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Teacher Remarks</label>
              <button 
                onClick={handleSaveRemarks}
                disabled={saving || remarks === student.remarks}
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="w-3 h-3" />
                {saving ? 'Saving...' : 'Save Remarks'}
              </button>
            </div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add private notes about this student's performance, behavior, etc."
              className="w-full h-24 rounded-xl border border-slate-300 py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 bg-slate-50"
            />
          </div>

          {/* Heatmap Section */}
          <div>
            <div className="mb-4">
              <h4 className="text-md font-semibold text-slate-900">Attendance Heatmap (Last 1 Year)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Visual representation of the student's attendance over the last 365 days.</p>
            </div>

            {loading ? (
              <div className="h-32 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl overflow-x-auto custom-scrollbar">
                <div className="flex gap-1 min-w-max pb-2">
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1">
                      {col.map((day, dayIdx) => {
                        let bgColor = 'bg-slate-200/60'; // Default / no record
                        let title = `${day.dateStr}: No Record`;

                        if (day.status === 'present') {
                          bgColor = 'bg-emerald-500';
                          title = `${day.dateStr}: Present`;
                        } else if (day.status === 'absent') {
                          bgColor = 'bg-red-500';
                          title = `${day.dateStr}: Absent`;
                        } else if (day.isBeforeJoined) {
                          bgColor = 'bg-slate-100 opacity-30'; // Not joined yet
                          title = `${day.dateStr}: Not Joined`;
                        }

                        return (
                          <div 
                            key={dayIdx} 
                            title={title}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${bgColor} hover:ring-1 hover:ring-slate-900 transition-all cursor-crosshair`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 justify-end font-medium">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-200/60" /> No Record</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Present</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500" /> Absent</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
