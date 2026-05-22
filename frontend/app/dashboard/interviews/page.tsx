"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface InterviewSession {
  id: string;
  role_applied: string;
  created_at: string;
  status: string;
  application_status: string;
  vacancy: {
    title: string;
    company: string;
  } | null;
}

export default function MyInterviewsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await api.get("/candidates/history");
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const getStatusBadge = (status: string, appStatus: string) => {
    if (appStatus === "hired") {
      return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Hired</span>;
    }
    if (appStatus === "rejected") {
      return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
    }
    if (appStatus === "under_review" || status === "completed") {
      return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">Under Review</span>;
    }
    if (status === "in_progress") {
      return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">In Progress</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">Applied</span>;
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">My Interviews</h1>
        <p className="text-muted-foreground text-[14px]">Track your past interviews and application statuses.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-[14px]">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-[16px] font-medium mb-1">No interviews yet</h3>
          <p className="text-[14px] text-muted-foreground mb-6">You haven't taken any AI interviews.</p>
          <Button onClick={() => router.push("/dashboard")}>View Job Board</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[16px] font-semibold">{session.vacancy ? session.vacancy.title : session.role_applied}</h3>
                  {getStatusBadge(session.status, session.application_status)}
                </div>
                <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                  {session.vacancy && <span className="font-medium">{session.vacancy.company}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => router.push(`/dashboard/report/${session.id}`)}
                className="shrink-0"
              >
                View Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
