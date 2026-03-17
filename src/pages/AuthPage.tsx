import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;

const AuthPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialTab = params.get("tab") === "login" ? "login" : "signup";
  const [tab, setTab] = useState<"signup" | "login">(initialTab);
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) });
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSignup = async (data: SignupData) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: LoginData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <span className="text-5xl">📚</span>
          <h2 className="mt-6 text-3xl font-bold text-primary-foreground">ICAN CBT Platform</h2>
          <p className="mt-3 text-primary-foreground/70 leading-relaxed">
            Prepare for your professional exams with realistic practice sessions, smart feedback, and detailed performance tracking.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <button onClick={() => navigate("/")} className="mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </button>

          {/* Tabs */}
          <div className="mb-8 flex rounded-lg border border-border p-1 bg-muted/50">
            {(["signup", "login"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signup" ? "Sign Up" : "Log In"}
              </button>
            ))}
          </div>

          {tab === "signup" ? (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...signupForm.register("name")} className="mt-1.5" />
                {signupForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-destructive">{signupForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" type="email" placeholder="you@example.com" {...signupForm.register("email")} className="mt-1.5" />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="s-pw">Password</Label>
                <div className="relative mt-1.5">
                  <Input id="s-pw" type={showPw ? "text" : "password"} placeholder="••••••••" {...signupForm.register("password")} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="s-cpw">Confirm Password</Label>
                <Input id="s-cpw" type="password" placeholder="••••••••" {...signupForm.register("confirmPassword")} className="mt-1.5" />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="gradient-primary gradient-btn-hover w-full rounded-lg py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <Label htmlFor="l-email">Email</Label>
                <Input id="l-email" type="email" placeholder="you@example.com" {...loginForm.register("email")} className="mt-1.5" />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="l-pw">Password</Label>
                <div className="relative mt-1.5">
                  <Input id="l-pw" type={showPw ? "text" : "password"} placeholder="••••••••" {...loginForm.register("password")} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                </div>
                <button type="button" onClick={() => toast.info("Password reset link has been sent to your email.")} className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="gradient-primary gradient-btn-hover w-full rounded-lg py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Log In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
