"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Send, Clock, Edit2, Trash2, X } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<any>(null);
  const [editContent, setEditContent] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/announcements`, { withCredentials: true });
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/announcements`, { content }, { withCredentials: true });
      setContent("");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (ann: any) => {
    setEditAnnouncement(ann);
    setEditContent(ann.content);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.put(`${apiUrl}/announcements/${editAnnouncement._id}`, { content: editContent }, { withCredentials: true });
      setIsEditModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to update announcement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.delete(`${apiUrl}/announcements/${id}`, { withCredentials: true });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete announcement.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Post updates to your assigned batch: <span className="font-semibold text-blue-600">{user?.batch || 'Unassigned'}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handlePost}>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your announcement here..."
            className="w-full rounded-xl border-slate-300 py-3 px-4 border focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
          />
          <div className="mt-3 flex justify-end">
            <button 
              disabled={loading || !user?.batch} 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold text-slate-800">Previous Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No announcements posted yet.</p>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative group">
              <p className="text-slate-800 whitespace-pre-wrap pr-16">{ann.content}</p>
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(ann)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ann._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{new Date(ann.createdAt).toLocaleString()}</span>
                {ann.createdAt !== ann.updatedAt && <span className="italic">(Edited)</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Edit Announcement</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <textarea
                required
                rows={5}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border-slate-300 py-3 px-4 border focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
