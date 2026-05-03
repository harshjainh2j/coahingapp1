"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Link as LinkIcon, FileText, Image as ImageIcon, File, FolderOpen, Download, ExternalLink } from "lucide-react";

export default function StudentResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/resources`, { withCredentials: true });
        setResources(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="w-10 h-10 text-blue-500" />;
    const ft = fileType.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ft)) return <ImageIcon className="w-10 h-10 text-pink-500" />;
    if (['pdf'].includes(ft)) return <FileText className="w-10 h-10 text-red-500" />;
    return <File className="w-10 h-10 text-blue-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Class Materials</h1>
        <p className="text-blue-100">
          Resources shared with batch: <span className="font-semibold bg-white/20 px-2 py-1 rounded">{user?.batch || 'Unassigned'}</span>
        </p>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FolderOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No Materials Yet</h3>
            <p className="text-slate-500 mt-1">Your teacher hasn't shared any resources for this batch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((res) => (
              <div key={res._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 p-3 bg-slate-50 rounded-xl">
                    {res.type === 'link' ? <LinkIcon className="w-10 h-10 text-indigo-500" /> : getFileIcon(res.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate" title={res.title}>{res.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Shared by {res.teacher?.name || 'Teacher'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded uppercase font-medium">
                        {res.type === 'link' ? 'Link' : res.fileType || 'File'}
                      </span>
                      {res.size > 0 && <span className="text-xs text-slate-400">{formatBytes(res.size)}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {res.type === 'link' ? (
                      <><ExternalLink className="w-4 h-4" /> Open Link</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download File</>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
