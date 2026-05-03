"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Save, Calendar as CalendarIcon, Users } from "lucide-react";

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Default to today in YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch students in this teacher's batch
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/users/students`, { withCredentials: true });
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    if (user?.batch) {
      fetchStudents();
    }
  }, [user]);

  // Fetch attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/attendance/date/${selectedDate}`, { withCredentials: true });
        
        // Map fetched records to our state dictionary
        const attMap: { [key: string]: string } = {};
        res.data.forEach((record: any) => {
          if (record.student && record.student._id) {
            attMap[record.student._id] = record.status;
          }
        });
        setAttendance(attMap);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.batch && selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate, user]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendance).map(studentId => ({
        studentId,
        status: attendance[studentId]
      }));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/attendance`, {
        date: selectedDate,
        records
      }, { withCredentials: true });

      alert("Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Register</h1>
          <p className="text-sm text-slate-500 mt-1">
            Batch: <span className="font-semibold text-blue-600">{user?.batch || 'Unassigned'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">Student Roster</span>
            <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">{students.length} Total</span>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-slate-500">
              <p>No students found in this batch.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((student) => {
                const status = attendance[student._id]; // could be undefined initially
                
                return (
                  <li key={student._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{student.name || student.userId}</p>
                      <p className="text-xs text-slate-500">{student.userId}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => handleStatusChange(student._id, 'present')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          status === 'present' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student._id, 'absent')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          status === 'absent' 
                            ? 'bg-red-500 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
