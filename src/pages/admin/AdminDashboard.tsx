import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, ArrowLeft, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import JsonImportDialog from "@/components/admin/JsonImportDialog";

interface ExamRow {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  published: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const { isLoading } = useAdminCheck();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject, duration_minutes, total_marks, published, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load exams");
    } else {
      setExams((data as ExamRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading) fetchExams();
  }, [isLoading]);

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from("exams").update({ published: !current }).eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(current ? "Unpublished" : "Published");
      fetchExams();
    }
  };

  const deleteExam = async (id: string) => {
    if (!confirm("Delete this exam and all its questions?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      fetchExams();
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Admin Portal</h1>
            <p className="mt-1 text-primary-foreground/70">Manage exams, questions & content</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
            <Button variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Exams ({exams.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => {
              toast.info("Generating SQL export...");
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-database`,
                  { headers: { Authorization: `Bearer ${session?.access_token}` } }
                );
                if (!res.ok) throw new Error(await res.text());
                const sql = await res.text();
                const blob = new Blob([sql], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "ican-cbt-full-export.sql";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("SQL export downloaded!");
              } catch (e) {
                toast.error("Export failed: " + (e instanceof Error ? e.message : "Unknown error"));
              }
            }}>
              <Download className="h-4 w-4 mr-1" /> Export SQL
            </Button>
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4 mr-1" /> Import JSON
            </Button>
            <Button onClick={() => navigate("/admin/exam/new")}>
              <Plus className="h-4 w-4 mr-1" /> Create Exam
            </Button>
          </div>
        </div>

        {exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-4">No exams yet. Create your first exam or import from JSON.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowImport(true)}>
                  <Upload className="h-4 w-4 mr-1" /> Import JSON
                </Button>
                <Button onClick={() => navigate("/admin/exam/new")}>
                  <Plus className="h-4 w-4 mr-1" /> Create Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="border border-border">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.subject} · {exam.duration_minutes} mins · {exam.total_marks} marks
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${exam.published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {exam.published ? "Published" : "Draft"}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => togglePublish(exam.id, exam.published)} title={exam.published ? "Unpublish" : "Publish"}>
                      {exam.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/exam/${exam.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteExam(exam.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <JsonImportDialog open={showImport} onClose={() => setShowImport(false)} onImported={fetchExams} />
    </div>
  );
};

export default AdminDashboard;
