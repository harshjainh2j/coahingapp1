"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import io, { Socket } from "socket.io-client";
import { Send, Image as ImageIcon, X, Trash2, MessageSquare } from "lucide-react";

export default function DoubtChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : "http://localhost:5000";

  useEffect(() => {
    fetchMessages();

    // Initialize Socket
    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    if (user?.batch) {
      socketRef.current.emit("join_batch", user.batch);
    }

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for deleted messages
    socketRef.current.on("message_deleted", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${apiUrl}/doubts`, { withCredentials: true });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append("text", newMessage);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${apiUrl}/doubts`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Emit through socket
      if (socketRef.current) {
        socketRef.current.emit("send_message", { batch: user?.batch, message: res.data });
      }

      setNewMessage("");
      clearImage();
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await axios.delete(`${apiUrl}/doubts/${messageId}`, { withCredentials: true });
      
      // Emit delete event
      if (socketRef.current) {
        socketRef.current.emit("delete_message", { batch: user?.batch, messageId });
      }
    } catch (err) {
      console.error("Failed to delete message", err);
      alert("You can only delete your own messages.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Doubt Solving</h2>
          <p className="text-sm text-slate-500">Batch: {user?.batch}</p>
        </div>
        <div className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
          Messages auto-delete after 30 days
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
            <p>No messages yet. Start asking doubts!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?.id || msg.sender?.userId === user?.userId;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className={`text-xs font-medium ${isMe ? 'text-blue-600' : 'text-slate-600'}`}>
                    {isMe ? 'You' : msg.sender?.name}
                  </span>
                  {!isMe && (
                    <span className="text-[10px] text-slate-400 uppercase border border-slate-200 rounded px-1">
                      {msg.sender?.role}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`relative group max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={msg.imageUrl} 
                        alt="attachment" 
                        className="max-w-full h-auto max-h-64 rounded-xl mb-2 object-contain bg-white"
                      />
                    </a>
                  )}
                  {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                  
                  {isMe && (
                    <button 
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {imagePreview && (
          <div className="relative inline-block mb-3">
            <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200" />
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*"
          />
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your doubt here..."
            className="flex-1 max-h-32 min-h-[44px] resize-none rounded-xl border border-slate-300 py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <button 
            type="submit"
            disabled={sending || (!newMessage.trim() && !imageFile)}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
