import { Calculator as CalcIcon, Send } from "lucide-react";
import ExamTimer from "./ExamTimer";

interface ExamNavBarProps {
  subject: string;
  timeRemaining: number;
  totalTime: number;
  onOpenCalculator: () => void;
  onSubmit: () => void;
}

const ExamNavBar = ({ subject, timeRemaining, totalTime, onOpenCalculator, onSubmit }: ExamNavBarProps) => {
  return (
    <nav className="gradient-primary sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-lg md:px-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-primary-foreground">ICAN CBT</span>
        <span className="hidden text-sm text-primary-foreground/50 md:inline">|</span>
        <span className="hidden text-sm font-medium text-primary-foreground/80 md:inline">{subject}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <ExamTimer timeRemaining={timeRemaining} totalTime={totalTime} />
        <button
          onClick={onOpenCalculator}
          className="rounded-lg p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          title="Calculator"
        >
          <CalcIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onSubmit}
          className="gradient-green gradient-btn-hover rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <span className="hidden md:inline">Submit Exam</span>
          <Send className="h-4 w-4 md:hidden" />
        </button>
      </div>
    </nav>
  );
};

export default ExamNavBar;
