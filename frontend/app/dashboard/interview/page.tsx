"use client";

import { useState, useRef, useEffect } from "react";
import { Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { toast } from "sonner";

import { ChatMessage } from "@/components/interview/chat-message";
import { ChatInput } from "@/components/interview/chat-input";
import { InterviewTimer } from "@/components/interview/interview-timer";
import { VideoPreview } from "@/components/interview/video-preview";
import { CodingChallengeView } from "@/components/interview/coding-challenge-view";
import { Suspense } from "react";

interface Message {
  id: string;
  role: "ai" | "user" | "system";
  content: string;
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role") || "Software Engineer";
  const vacancyId = searchParams.get("vacancy_id");
  
  // Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showCodingRound, setShowCodingRound] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentQuestionText, setCurrentQuestionText] = useState<string>("");

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Setup start
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/interviews/start", {
        role_applied: roleFromQuery,
        interaction_mode: "text",
        vacancy_id: vacancyId,
      });

      setSessionId(res.data.session_id);
      setTotalQuestions(res.data.total_questions);
      setCurrentQuestionNumber(res.data.question_number);
      setCurrentCategory(res.data.category);
      setCurrentQuestionText(res.data.first_question);
      setStartedAt(new Date().toISOString());

      setMessages([
        { id: "sys-1", role: "system", content: "Interview Session Started" },
        { id: "ai-1", role: "ai", content: res.data.first_question },
      ]);
      setHasStarted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");
    
    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: userText },
    ]);

    setIsLoading(true);

    try {
      const res = await api.post("/interviews/respond", {
        session_id: sessionId,
        question_text: currentQuestionText,
        response_text: userText,
        category: currentCategory,
      });

      if (res.data.feedback) {
        setMessages((prev) => [
          ...prev,
          {
            id: `fb-${Date.now()}`,
            role: "system",
            content: res.data.feedback,
          },
        ]);
      }

      if (res.data.interview_complete) {
        setIsComplete(true);
        setMessages((prev) => [
          ...prev,
          { id: "sys-2", role: "system", content: "Verbal interview complete" },
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            content:
              "Thanks for the thoughtful answers. When you're ready, we'll move on to a short coding exercise — take a moment if you need one.",
          },
        ]);

        setTimeout(() => {
          setShowCodingRound(true);
        }, 2500);
      } else {
        // Next question
        setCurrentQuestionNumber(res.data.question_number);
        setCurrentCategory(res.data.next_category || "behavioral");
        setCurrentQuestionText(res.data.next_question || "");

        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, role: "ai", content: res.data.next_question || "" },
        ]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send response");
      // Add a system error message so they know it failed
      setMessages((prev) => [
        ...prev,
        { id: `sys-err-${Date.now()}`, role: "system", content: "Failed to send. Please try again." },
      ]);
      setInputValue(userText); // restore input
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Pre-start Screen ───
  if (!hasStarted) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] items-center justify-center max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight mb-3">
          Interview with HireMe
        </h1>
        <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed max-w-lg">
          A conversational interview tailored to your resume and the role you applied for.
          Expect {totalQuestions} focused questions — then a practical coding exercise.
        </p>

        <div className="bg-card border border-border p-5 rounded-2xl w-full max-w-sm mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium">Text-based chat</p>
              <p className="text-[12px] text-muted-foreground">Type your answers naturally.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium">Personalized flow</p>
              <p className="text-[12px] text-muted-foreground">Questions reference your projects and background.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium">~15 minutes</p>
              <p className="text-[12px] text-muted-foreground">Take your time, there is no strict timer.</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={startInterview} 
          disabled={isLoading}
          className="h-12 px-8 text-[14px]"
        >
          {isLoading ? "Starting Session..." : "Start Interview"}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    );
  }

  // ─── Active Interview Interface ───
  if (showCodingRound && sessionId) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] gap-4">
        <div className="shrink-0 px-1">
          <h1 className="text-[20px] font-semibold tracking-tight">Coding exercise</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            A practical problem aligned with your {roleFromQuery} interview — work at your own pace.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <CodingChallengeView sessionId={sessionId} roleFromQuery={roleFromQuery} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:flex-row gap-6">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-card/50 rounded-2xl border border-border overflow-hidden">
        
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-5 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold leading-none">Your interviewer</h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                {Math.min(currentQuestionNumber, totalQuestions)} of {totalQuestions}
                {currentCategory
                  ? ` · ${currentCategory.replace(/_/g, " ")}`
                  : ""}
              </p>
            </div>
          </div>
          <InterviewTimer startedAt={startedAt} />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {isLoading && (
            <div className="flex w-full mb-8 justify-start">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-card border border-border rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Container */}
        <div className="p-4 bg-card border-t border-border shrink-0">
          {isComplete ? (
            <div className="text-center">
              <p className="text-[13px] text-muted-foreground mb-3">The interview has concluded.</p>
              <Button onClick={() => setShowCodingRound(true)}>
                Proceed to Coding
              </Button>
            </div>
          ) : (
            <ChatInput 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Sidebar Overlay (Video & Info) */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <VideoPreview />
        
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-[13px] font-semibold mb-3">Interview Progress</h3>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {/* Progress visually represented using simple segments */}
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground mb-2">
              <span>{Math.round(((currentQuestionNumber - 1) / totalQuestions) * 100)}% Complete</span>
              <span>{currentQuestionNumber - 1}/{totalQuestions} Qs</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${Math.min(((currentQuestionNumber - 1) / totalQuestions) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="mt-5 text-[12px] text-muted-foreground leading-relaxed">
            <p>
              Answer naturally, as you would with a recruiter. Specific examples from your
              projects work best — mention tools, trade-offs, and outcomes.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
