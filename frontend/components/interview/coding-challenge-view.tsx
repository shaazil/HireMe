"use client";

import { useState, useEffect } from "react";
import { Code2, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";

interface TestResult {
  test: number;
  passed: boolean;
  hidden: boolean;
}

interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  starter_code: Record<string, string>;
  public_test_cases: { input: string; expected: string }[];
  constraints?: string[];
}

interface CodingChallengeViewProps {
  sessionId: string;
  roleFromQuery: string;
}

export function CodingChallengeView({ sessionId, roleFromQuery }: CodingChallengeViewProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed_tests: number;
    total_tests: number;
    ai_feedback: string;
    test_results: TestResult[];
  } | null>(null);

  useEffect(() => {
    async function initCodingSession() {
      try {
        const challengeRes = await api.get(`/coding/challenge?session_id=${sessionId}`);
        const c = challengeRes.data;
        setChallenge(c);
        setCode(c.starter_code?.python || "# Write your solution here\n");
      } catch {
        toast.error("Failed to load coding environment.");
      }
    }
    if (sessionId) initCodingSession();
  }, [sessionId, roleFromQuery]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (challenge?.starter_code?.[lang]) {
      setCode(challenge.starter_code[lang]);
    } else {
      setCode(`// Write your ${lang} solution here\n`);
    }
  };

  const submitCode = async () => {
    if (!sessionId || !challenge) return;

    setIsSubmitting(true);
    setResults(null);

    try {
      const res = await api.post("/coding/submit", {
        session_id: sessionId,
        challenge_id: challenge.id,
        code,
        language,
      });
      setResults(res.data);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail || "Execution failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-[14px]">Preparing your coding challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      <div className="w-full lg:w-1/3 flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-border bg-muted/30">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
            Practical coding task
          </p>
          <h2 className="text-[18px] font-semibold tracking-tight">{challenge.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 prose prose-sm prose-slate dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{challenge.description}</ReactMarkdown>

          {challenge.constraints && challenge.constraints.length > 0 && (
            <div className="mt-6 not-prose">
              <h3 className="text-[13px] font-semibold mb-2 uppercase tracking-wide text-muted-foreground">
                Constraints
              </h3>
              <ul className="list-disc pl-5 text-[13px] space-y-1 text-foreground/90">
                {challenge.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-[13px] font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
              Sample cases
            </h3>
            <div className="space-y-3">
              {challenge.public_test_cases?.map((tc, idx) => (
                <div
                  key={idx}
                  className="bg-muted/50 border border-border rounded-lg p-3 font-mono text-[12px]"
                >
                  <div className="text-muted-foreground mb-1">Input</div>
                  <div className="mb-2 whitespace-pre-wrap">{tc.input}</div>
                  <div className="text-muted-foreground mb-1">Expected output</div>
                  <div className="whitespace-pre-wrap">{tc.expected}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
            <div className="flex gap-1 bg-muted p-1 rounded-md">
              {(["python", "javascript"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 text-[12px] font-medium rounded-sm capitalize transition-colors ${
                    language === lang
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={submitCode}
              disabled={isSubmitting || !sessionId}
              className="h-8 text-[12px] bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-1.5" />
              )}
              Run Code
            </Button>
          </div>

          <div className="flex-1 py-4">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                lineHeight: 24,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 8 },
              }}
            />
          </div>
        </div>

        {(results || isSubmitting) && (
          <div className="h-64 bg-card border border-border rounded-xl p-0 flex flex-col overflow-hidden shrink-0">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-[13px] font-medium">Execution results</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-[13px]">Evaluating your solution...</p>
                </div>
              ) : results ? (
                <div className="space-y-4">
                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      results.passed_tests === results.total_tests
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium text-[14px]">
                      {results.passed_tests === results.total_tests ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> All tests passed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" /> Some tests failed
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-semibold">
                        {results.passed_tests} / {results.total_tests}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/report/${sessionId}`)}
                        className="h-7 text-[12px]"
                      >
                        View report
                      </Button>
                    </div>
                  </div>

                  {results.ai_feedback && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Reviewer notes
                      </h4>
                      <div className="prose prose-sm prose-slate max-w-none text-[13px]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {results.ai_feedback}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
