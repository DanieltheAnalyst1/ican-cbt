import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const sampleSchema = `{
  "title": "Advanced Audit and Assurance - Nov 2024",
  "subject": "Advanced Audit and Assurance",
  "duration_minutes": 210,
  "total_marks": 100,
  "instructions": "Attempt ALL questions. Show workings.",
  "published": false,
  "sections": [
    {
      "label": "Section A",
      "instructions": "Answer the compulsory question.",
      "total_questions": 1,
      "required_questions": 1,
      "is_compulsory": true
    },
    {
      "label": "Section B",
      "instructions": "Answer any 2 of 3 questions.",
      "total_questions": 3,
      "required_questions": 2,
      "is_compulsory": false
    }
  ],
  "questions": [
    {
      "question_number": 1,
      "title": "Question 1 — Engagement Planning",
      "scenario": "Markdown text with **bold** and $E=mc^2$ formulas...",
      "required": "You are the audit engagement partner.",
      "section": "Section A",
      "financial_tables": [
        {
          "title": "Statement of Financial Position",
          "headers": ["Item", "2023 (₦'000)", "2022 (₦'000)"],
          "rows": [["PPE", "8,450", "5,200"]]
        }
      ],
      "images": [
        { "src": "https://example.com/diagram.png", "alt": "Org chart", "caption": "Figure 1" }
      ],
      "sub_questions": [
        {
          "label": "a",
          "text": "Identify FIVE audit risks.",
          "marks": 10,
          "model_answer": "1. Revenue growth risk... supports **markdown** and $$NPV = ...$$",
          "hints": ["Use financial data to quantify risks"],
          "key_points": ["Revenue recognition", "PPE valuation"]
        }
      ]
    }
  ]
}`;

const JsonImportDialog = ({ open, onClose, onImported }: Props) => {
  const [json, setJson] = useState("");
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJson(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(json);
      setImporting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create exam
      const { data: exam, error: examError } = await supabase
        .from("exams")
        .insert({
          title: data.title,
          subject: data.subject,
          duration_minutes: data.duration_minutes || 180,
          total_marks: data.total_marks || 100,
          instructions: data.instructions || "",
          published: data.published ?? false,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (examError) throw examError;

      // Create sections if provided
      const sectionIdMap: Record<string, string> = {};
      if (data.sections && data.sections.length > 0) {
        for (let si = 0; si < data.sections.length; si++) {
          const s = data.sections[si];
          const { data: secData, error: secErr } = await supabase
            .from("exam_sections")
            .insert({
              exam_id: exam.id,
              label: s.label,
              instructions: s.instructions || "",
              total_questions: s.total_questions || 1,
              required_questions: s.required_questions || 1,
              is_compulsory: s.is_compulsory ?? false,
              sort_order: si,
            })
            .select("id")
            .single();
          if (secErr) throw secErr;
          sectionIdMap[s.label] = secData.id;
        }
      }

      // Create questions
      for (let qi = 0; qi < (data.questions || []).length; qi++) {
        const q = data.questions[qi];
        // Match section by label
        const sectionId = q.section ? sectionIdMap[q.section] : (Object.values(sectionIdMap)[0] || null);
        
        const { data: question, error: qError } = await supabase
          .from("questions")
          .insert({
            exam_id: exam.id,
            question_number: q.question_number || qi + 1,
            title: q.title,
            scenario: q.scenario || "",
            required: q.required || "",
            financial_tables: q.financial_tables || [],
            images: q.images || [],
            sort_order: qi,
            section_id: sectionId,
          })
          .select("id")
          .single();

        if (qError) throw qError;

        // Create sub-questions
        const subs = (q.sub_questions || q.subQuestions || []).map((s: any, si: number) => ({
          question_id: question.id,
          label: s.label,
          text: s.text,
          marks: s.marks || 5,
          model_answer: s.model_answer || s.modelAnswer || "",
          hints: s.hints || [],
          key_points: s.key_points || s.keyPoints || [],
          sort_order: si,
        }));

        if (subs.length > 0) {
          const { error: subError } = await supabase.from("sub_questions").insert(subs);
          if (subError) throw subError;
        }
      }

      toast.success(`Imported "${data.title}" with ${data.questions?.length || 0} questions`);
      setJson("");
      onImported();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Invalid JSON format");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Exam from JSON</DialogTitle>
          <DialogDescription>
            Paste JSON or upload a .json file matching the schema below. Supports Markdown, KaTeX formulas, tables, and images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
              <Button variant="outline" asChild>
                <span><FileText className="h-4 w-4 mr-1" /> Upload .json</span>
              </Button>
            </label>
          </div>

          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Paste exam JSON here..."
            className="min-h-[200px] font-mono text-xs"
          />

          <details className="rounded-lg border border-border p-3">
            <summary className="text-sm font-medium text-muted-foreground cursor-pointer">View Schema Example</summary>
            <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">{sampleSchema}</pre>
          </details>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={!json.trim() || importing}>
              {importing ? "Importing..." : <><Upload className="h-4 w-4 mr-1" /> Import</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JsonImportDialog;
