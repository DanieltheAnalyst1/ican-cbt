import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart3, Brain, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const features = [
  { icon: BookOpen, title: "Practice Exams", desc: "Realistic ICAN exam simulations with timed sessions and authentic question formats." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Monitor your performance across subjects and identify areas for improvement." },
  { icon: TrendingUp, title: "Performance Insights", desc: "Detailed analytics and scoring breakdowns after every practice session." },
  { icon: Brain, title: "Smart Feedback", desc: "AI-powered evaluation with model answers, hints, and study recommendations." },
];

const stats = [
  { value: "500+", label: "Practice Questions" },
  { value: "6", label: "Exam Papers" },
  { value: "24/7", label: "Access Anywhere" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">ICAN CBT</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth?tab=login")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="gradient-primary gradient-btn-hover rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Master Your ICAN Exams with <span className="text-primary">Confidence</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Practice with realistic exam simulations, track your progress, and get intelligent feedback to accelerate your preparation.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="gradient-primary gradient-btn-hover flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/auth?tab=login")}
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">Everything You Need to Succeed</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-border bg-muted/40 px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-around gap-8 sm:flex-row">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-muted-foreground">© 2024 ICAN CBT Platform. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
