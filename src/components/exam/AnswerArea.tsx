import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Save, Type, FunctionSquare } from "lucide-react";
import RichContent from "@/components/exam/RichContent";

interface AnswerAreaProps {
  subQuestionId: string;
  answer: string;
  isBookmarked: boolean;
  onUpdateAnswer: (id: string, answer: string) => void;
  onToggleBookmark: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

const LATEX_CATEGORIES = [
  {
    name: "Basic Math",
    shortcuts: [
      { label: "Fraction", insert: "$$\\frac{a}{b}$$" },
      { label: "Exponent", insert: "$$x^{n}$$" },
      { label: "Subscript", insert: "$$x_{i}$$" },
      { label: "√", insert: "$$\\sqrt{x}$$" },
      { label: "×", insert: "$$\\times$$" },
      { label: "÷", insert: "$$\\div$$" },
      { label: "±", insert: "$$\\pm$$" },
      { label: "≠", insert: "$$\\neq$$" },
      { label: "≤", insert: "$$\\leq$$" },
      { label: "≥", insert: "$$\\geq$$" },
      { label: "≈", insert: "$$\\approx$$" },
      { label: "%", insert: "$$\\%$$" },
    ],
  },
  {
    name: "Finance",
    shortcuts: [
      { label: "NPV", insert: "$$NPV = \\sum_{t=0}^{n} \\frac{CF_t}{(1+r)^t}$$" },
      { label: "PV", insert: "$$PV = \\frac{FV}{(1+r)^n}$$" },
      { label: "FV", insert: "$$FV = PV(1+r)^n$$" },
      { label: "WACC", insert: "$$WACC = \\frac{E}{V} \\times r_e + \\frac{D}{V} \\times r_d \\times (1-T)$$" },
      { label: "IRR", insert: "$$IRR: \\sum_{t=0}^{n} \\frac{CF_t}{(1+IRR)^t} = 0$$" },
      { label: "Depreciation", insert: "$$D = \\frac{Cost - Salvage}{Useful\\ Life}$$" },
      { label: "EPS", insert: "$$EPS = \\frac{Net\\ Income}{Shares}$$" },
      { label: "ROE", insert: "$$ROE = \\frac{Net\\ Income}{Equity}$$" },
      { label: "Annuity", insert: "$$PV = PMT \\times \\frac{1-(1+r)^{-n}}{r}$$" },
    ],
  },
  {
    name: "Statistics",
    shortcuts: [
      { label: "Mean x̄", insert: "$$\\bar{x} = \\frac{\\sum x_i}{n}$$" },
      { label: "Std Dev σ", insert: "$$\\sigma = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n}}$$" },
      { label: "Variance", insert: "$$\\sigma^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n}$$" },
      { label: "Σ Sum", insert: "$$\\sum_{i=1}^{n}$$" },
      { label: "CV", insert: "$$CV = \\frac{\\sigma}{\\bar{x}} \\times 100\\%$$" },
      { label: "EMV", insert: "$$EMV = \\sum P_i \\times V_i$$" },
      { label: "Correlation", insert: "$$r = \\frac{n\\sum xy - \\sum x \\sum y}{\\sqrt{[n\\sum x^2 - (\\sum x)^2][n\\sum y^2 - (\\sum y)^2]}}$$" },
      { label: "P(A|B)", insert: "$$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$" },
    ],
  },
  {
    name: "Tax & Tables",
    shortcuts: [
      { label: "Tax", insert: "$$Tax = Taxable\\ Income \\times Rate$$" },
      { label: "Cap. Allow.", insert: "$$CA = Cost \\times Rate$$" },
      { label: "∞", insert: "$$\\infty$$" },
      { label: "₦", insert: "₦" },
      { label: "Table", insert: "\n| Item | Amount (₦) |\n|------|------------|\n|  |  |\n| **Total** |  |\n" },
    ],
  },
];

const latexToPlainText = (text: string): string => {
  return text
    .replace(/\$\$(.*?)\$\$/g, (_, expr) => {
      let result = expr
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
        .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
        .replace(/\\bar\{([^}]*)\}/g, '$1̄')
        .replace(/\\hat\{([^}]*)\}/g, '$1̂')
        .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, 'Σ(from $1 to $2)')
        .replace(/\\sum/g, 'Σ')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\neq/g, '≠')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\approx/g, '≈')
        .replace(/\\infty/g, '∞')
        .replace(/\\%/g, '%')
        .replace(/\^\{([^}]*)\}/g, '^($1)')
        .replace(/\_\{([^}]*)\}/g, '_($1)')
        .replace(/\^(\w)/g, '^$1')
        .replace(/_(\w)/g, '_$1')
        .replace(/\\cap/g, '∩')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\\\/g, '')
        .replace(/\\,/g, ' ')
        .replace(/\\ /g, ' ')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '');
      return result;
    });
};

const AnswerArea = ({
  subQuestionId,
  answer,
  isBookmarked,
  onUpdateAnswer,
  onToggleBookmark,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: AnswerAreaProps) => {
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [mode, setMode] = useState<"plain" | "latex">("plain");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleModeSwitch = (newMode: "plain" | "latex") => {
    if (mode === "latex" && newMode === "plain") {
      setLocalAnswer((prev) => latexToPlainText(prev));
    }
    setMode(newMode);
  };

  useEffect(() => {
    setLocalAnswer(answer);
  }, [subQuestionId, answer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localAnswer !== answer) {
        onUpdateAnswer(subQuestionId, localAnswer);
        setLastSaved(new Date());
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [localAnswer, subQuestionId]);

  const insertLatex = (snippet: string) => {
    setLocalAnswer((prev) => prev + " " + snippet + " ");
  };

  const wordCount = localAnswer.trim() ? localAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              onClick={() => handleModeSwitch("plain")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === "plain"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Plain text mode"
            >
              <Type className="h-3 w-3" />
              Text
            </button>
            <button
              onClick={() => handleModeSwitch("latex")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === "latex"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="LaTeX mode with formula support"
            >
              <FunctionSquare className="h-3 w-3" />
              LaTeX
            </button>
          </div>

          {lastSaved && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Save className="h-3 w-3" />
              Saved
            </span>
          )}
          <button
            onClick={() => onToggleBookmark(subQuestionId)}
            className={`rounded-lg p-2 transition-colors ${
              isBookmarked
                ? "bg-secondary/15 text-secondary"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* LaTeX shortcuts toolbar */}
      {mode === "latex" && (
        <div className="rounded-lg border border-border bg-muted/30 p-2 space-y-2">
          <div className="flex flex-wrap gap-1">
            {LATEX_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  expandedCategory === cat.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {expandedCategory && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
              {LATEX_CATEGORIES.find((c) => c.name === expandedCategory)?.shortcuts.map((s) => (
                <button
                  key={s.label}
                  onClick={() => insertLatex(s.insert)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  title={`Insert ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Textarea
        value={localAnswer}
        onChange={(e) => setLocalAnswer(e.target.value)}
        placeholder={
          mode === "latex"
            ? "Type your answer... Use $$formula$$ for math, e.g. $$\\frac{a}{b}$$ or click buttons above"
            : "Type your answer here..."
        }
        className="min-h-[200px] resize-y border-border bg-card text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-sm"
      />

      {/* Live preview in LaTeX mode */}
      {mode === "latex" && localAnswer.trim() && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Live Preview</p>
          <RichContent content={localAnswer} className="text-sm" />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{localAnswer.length} characters</span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          onClick={() => {
            onUpdateAnswer(subQuestionId, localAnswer);
            setLastSaved(new Date());
          }}
          className="gradient-primary gradient-btn-hover rounded-lg px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Save Draft
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AnswerArea;
