import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, GripVertical, ImagePlus } from "lucide-react";
import RichContent from "@/components/exam/RichContent";

interface SubQ {
  id?: string;
  label: string;
  text: string;
  marks: number;
  model_answer: string;
  hints: string[];
  key_points: string[];
}

interface FinTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface ImgData {
  src: string;
  alt: string;
  caption?: string;
}

interface Question {
  id?: string;
  question_number: number;
  title: string;
  scenario: string;
  required: string;
  financial_tables: FinTable[];
  images: ImgData[];
  sub_questions: SubQ[];
  section_id?: string;
}

interface SectionData {
  id?: string;
  label: string;
  instructions: string;
  total_questions: number;
  required_questions: number;
  is_compulsory: boolean;
  sort_order: number;
}

interface ExamData {
  title: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  instructions: string;
  published: boolean;
}

const ExamEditor = () => {
  const { examId } = useParams<{ examId: string }>();
  const isNew = examId === "new";
  const navigate = useNavigate();
  const { isLoading: adminLoading } = useAdminCheck();

  const [exam, setExam] = useState<ExamData>({
    title: "",
    subject: "",
    duration_minutes: 180,
    total_marks: 100,
    instructions: "",
    published: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [activeQ, setActiveQ] = useState(0);
  const [previewField, setPreviewField] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && !adminLoading) loadExam();
  }, [isNew, adminLoading]);

  const loadExam = async () => {
    setLoading(true);
    const { data: examData, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();
    if (error || !examData) {
      toast.error("Exam not found");
      navigate("/admin");
      return;
    }
    setExam({
      title: examData.title,
      subject: examData.subject,
      duration_minutes: examData.duration_minutes,
      total_marks: examData.total_marks,
      instructions: examData.instructions || "",
      published: examData.published,
    });

    // Load sections
    const { data: sectionRows } = await supabase
      .from("exam_sections")
      .select("*")
      .eq("exam_id", examId)
      .order("sort_order");

    const loadedSections: SectionData[] = (sectionRows || []).map((s: any) => ({
      id: s.id,
      label: s.label,
      instructions: s.instructions || "",
      total_questions: s.total_questions,
      required_questions: s.required_questions,
      is_compulsory: s.is_compulsory,
      sort_order: s.sort_order,
    }));
    setSections(loadedSections);

    const { data: qs } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("sort_order");

    const loadedQuestions: Question[] = [];
    for (const q of (qs || [])) {
      const { data: subs } = await supabase
        .from("sub_questions")
        .select("*")
        .eq("question_id", q.id)
        .order("sort_order");

      loadedQuestions.push({
        id: q.id,
        question_number: q.question_number,
        title: q.title,
        scenario: q.scenario,
        required: q.required,
        financial_tables: (q.financial_tables as unknown as FinTable[]) || [],
        images: (q.images as unknown as ImgData[]) || [],
        section_id: q.section_id || undefined,
        sub_questions: (subs || []).map((s: any) => ({
          id: s.id,
          label: s.label,
          text: s.text,
          marks: s.marks,
          model_answer: s.model_answer || "",
          hints: (s.hints as string[]) || [],
          key_points: (s.key_points as string[]) || [],
        })),
      });
    }
    setQuestions(loadedQuestions);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!exam.title || !exam.subject) {
      toast.error("Title and subject are required");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let eid: string;
      if (isNew) {
        const { data, error } = await supabase
          .from("exams")
          .insert({ ...exam, created_by: user.id })
          .select("id")
          .single();
        if (error) throw error;
        eid = data.id;
      } else {
        const { error } = await supabase.from("exams").update(exam).eq("id", examId);
        if (error) throw error;
        eid = examId!;

        // Delete old sections and questions (cascade deletes sub_questions)
        await supabase.from("exam_sections").delete().eq("exam_id", eid);
        await supabase.from("questions").delete().eq("exam_id", eid);
      }

      // Insert sections and build ID map
      const sectionIdMap: Record<number, string> = {};
      for (let si = 0; si < sections.length; si++) {
        const s = sections[si];
        const { data: secData, error: secErr } = await supabase
          .from("exam_sections")
          .insert({
            exam_id: eid,
            label: s.label,
            instructions: s.instructions,
            total_questions: s.total_questions,
            required_questions: s.required_questions,
            is_compulsory: s.is_compulsory,
            sort_order: si,
          })
          .select("id")
          .single();
        if (secErr) throw secErr;
        sectionIdMap[si] = secData.id;
      }

      // Insert questions and sub-questions
      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        // Find the section index for this question
        const sectionIdx = sections.findIndex((s, i) => {
          // Match by old id or by index
          if (q.section_id && s.id === q.section_id) return true;
          return false;
        });
        const newSectionId = sectionIdx >= 0 ? sectionIdMap[sectionIdx] : (sections.length > 0 ? sectionIdMap[0] : undefined);

        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .insert({
            exam_id: eid,
            question_number: q.question_number,
            title: q.title,
            scenario: q.scenario,
            required: q.required,
            financial_tables: q.financial_tables as any,
            images: q.images as any,
            sort_order: qi,
            section_id: newSectionId || null,
          })
          .select("id")
          .single();
        if (qErr) throw qErr;

        if (q.sub_questions.length > 0) {
          const subs = q.sub_questions.map((s, si) => ({
            question_id: qData.id,
            label: s.label,
            text: s.text,
            marks: s.marks,
            model_answer: s.model_answer,
            hints: s.hints as any,
            key_points: s.key_points as any,
            sort_order: si,
          }));
          const { error: sErr } = await supabase.from("sub_questions").insert(subs);
          if (sErr) throw sErr;
        }
      }

      toast.success(isNew ? "Exam created!" : "Exam saved!");
      if (isNew) navigate(`/admin/exam/${eid}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const nextLabel = `Section ${String.fromCharCode(65 + sections.length)}`;
    setSections((prev) => [
      ...prev,
      { label: nextLabel, instructions: "", total_questions: 1, required_questions: 1, is_compulsory: false, sort_order: prev.length },
    ]);
  };

  const updateSection = (idx: number, updates: Partial<SectionData>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const removeSection = (idx: number) => {
    const sectionId = sections[idx].id;
    setSections((prev) => prev.filter((_, i) => i !== idx));
    // Unassign questions from this section
    if (sectionId) {
      setQuestions((prev) => prev.map((q) => (q.section_id === sectionId ? { ...q, section_id: undefined } : q)));
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_number: prev.length + 1,
        title: `Question ${prev.length + 1}`,
        scenario: "",
        required: "",
        financial_tables: [],
        images: [],
        sub_questions: [{ label: "a", text: "", marks: 5, model_answer: "", hints: [], key_points: [] }],
        section_id: sections.length > 0 ? sections[0].id : undefined,
      },
    ]);
    setActiveQ(questions.length);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (activeQ >= questions.length - 1) setActiveQ(Math.max(0, questions.length - 2));
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...updates } : q)));
  };

  const addSubQuestion = (qIdx: number) => {
    const q = questions[qIdx];
    const nextLabel = String.fromCharCode(97 + q.sub_questions.length);
    updateQuestion(qIdx, {
      sub_questions: [...q.sub_questions, { label: nextLabel, text: "", marks: 5, model_answer: "", hints: [], key_points: [] }],
    });
  };

  const updateSub = (qIdx: number, sIdx: number, updates: Partial<SubQ>) => {
    const q = questions[qIdx];
    const newSubs = q.sub_questions.map((s, i) => (i === sIdx ? { ...s, ...updates } : s));
    updateQuestion(qIdx, { sub_questions: newSubs });
  };

  const removeSub = (qIdx: number, sIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { sub_questions: q.sub_questions.filter((_, i) => i !== sIdx) });
  };

  const addTable = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, {
      financial_tables: [...q.financial_tables, { title: "New Table", headers: ["Item", "Value"], rows: [["", ""]] }],
    });
  };

  const updateTable = (qIdx: number, tIdx: number, table: FinTable) => {
    const q = questions[qIdx];
    const newTables = q.financial_tables.map((t, i) => (i === tIdx ? table : t));
    updateQuestion(qIdx, { financial_tables: newTables });
  };

  const removeTable = (qIdx: number, tIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { financial_tables: q.financial_tables.filter((_, i) => i !== tIdx) });
  };

  const addImage = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { images: [...q.images, { src: "", alt: "", caption: "" }] });
  };

  const handleImageUpload = async (qIdx: number, imgIdx: number, file: File) => {
    const path = `exam-images/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("exam-images").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("exam-images").getPublicUrl(path);
    const q = questions[qIdx];
    const newImages = q.images.map((img, i) => (i === imgIdx ? { ...img, src: data.publicUrl } : img));
    updateQuestion(qIdx, { images: newImages });
    toast.success("Image uploaded");
  };

  if (adminLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentQ = questions[activeQ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">{isNew ? "Create Exam" : "Edit Exam"}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Exam Metadata */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Exam Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} placeholder="Advanced Audit - Nov 2024" className="mt-1" />
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={exam.subject} onChange={(e) => setExam({ ...exam, subject: e.target.value })} placeholder="Advanced Audit and Assurance" className="mt-1" />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" value={exam.duration_minutes} onChange={(e) => setExam({ ...exam, duration_minutes: parseInt(e.target.value) || 180 })} className="mt-1" />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={exam.total_marks} onChange={(e) => setExam({ ...exam, total_marks: parseInt(e.target.value) || 100 })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea value={exam.instructions} onChange={(e) => setExam({ ...exam, instructions: e.target.value })} placeholder="One instruction per line..." className="mt-1 min-h-[80px]" />
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Sections ({sections.length})</h2>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-3 w-3 mr-1" /> Add Section
              </Button>
            </div>
            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground">No sections defined. All questions will be treated as one group.</p>
            )}
            {sections.map((sec, si) => (
              <div key={si} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Input
                      value={sec.label}
                      onChange={(e) => updateSection(si, { label: e.target.value })}
                      className="w-40"
                      placeholder="Section A"
                    />
                    <label className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={sec.is_compulsory}
                        onChange={(e) => updateSection(si, { is_compulsory: e.target.checked })}
                        className="rounded"
                      />
                      Compulsory
                    </label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSection(si)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Total Questions</Label>
                    <Input
                      type="number"
                      value={sec.total_questions}
                      onChange={(e) => updateSection(si, { total_questions: parseInt(e.target.value) || 1 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Required Questions</Label>
                    <Input
                      type="number"
                      value={sec.required_questions}
                      onChange={(e) => updateSection(si, { required_questions: parseInt(e.target.value) || 1 })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Instructions</Label>
                  <Input
                    value={sec.instructions}
                    onChange={(e) => updateSection(si, { instructions: e.target.value })}
                    placeholder="Answer ALL questions in this section."
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-6">
          {/* Question list sidebar */}
          <div className="w-48 flex-shrink-0 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Questions</h3>
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveQ(i)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeQ === i ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <GripVertical className="inline h-3 w-3 mr-1 opacity-50" />
                Q{q.question_number}
              </button>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addQuestion}>
              <Plus className="h-3 w-3 mr-1" /> Add Question
            </Button>
          </div>

          {/* Question editor */}
          <div className="flex-1 space-y-4">
            {currentQ ? (
              <>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Question {currentQ.question_number}</h3>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeQuestion(activeQ)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                    {sections.length > 0 && (
                      <div>
                        <Label>Section</Label>
                        <select
                          value={currentQ.section_id || ""}
                          onChange={(e) => updateQuestion(activeQ, { section_id: e.target.value || undefined })}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">— No Section —</option>
                          {sections.map((s, si) => (
                            <option key={si} value={s.id || `new-${si}`}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <Label>Title</Label>
                      <Input value={currentQ.title} onChange={(e) => updateQuestion(activeQ, { title: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Scenario (Markdown + KaTeX supported)</Label>
                        <button className="text-xs text-primary hover:underline" onClick={() => setPreviewField(previewField === "scenario" ? null : "scenario")}>
                          {previewField === "scenario" ? "Hide Preview" : "Preview"}
                        </button>
                      </div>
                      <Textarea
                        value={currentQ.scenario}
                        onChange={(e) => updateQuestion(activeQ, { scenario: e.target.value })}
                        placeholder="Use **bold**, *italic*, $inline math$, $$block math$$..."
                        className="mt-1 min-h-[120px] font-mono text-xs"
                      />
                      {previewField === "scenario" && (
                        <div className="mt-2 rounded-lg border border-border p-4 bg-muted/30">
                          <RichContent content={currentQ.scenario} className="text-sm" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Required</Label>
                      <Textarea
                        value={currentQ.required}
                        onChange={(e) => updateQuestion(activeQ, { required: e.target.value })}
                        placeholder="What is the student required to do?"
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Tables */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Financial Tables ({currentQ.financial_tables.length})</h3>
                      <Button variant="outline" size="sm" onClick={() => addTable(activeQ)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Table
                      </Button>
                    </div>
                    {currentQ.financial_tables.map((table, tIdx) => (
                      <div key={tIdx} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={table.title}
                            onChange={(e) => updateTable(activeQ, tIdx, { ...table, title: e.target.value })}
                            placeholder="Table title"
                            className="max-w-xs"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeTable(activeQ, tIdx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Headers (comma-separated)</Label>
                          <Input
                            value={table.headers.join(", ")}
                            onChange={(e) => updateTable(activeQ, tIdx, { ...table, headers: e.target.value.split(",").map((h) => h.trim()) })}
                            placeholder="Item, 2023, 2022"
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rows (one row per line, columns separated by |)</Label>
                          <Textarea
                            value={table.rows.map((r) => r.join(" | ")).join("\n")}
                            onChange={(e) => {
                              const rows = e.target.value.split("\n").map((line) => line.split("|").map((c) => c.trim()));
                              updateTable(activeQ, tIdx, { ...table, rows });
                            }}
                            placeholder="PPE | 8,450 | 5,200"
                            className="mt-1 min-h-[80px] font-mono text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Images / Diagrams ({currentQ.images.length})</h3>
                      <Button variant="outline" size="sm" onClick={() => addImage(activeQ)}>
                        <ImagePlus className="h-3 w-3 mr-1" /> Add Image
                      </Button>
                    </div>
                    {currentQ.images.map((img, iIdx) => (
                      <div key={iIdx} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(activeQ, iIdx, file);
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <span><ImagePlus className="h-3 w-3 mr-1" /> Upload</span>
                            </Button>
                          </label>
                          <Input
                            value={img.src}
                            onChange={(e) => {
                              const newImgs = currentQ.images.map((im, i) => (i === iIdx ? { ...im, src: e.target.value } : im));
                              updateQuestion(activeQ, { images: newImgs });
                            }}
                            placeholder="Or paste image URL"
                            className="text-sm flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuestion(activeQ, { images: currentQ.images.filter((_, i) => i !== iIdx) })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Alt text</Label>
                            <Input
                              value={img.alt}
                              onChange={(e) => {
                                const newImgs = currentQ.images.map((im, i) => (i === iIdx ? { ...im, alt: e.target.value } : im));
                                updateQuestion(activeQ, { images: newImgs });
                              }}
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Caption</Label>
                            <Input
                              value={img.caption || ""}
                              onChange={(e) => {
                                const newImgs = currentQ.images.map((im, i) => (i === iIdx ? { ...im, caption: e.target.value } : im));
                                updateQuestion(activeQ, { images: newImgs });
                              }}
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>
                        {img.src && (
                          <img src={img.src} alt={img.alt} className="max-h-32 rounded-lg border border-border object-contain" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Sub-Questions */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Sub-Questions ({currentQ.sub_questions.length})</h3>
                      <Button variant="outline" size="sm" onClick={() => addSubQuestion(activeQ)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Sub-Question
                      </Button>
                    </div>
                    {currentQ.sub_questions.map((sub, sIdx) => (
                      <div key={sIdx} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">({sub.label})</span>
                            <Input
                              value={sub.marks}
                              type="number"
                              onChange={(e) => updateSub(activeQ, sIdx, { marks: parseInt(e.target.value) || 0 })}
                              className="w-20 text-sm"
                              placeholder="Marks"
                            />
                            <span className="text-xs text-muted-foreground">marks</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeSub(activeQ, sIdx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Question Text (Markdown + KaTeX)</Label>
                          <Textarea
                            value={sub.text}
                            onChange={(e) => updateSub(activeQ, sIdx, { text: e.target.value })}
                            placeholder="Identify and explain FIVE audit risks..."
                            className="mt-1 min-h-[60px] text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Model Answer (Markdown + KaTeX)</Label>
                          <Textarea
                            value={sub.model_answer}
                            onChange={(e) => updateSub(activeQ, sIdx, { model_answer: e.target.value })}
                            placeholder="1. Revenue recognition risk due to..."
                            className="mt-1 min-h-[80px] font-mono text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Hints (one per line)</Label>
                          <Textarea
                            value={sub.hints.join("\n")}
                            onChange={(e) => updateSub(activeQ, sIdx, { hints: e.target.value.split("\n").filter(Boolean) })}
                            placeholder="Use financial data to quantify risks."
                            className="mt-1 min-h-[50px] text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Key Points (one per line)</Label>
                          <Textarea
                            value={sub.key_points.join("\n")}
                            onChange={(e) => updateSub(activeQ, sIdx, { key_points: e.target.value.split("\n").filter(Boolean) })}
                            placeholder="Revenue recognition&#10;PPE valuation"
                            className="mt-1 min-h-[50px] text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground mb-4">No questions yet.</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-1" /> Add First Question
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamEditor;
