"use client";

import { useState } from "react";
import axios from "axios";

export default function ManageTeachers() {
  const [formData, setFormData] = useState({ userId: '', name: '', password: '', batch: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/users`, { ...formData, role: 'teacher' }, { withCredentials: true });
      setMessage({ type: 'success', text: 'Teacher created successfully!' });
      setFormData({ userId: '', name: '', password: '', batch: '', phone: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create teacher' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Teachers</h1>
        <p className="text-sm text-slate-500 mt-1">Create new teacher accounts and assign their batches.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
            <input required type="text" value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="teacher123" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
            <input required type="text" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Batch A (Morning)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="+1234567890" />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
}
