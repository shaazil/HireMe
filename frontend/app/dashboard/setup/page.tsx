"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileUp, ArrowRight, Briefcase, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { toast } from "sonner";
import { Suspense } from "react";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vacancyId = searchParams.get("vacancy_id");
  const [role, setRole] = useState("Software Engineer");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!role.trim()) {
      toast.error("Please enter a role");
      return;
    }

    setIsLoading(true);
    // In a full implementation, upload the resume file here.
    
    // Redirect to interview with role in URL
    let url = `/dashboard/interview?role=${encodeURIComponent(role)}`;
    if (vacancyId) {
      url += `&vacancy_id=${vacancyId}`;
    }
    router.push(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center max-w-xl mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Briefcase className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">
        Let's set up your interview
      </h1>
      <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed">
        Upload your resume and tell us the position you're applying for. The AI will customize the interview questions and coding challenge based on your background.
      </p>

      <div className="w-full space-y-5 bg-card border border-border p-6 rounded-2xl text-left mb-8">
        
        {/* Role Input (hidden if vacancy_id is provided, otherwise show it) */}
        {!vacancyId && (
          <div className="space-y-2">
            <label className="text-[13px] font-medium">Target Role</label>
            <Input 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              placeholder="e.g. Frontend Developer, Data Scientist..."
              className="h-11"
            />
          </div>
        )}

        {/* Resume Upload (Mock UI) */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium">Resume (Optional)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <FileText className="w-8 h-8 text-primary mb-2" />
                  <p className="text-[13px] font-medium text-foreground">{file.name}</p>
                </>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <p className="text-[13px] font-medium text-muted-foreground">
                    Click to upload PDF
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

      </div>

      <Button 
        onClick={handleStart} 
        disabled={isLoading}
        className="h-12 w-full max-w-sm text-[14px]"
      >
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {isLoading ? "Preparing Interview..." : "Continue to Interview"}
        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
