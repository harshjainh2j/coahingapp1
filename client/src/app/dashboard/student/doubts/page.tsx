"use client";
import DoubtChat from "@/components/DoubtChat";

export default function StudentDoubtsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doubt Solving</h1>
        <p className="text-slate-500 mt-1">Ask questions and discuss topics with your batch and teacher.</p>
      </div>
      <DoubtChat />
    </div>
  );
}
