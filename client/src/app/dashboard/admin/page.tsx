"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Trash2, X, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: '', userId: '', batch: '', phone: '', password: '' });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/users`, { withCredentials: true });
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (u: any) => {
    setEditUser(u);
    setEditFormData({
      name: u.name || '',
      userId: u.userId || '',
      batch: u.batch || '',
      phone: u.phone || '',
      password: '' // Reset password field empty by default
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.put(`${apiUrl}/users/${editUser._id}`, editFormData, { withCredentials: true });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteUserId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.delete(`${apiUrl}/users/${deleteUserId}`, { withCredentials: true });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all teachers and students in your institute.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/teachers" className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Plus className="w-4 h-4" /> Teacher
          </Link>
          <Link href="/dashboard/admin/students" className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Plus className="w-4 h-4" /> Student
          </Link>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Batch</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No teachers or students found.</td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{u.userId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        u.role === 'teacher' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10' : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.batch || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{u.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(u._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                <input required type="text" value={editFormData.userId} onChange={(e) => setEditFormData({...editFormData, userId: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
                <input type="text" value={editFormData.batch} onChange={(e) => setEditFormData({...editFormData, batch: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">Reset Password (Optional)</label>
                <input type="password" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Leave blank to keep current" />
                <p className="text-xs text-slate-500 mt-1">Typing a new password will instantly overwrite the old one.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
