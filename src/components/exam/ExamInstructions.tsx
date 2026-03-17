import { Exam } from "@/data/examData";
import { Clock, FileText, Award, CheckCircle2, Layers } from "lucide-react";

interface ExamInstructionsProps {
  exam: Exam;
  onStart: () => void;
}

const ExamInstructions = ({ exam, onStart }: ExamInstructionsProps) => {
  const hasSections = exam.sections && exam.sections.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl border border-border animate-fade-in">
        <div className="gradient-primary p-8 text-center">
          <span className="text-5xl">{exam.icon}</span>
          <h1 className="mt-3 text-2xl font-bold text-primary-foreground">{exam.subject}</h1>
          <p className="mt-1 text-primary-foreground/60">{exam.code} — {exam.date}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 px-6 -mt-5">
          {[
            { icon: Clock, label: "Duration", value: `${exam.duration} min` },
            { icon: FileText, label: "Questions", value: String(exam.questions.length) },
            { icon: Award, label: "Total Marks", value: String(exam.totalMarks) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-card border border-border p-3 text-center shadow-md">
              <div className="mx-auto mb-2 w-fit rounded-lg bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Section Structure */}
          {hasSections && (
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Exam Structure
              </h2>
              <div className="mt-2 space-y-2">
                {exam.sections
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => {
                    const sectionQuestions = exam.questions.filter(
                      (q) => q.sectionId === section.id
                    );
                    return (
                      <div
                        key={section.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5"
                      >
                        <div>
                          <span className="font-semibold text-foreground">{section.label}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({sectionQuestions.length} question{sectionQuestions.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {section.isCompulsory
                            ? "Compulsory"
                            : `Choose ${section.requiredQuestions} of ${section.totalQuestions}`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-foreground">Exam Instructions</h2>
          <ul className="space-y-2">
            {exam.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                {inst}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onStart}
            className="gradient-primary gradient-btn-hover w-full rounded-xl py-3.5 text-base font-bold text-primary-foreground"
          >
            I Understand — Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
