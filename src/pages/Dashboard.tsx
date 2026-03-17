import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Target, Trophy, LogOut, Shield, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCredits } from "@/hooks/useUserCredits";

interface ExamCard {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  question_count: number;
}

const stats = [
  { label: "Available Exams", value: "—", icon: BookOpen, key: "exams" },
  { label: "Attempts Left", value: "0", icon: Ticket, key: "attempts" },
  { label: "Questions Practiced", value: "0", icon: Target, key: "practiced" },
  { label: "Average Score", value: "—", icon: Trophy, key: "score" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [exams, setExams] = useState<ExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { remainingAttempts, hasAttempts, loading: creditsLoading } = useUserCredits();

  const [attemptStats, setAttemptStats] = useState({ practiced: 0, avgScore: "—" });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch exams
      const { data: examRows } = await supabase
        .from("exams")
        .select("id, title, subject, duration_minutes, total_marks")
        .eq("published", true);

      const cards: ExamCard[] = [];
      for (const e of examRows || []) {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("exam_id", e.id);
        cards.push({ ...e, question_count: count || 0 });
      }
      setExams(cards);

      // Fetch attempt stats
      if (user) {
        const { data: attempts } = await supabase
          .from("exam_attempts")
          .select("score, total_marks")
          .eq("user_id", user.id)
          .not("submitted_at", "is", null);
        
        if (attempts && attempts.length > 0) {
          const avgPct = Math.round(
            attempts.reduce((acc, a) => acc + ((a.score || 0) / (a.total_marks || 1)) * 100, 0) / attempts.length
          );
          setAttemptStats({ practiced: attempts.length, avgScore: `${avgPct}%` });
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const dynamicStats = [
    { ...stats[0], value: String(exams.length) },
    { ...stats[1], value: String(remainingAttempts) },
    { ...stats[2], value: String(attemptStats.practiced) },
    { ...stats[3], value: attemptStats.avgScore },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-6 py-12 md:py-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground md:text-4xl animate-fade-in">
              Welcome back, {user?.name || "Student"} 👋
            </h1>
            <p className="mt-2 text-lg text-primary-foreground/70">
              Continue preparing for your ICAN Professional exams
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors"
              >
                <Shield className="h-4 w-4" /> Admin
              </button>
            )}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 -mt-8 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10">
          {dynamicStats.map((s) => (
            <Card key={s.key} className="overflow-hidden border border-border shadow-sm">
              <div className="h-1 bg-primary" />
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exam Cards */}
        <h2 className="mb-5 text-xl font-semibold text-foreground">Select an Exam</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No published exams available yet.</p>
              {isAdmin && (
                <button onClick={() => navigate("/admin")} className="mt-3 text-sm text-primary hover:underline">
                  Go to Admin Portal to create exams
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                className="group overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/exam/${exam.id}`)}
              >
                <div className="gradient-primary p-5 relative">
                  {!hasAttempts && (
                    <div className="absolute top-3 right-3 rounded-full bg-destructive/90 px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
                      🔒 Locked
                    </div>
                  )}
                  <span className="text-3xl">📝</span>
                  <h3 className="mt-2 text-lg font-bold text-primary-foreground">{exam.subject}</h3>
                  <p className="text-sm text-primary-foreground/60">{exam.title}</p>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{exam.duration_minutes} mins</span>
                    <span>{exam.total_marks} marks</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{exam.question_count} questions</span>
                  </div>
                  <button className={`w-full rounded-lg py-2.5 text-sm font-semibold text-primary-foreground ${hasAttempts ? 'gradient-primary gradient-btn-hover' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                    {hasAttempts ? "Start Exam" : "Purchase Access"}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
