"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { UploadCloud, Link as LinkIcon, FileText, Image as ImageIcon, File, Trash2, AlertTriangle, X, FolderOpen } from "lucide-react";

export default function TeacherResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Usage State
  const [usage, setUsage] = useState({ usedBytes: 0, limitBytes: 0, usagePercent: 0, isNearLimit: false });

  // Form State
  const [type, setType] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  const fetchResourcesAndUsage = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const [resData, usageData] = await Promise.all([
        axios.get(`${apiUrl}/resources`, { withCredentials: true }),
        axios.get(`${apiUrl}/resources/usage`, { withCredentials: true })
      ]);
      
      setResources(resData.data);
      setUsage(usageData.data);
      
      if (usageData.data.isNearLimit) {
        setShowStorageModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesAndUsage();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check 10MB limit (10 * 1024 * 1024)
      if (selectedFile.size > 10485760) {
        setShowLimitModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setUploading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    try {
      if (type === 'file') {
        if (!file) return;
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', 'file');
        formData.append('file', file);
        
        await axios.post(`${apiUrl}/resources`, formData, { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (!linkUrl.trim()) return;
        await axios.post(`${apiUrl}/resources`, {
          title,
          type: 'link',
          linkUrl
        }, { withCredentials: true });
      }

      // Reset form
      setTitle('');
      setLinkUrl('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchResourcesAndUsage();
    } catch (err) {
      console.error(err);
      alert("Failed to upload resource. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.delete(`${apiUrl}/resources/${id}`, { withCredentials: true });
      fetchResourcesAndUsage();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource.");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="w-8 h-8 text-blue-500" />;
    const ft = fileType.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ft)) return <ImageIcon className="w-8 h-8 text-pink-500" />;
    if (['pdf'].includes(ft)) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Storage Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Learning Resources</h1>
          <p className="text-sm text-slate-500 mt-1">
            Share study materials with your batch: <span className="font-semibold text-blue-600">{user?.batch || 'Unassigned'}</span>
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Storage Used</span>
            <span>{formatBytes(usage.usedBytes)} / {formatBytes(usage.limitBytes)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${usage.usagePercent >= 90 ? 'bg-red-500' : usage.usagePercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${usage.usagePercent}%` }}
            ></div>
          </div>
          {usage.isNearLimit && (
             <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
               <AlertTriangle className="w-3 h-3" /> Storage almost full!
             </p>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button 
            type="button"
            onClick={() => setType('file')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${type === 'file' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            Upload File
          </button>
          <button 
            type="button"
            onClick={() => setType('link')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${type === 'link' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            Share Link
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource Title</label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" 
              placeholder="e.g., Chapter 1 Notes" 
            />
          </div>

          {type === 'file' ? (
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Select File (Max 10MB)</label>
               <input 
                 key="file-input"
                 required 
                 type="file" 
                 ref={fileInputRef}
                 accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                 onChange={handleFileChange} 
                 className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg p-1" 
               />
               <p className="text-xs text-slate-500 mt-1">Accepted: PDF, Images, Excel, Word.</p>
            </div>
          ) : (
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">URL Link</label>
               <input 
                 key="link-input"
                 required 
                 type="url" 
                 value={linkUrl} 
                 onChange={(e) => setLinkUrl(e.target.value)} 
                 className="w-full rounded-lg border-slate-300 py-2 px-3 border focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                 placeholder="https://example.com/video-lecture" 
               />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              disabled={uploading || (type === 'file' && !file) || (type === 'link' && !linkUrl) || usage.usagePercent >= 100} 
              type="submit" 
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Uploading...' : type === 'file' ? 'Upload Resource' : 'Share Link'}
            </button>
          </div>
        </form>
      </div>

      {/* Shared Resources List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Shared Resources</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No resources shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <div key={res._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded p-1">
                  <button onClick={() => handleDelete(res._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 p-2 bg-slate-50 rounded-xl">
                    {res.type === 'link' ? <LinkIcon className="w-8 h-8 text-indigo-500" /> : getFileIcon(res.fileType)}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-slate-900 truncate" title={res.title}>{res.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{res.type} {res.fileType && `• ${res.fileType}`}</p>
                    {res.size > 0 && <p className="text-xs text-slate-400 mt-0.5">{formatBytes(res.size)}</p>}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {res.type === 'link' ? 'Open Link' : 'Download File'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10MB Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">File Too Large</h3>
            <p className="text-sm text-slate-500 mb-6">Please compress then upload. Maximum allowed size is 10 MB.</p>
            <button onClick={() => setShowLimitModal(false)} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Understood</button>
          </div>
        </div>
      )}

      {/* 95% Storage Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Storage Almost Full</h3>
            <p className="text-sm text-slate-500 mb-6">You have used up to 95% of your allowed storage. Please delete old resources to free up space before uploading new ones.</p>
            <button onClick={() => setShowStorageModal(false)} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">I'll manage resources</button>
          </div>
        </div>
      )}

    </div>
  );
}
