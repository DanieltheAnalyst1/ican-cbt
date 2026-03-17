import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Exam } from "@/data/examData";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Home, ChevronDown, ChevronUp, Lightbulb, Target, TrendingUp, BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import RichContent from "./RichContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResultsPageProps {
  exam: Exam;
  answers: Record<string, string>;
  attemptId?: string | null;
}

interface GradeResult {
  id: string;
  score: number;
  maxMarks: number;
  strengths: string[];
  improvements: string[];
}

const getPerformanceBand = (pct: number) => {
  if (pct >= 75) return { label: "Distinction", color: "text-success", bg: "bg-success/10" };
  if (pct >= 60) return { label: "Credit", color: "text-primary", bg: "bg-primary/10" };
  if (pct >= 50) return { label: "Pass", color: "text-secondary", bg: "bg-secondary/10" };
  return { label: "Fail", color: "text-destructive", bg: "bg-destructive/10" };
};

const ResultsPage = ({ exam, answers, attemptId }: ResultsPageProps) => {
  const navigate = useNavigate();
  const [expandedQ, setExpandedQ] = useState<Record<number, boolean>>({});
  const [showModelAnswer, setShowModelAnswer] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<Record<string, GradeResult>>({});
  const [grading, setGrading] = useState(true);

  // Call DeepSeek grading on mount
  useEffect(() => {
    const gradeExam = async () => {
      const allSubs = exam.questions.flatMap((q) =>
        q.subQuestions.map((s) => ({
          id: s.id,
          label: s.label,
          text: s.text,
          marks: s.marks,
          modelAnswer: s.modelAnswer,
          keyPoints: s.keyPoints,
          hints: s.hints,
        }))
      );

      try {
        const { data, error } = await supabase.functions.invoke("grade-answers", {
          body: { answers, subQuestions: allSubs },
        });

        if (error) throw error;

        const gradeMap: Record<string, GradeResult> = {};
        (data.grades || []).forEach((g: GradeResult) => {
          gradeMap[g.id] = g;
        });
        setGrades(gradeMap);

        // Update attempt score in DB
        if (attemptId) {
          const totalScore = Object.values(gradeMap).reduce((a, g) => a + g.score, 0);
          await supabase
            .from("exam_attempts")
            .update({ score: totalScore, total_marks: exam.totalMarks })
            .eq("id", attemptId);
        }
      } catch (err) {
        console.error("AI grading failed, using fallback:", err);
        toast.error("AI grading unavailable — using estimated scores");
        // Fallback to basic scoring
        const gradeMap: Record<string, GradeResult> = {};
        allSubs.forEach((s) => {
          const hasAnswer = !!answers[s.id]?.trim();
          gradeMap[s.id] = {
            id: s.id,
            score: hasAnswer ? Math.round(s.marks * 0.6) : 0,
            maxMarks: s.marks,
            strengths: hasAnswer ? ["Attempt was made"] : [],
            improvements: hasAnswer ? ["Review model answer"] : ["Question not attempted"],
          };
        });
        setGrades(gradeMap);
      } finally {
        setGrading(false);
      }
    };

    gradeExam();
  }, []);

  if (grading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-semibold text-foreground">AI is grading your answers...</p>
        <p className="text-sm text-muted-foreground">This may take a few seconds</p>
      </div>
    );
  }

  const questionScores = exam.questions.map((q) => {
    const subScores = q.subQuestions.map((sub) => {
      const grade = grades[sub.id];
      const hasAnswer = !!answers[sub.id]?.trim();
      return {
        ...sub,
        score: grade?.score ?? 0,
        hasAnswer,
        feedback: {
          strengths: grade?.strengths ?? [],
          improvements: grade?.improvements ?? [],
        },
      };
    });
    const totalScore = subScores.reduce((acc, s) => acc + s.score, 0);
    return { ...q, subScores, totalScore };
  });

  const totalScore = questionScores.reduce((acc, q) => acc + q.totalScore, 0);
  const pct = Math.round((totalScore / exam.totalMarks) * 100);
  const band = getPerformanceBand(pct);

  const getScoreColor = (pct: number) => {
    if (pct >= 70) return "text-success";
    if (pct >= 50) return "text-secondary";
    return "text-destructive";
  };

  const toggleQ = (id: number) => setExpandedQ((p) => ({ ...p, [id]: !p[id] }));
  const toggleModel = (id: string) => setShowModelAnswer((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="gradient-primary px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Exam Results</h1>
        <p className="mt-1 text-primary-foreground/60">{exam.subject}</p>
        <div className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm h-32 w-32">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-foreground">{pct}%</p>
            <p className="text-sm text-primary-foreground/60">{totalScore}/{exam.totalMarks}</p>
          </div>
        </div>
        <div className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${band.bg} ${band.color}`}>
          {band.label}
        </div>
        <p className="mt-2 text-xs text-primary-foreground/40">Graded by AI</p>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Overall Summary */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Performance Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-muted-foreground">Questions Attempted</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {questionScores.reduce((a, q) => a + q.subScores.filter((s) => s.hasAnswer).length, 0)}/{exam.questions.reduce((a, q) => a + q.subQuestions.length, 0)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-muted-foreground">Strongest Area</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                Q{questionScores.reduce((best, q) => (q.totalScore / q.totalMarks) > (best.totalScore / best.totalMarks) ? q : best).id}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-muted-foreground">Needs Attention</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                Q{questionScores.reduce((worst, q) => (q.totalScore / q.totalMarks) < (worst.totalScore / worst.totalMarks) ? q : worst).id}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4 text-sm">
            <p className="font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Study Recommendation
            </p>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              {pct >= 70
                ? "Excellent performance! Focus on maintaining consistency and refining your weaker areas for exam-day confidence."
                : pct >= 50
                ? "Solid foundation — revisit the questions where you scored below 60% and study the model answers. Practice writing under timed conditions."
                : "Focus on understanding the core concepts before attempting more practice exams. Study the model answers carefully and note the key points for each topic."}
            </p>
          </div>
        </div>

        {/* Question Cards */}
        {questionScores.map((q) => {
          const qPct = Math.round((q.totalScore / q.totalMarks) * 100);
          const isExpanded = expandedQ[q.id] ?? false;

          return (
            <div key={q.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <button
                onClick={() => toggleQ(q.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">Q{q.id}</h3>
                  <Progress value={qPct} className="h-2 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${getScoreColor(qPct)}`}>
                    {q.totalScore}/{q.totalMarks}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 space-y-4">
                  {q.subScores.map((sub) => {
                    const subPct = sub.marks > 0 ? Math.round((sub.score / sub.marks) * 100) : 0;
                    const showModel = showModelAnswer[sub.id] ?? false;

                    return (
                      <div key={sub.id} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sub.hasAnswer ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium text-foreground">({sub.label})</span>
                            <span className="text-xs text-muted-foreground">{sub.text.slice(0, 60)}…</span>
                          </div>
                          <span className={`font-mono font-semibold ${getScoreColor(subPct)}`}>
                            {sub.score}/{sub.marks}
                          </span>
                        </div>

                        {sub.hasAnswer && (
                          <div className="rounded-lg bg-muted/30 p-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Your Answer</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{answers[sub.id]}</p>
                          </div>
                        )}

                        <button
                          onClick={() => toggleModel(sub.id)}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          {showModel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {showModel ? "Hide Model Answer" : "View Model Answer"}
                        </button>

                        {showModel && (
                          <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-3">
                            <p className="text-xs font-semibold text-primary mb-1">Model Answer</p>
                            <RichContent content={sub.modelAnswer} className="text-sm text-foreground" />
                          </div>
                        )}

                        {/* AI Feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sub.feedback.strengths.length > 0 && (
                            <div className="rounded-lg bg-success/5 p-3">
                              <p className="text-xs font-semibold text-success mb-1 flex items-center gap-1">
                                <Target className="h-3 w-3" /> Strengths
                              </p>
                              <ul className="text-xs text-foreground/80 space-y-1">
                                {sub.feedback.strengths.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {sub.feedback.improvements.length > 0 && (
                            <div className="rounded-lg bg-destructive/5 p-3">
                              <p className="text-xs font-semibold text-destructive mb-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Areas to Improve
                              </p>
                              <ul className="text-xs text-foreground/80 space-y-1">
                                {sub.feedback.improvements.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {sub.hints.length > 0 && (
                          <div className="rounded-lg bg-secondary/10 p-3">
                            <p className="text-xs font-semibold text-secondary mb-1 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" /> Speed Hints
                            </p>
                            <ul className="text-xs text-foreground/80 space-y-1">
                              {sub.hints.map((h, i) => (
                                <li key={i}>💡 {h}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => navigate("/dashboard")}
          className="gradient-primary gradient-btn-hover w-full rounded-xl py-3 text-sm font-bold text-primary-foreground flex items-center justify-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </button>
      </main>
    </div>
  );
};

export default ResultsPage;
