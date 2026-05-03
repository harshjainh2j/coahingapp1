"use client";
import DoubtChat from "@/components/DoubtChat";

export default function TeacherDoubtsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doubt Solving</h1>
        <p className="text-slate-500 mt-1">Answer questions and share insights with your batch in real-time.</p>
      </div>
      <DoubtChat />
    </div>
  );
}
