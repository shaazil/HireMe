"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MoreHorizontal, FileText, ChevronDown, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { toast } from "sonner";

interface CandidateSession {
  session_id: string;
  candidate_name: string;
  candidate_email: string;
  role_applied: string;
  completed_at: string;
  score: number | null;
  recommendation: string;
  application_status: string;
  resume_url: string | null;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CandidateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await api.get("/recruiter/candidates");
        setSessions(res.data.data);
      } catch (err) {
        toast.error("Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const filteredSessions = sessions.filter(s => 
    s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role_applied.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecommendationBadge = (rec: string) => {
    switch (rec.toLowerCase()) {
      case "strong_hire":
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"><CheckCircle2 className="w-3 h-3"/> Strong Hire</span>;
      case "hire":
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"><CheckCircle2 className="w-3 h-3"/> Hire</span>;
      case "maybe":
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"><AlertCircle className="w-3 h-3"/> Maybe</span>;
      case "pass":
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"><XCircle className="w-3 h-3"/> Pass</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[12px] font-medium">Pending</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground text-[14px]">Review and evaluate completed interview sessions.</p>
        </div>
        <Button>Export CSV</Button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates or roles..." 
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-10 text-[13px] bg-card">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Candidate</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Role Applied</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Completed</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Overall Score</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Recommendation</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={`skel-${i}`}>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-3 w-40" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No candidates found.</td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr key={session.session_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground text-[14px]">{session.candidate_name}</div>
                    <div className="text-muted-foreground text-[12px]">{session.candidate_email || "No email provided"}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{session.role_applied}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(session.completed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-[13px] font-medium text-foreground">{session.application_status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    {session.score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px]">{session.score.toFixed(1)}</span>
                        <span className="text-[11px] text-muted-foreground">/ 5.0</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getRecommendationBadge(session.recommendation)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {session.resume_url && (
                      <a href={session.resume_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="text-[12px] h-8">
                          Resume
                        </Button>
                      </a>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[12px] h-8"
                      onClick={() => router.push(`/recruiter/report/${session.session_id}`)}
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      Report
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
