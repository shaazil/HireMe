"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Download, ArrowLeft, Loader2, Sparkles, TrendingUp, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecommendationBadge } from "@/components/report/recommendation-badge";
import { ScoreRing } from "@/components/report/score-ring";
import { useAuthStore } from "@/store/auth-store";
import api from "@/services/api";
import { toast } from "sonner";

interface EvaluationReport {
  id: string;
  session_id: string;
  candidate_name: string;
  role_applied: string;
  overall_score: number;
  interview_score: number;
  coding_score: number;
  communication_score: number;
  technical_score: number;
  behavioral_score: number;
  strengths: string[];
  improvements: string[];
  ai_summary: string;
  recommendation: string;
  generated_at: string;
  application_status: string;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { user } = useAuthStore();

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await api.get(`/evaluations/${sessionId}`);
        setReport(res.data);
      } catch (err) {
        toast.error("Failed to load evaluation report");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [sessionId]);

  const updateApplicationStatus = async (status: string) => {
    try {
      await api.post(`/recruiter/applications/${sessionId}/status`, { status });
      toast.success(`Application marked as ${status}`);
      setReport(prev => prev ? { ...prev, application_status: status } : null);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-[14px]">Generating comprehensive AI report...</p>
        <p className="text-[12px] opacity-60 max-w-xs text-center">
          Analyzing interview transcript, coding logic, and communication skills.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          We couldn't find the evaluation report for this session. It might still be processing.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="-ml-3 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Title Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-2">
            Evaluation Report
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-[14px]">
            {report.candidate_name || "Candidate"} • {report.role_applied}
            <span>•</span>
            {new Date(report.generated_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric"
            })}
            <span>•</span>
            <span className="capitalize font-medium text-foreground">{report.application_status?.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'recruiter' && report.application_status !== 'hired' && report.application_status !== 'rejected' && (
            <div className="flex items-center gap-2 mr-4 border-r border-border pr-6">
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateApplicationStatus('rejected')}>
                Reject Candidate
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateApplicationStatus('hired')}>
                Hire Candidate
              </Button>
            </div>
          )}
          <RecommendationBadge recommendation={report.recommendation} />
        </div>
      </div>

      {/* Main Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Overall Score */}
        <div className="md:col-span-4 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <ScoreRing score={report.overall_score} label="Overall Score" size="lg" />
          <p className="text-[12px] text-muted-foreground mt-4 max-w-[200px] leading-relaxed">
            Composite score based on technical depth, problem-solving, and communication.
          </p>
        </div>

        {/* Detailed Scores */}
        <div className="md:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" /> 
            Skill Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ScoreRing score={report.technical_score} label="Technical" />
            <ScoreRing score={report.coding_score} label="Coding" />
            <ScoreRing score={report.communication_score} label="Communication" />
            <ScoreRing score={report.behavioral_score} label="Behavioral" />
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <h3 className="text-[16px] font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Executive Summary
        </h3>
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-[14px] leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.ai_summary}
          </ReactMarkdown>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
            {report.strengths.length === 0 && (
              <li className="text-muted-foreground text-[13px]">No specific strengths identified.</li>
            )}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {report.improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  !
                </span>
                <span className="text-muted-foreground">{improvement}</span>
              </li>
            ))}
            {report.improvements.length === 0 && (
              <li className="text-muted-foreground text-[13px]">No specific areas for improvement identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
