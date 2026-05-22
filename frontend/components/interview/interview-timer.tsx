"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function InterviewTimer({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md text-[13px] font-medium tabular-nums">
      <Clock className="w-3.5 h-3.5" />
      {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
