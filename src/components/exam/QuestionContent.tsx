import { ExamQuestion, FinancialTable } from "@/data/examData";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import RichContent from "./RichContent";

interface QuestionContentProps {
  question: ExamQuestion;
  currentSubQuestionId: string;
  examSubject: string;
}

const FinancialTableView = ({ table }: { table: FinancialTable }) => (
  <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
    <div className="bg-primary px-5 py-3">
      <h3 className="text-sm font-semibold text-primary-foreground">
        {table.title}
      </h3>
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {table.headers.map((h, i) => (
            <th
              key={i}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                i > 0 ? "text-right" : "text-left"
              }`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, ri) => (
          <tr
            key={ri}
            className={`border-b border-border/50 ${
              ri % 2 === 0 ? "bg-muted/30" : ""
            }`}
          >
            {row.map((cell, ci) => (
              <td
                key={ci}
                className={`px-4 py-2.5 ${
                  ci > 0 ? "text-right font-mono" : "text-left font-medium"
                } text-foreground`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const QuestionContent = ({ question, currentSubQuestionId, examSubject }: QuestionContentProps) => {
  const currentSub = question.subQuestions.find((s) => s.id === currentSubQuestionId);

  // Combine single financialTable and financialTables array
  const allTables: FinancialTable[] = [
    ...(question.financialTable ? [question.financialTable] : []),
    ...(question.financialTables || []),
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-primary font-medium">{examSubject}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground font-medium">Q{question.id}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary font-semibold">
              ({currentSub?.label})
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground">{question.title}</h2>

      {/* Scenario */}
      <div className="rounded-xl border-l-4 border-primary bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Scenario
        </h3>
        <RichContent content={question.scenario} className="text-sm text-foreground/90" />
      </div>

      {/* Financial Tables */}
      {allTables.map((table, i) => (
        <FinancialTableView key={i} table={table} />
      ))}

      {/* Images / Diagrams */}
      {question.images && question.images.length > 0 && (
        <div className="space-y-4">
          {question.images.map((img, i) => (
            <figure key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full rounded-lg object-contain max-h-96"
                loading="lazy"
              />
              {img.caption && (
                <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* Required */}
      <div className="rounded-xl bg-secondary/15 border border-secondary/30 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Required</h3>
        <RichContent content={question.required} className="mt-1 text-sm text-foreground" />
      </div>

      {/* Current Sub-Question */}
      {currentSub && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              ({currentSub.label})
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {currentSub.marks} marks
            </span>
          </div>
          <RichContent content={currentSub.text} className="mt-3 text-sm text-foreground" />
        </div>
      )}
    </div>
  );
};

export default QuestionContent;
