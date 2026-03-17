import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { Exam } from "@/data/examData";
import { cn } from "@/lib/utils";

interface QuestionSidebarProps {
  exam: Exam;
  currentSubQuestionId: string;
  answers: Record<string, string>;
  bookmarked: Set<string>;
  onNavigate: (questionId: number, subQuestionId: string) => void;
}

const QuestionSidebar = ({
  exam,
  currentSubQuestionId,
  answers,
  bookmarked,
  onNavigate,
}: QuestionSidebarProps) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    Object.fromEntries(exam.questions.map((q) => [q.id, true]))
  );

  const toggleExpand = (qId: number) =>
    setExpanded((prev) => ({ ...prev, [qId]: !prev[qId] }));

  const getStatus = (subId: string) => {
    if (subId === currentSubQuestionId) return "current";
    if (answers[subId]?.trim()) return "answered";
    if (bookmarked.has(subId)) return "bookmarked";
    return "unanswered";
  };

  const statusDot = (status: string) => {
    switch (status) {
      case "current":
        return "bg-primary ring-2 ring-primary/30";
      case "answered":
        return "bg-success";
      case "bookmarked":
        return "bg-secondary";
      default:
        return "bg-muted-foreground/30";
    }
  };

  const renderQuestion = (q: typeof exam.questions[0]) => (
    <div key={q.id}>
      <button
        onClick={() => toggleExpand(q.id)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {expanded[q.id] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span>Q{q.id}</span>
        <span className="ml-auto text-xs text-muted-foreground">{q.totalMarks}m</span>
      </button>
      {expanded[q.id] && (
        <div className="ml-4 space-y-0.5 pb-1">
          {q.subQuestions.map((sub) => {
            const status = getStatus(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => onNavigate(q.id, sub.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all",
                  status === "current"
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-foreground hover:bg-muted",
                  status === "bookmarked" && "bg-secondary/10"
                )}
              >
                <span
                  className={cn("h-2 w-2 rounded-full flex-shrink-0", statusDot(status))}
                />
                <span>({sub.label})</span>
                <span className="ml-auto text-xs opacity-70">{sub.marks}m</span>
                {bookmarked.has(sub.id) && (
                  <Star className="h-3 w-3 fill-current text-secondary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const hasSections = exam.sections && exam.sections.length > 0;

  return (
    <aside className="h-full overflow-y-auto border-r border-border bg-card p-3">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Questions
      </h3>
      <div className="space-y-1">
        {hasSections ? (
          exam.sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section) => {
              const sectionQuestions = exam.questions.filter(
                (q) => q.sectionId === section.id
              );
              if (sectionQuestions.length === 0) return null;
              return (
                <div key={section.id} className="mb-3">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {section.label}
                    </span>
                    {!section.isCompulsory && (
                      <span className="text-[10px] text-muted-foreground">
                        (Choose {section.requiredQuestions})
                      </span>
                    )}
                  </div>
                  {sectionQuestions.map(renderQuestion)}
                </div>
              );
            })
        ) : (
          exam.questions.map(renderQuestion)
        )}
      </div>
    </aside>
  );
};

export default QuestionSidebar;
