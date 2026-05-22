"use client";

import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Reports</h1>
        <p className="text-[14px] text-muted-foreground">
          View your interview evaluation reports.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-[14px] font-medium mb-1">No reports yet</p>
        <p className="text-[13px] text-muted-foreground">
          Complete an interview to generate your first evaluation report.
        </p>
      </div>
    </div>
  );
}
