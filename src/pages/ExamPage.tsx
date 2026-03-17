import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Exam, ExamQuestion, ExamSection, SubQuestion, FinancialTable } from "@/data/examData";
import { useExamState } from "@/hooks/useExamState";
import { useUserCredits } from "@/hooks/useUserCredits";
import ExamNavBar from "@/components/exam/ExamNavBar";
import QuestionSidebar from "@/components/exam/QuestionSidebar";
import QuestionContent from "@/components/exam/QuestionContent";
import AnswerArea from "@/components/exam/AnswerArea";
import Calculator from "@/components/exam/Calculator";
import ExamInstructions from "@/components/exam/ExamInstructions";
import SubmitConfirmation from "@/components/exam/SubmitConfirmation";
import ResultsPage from "@/components/exam/ResultsPage";
import PaymentPrompt from "@/components/PaymentPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { List } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const ExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;

      const { data: examRow, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (error || !examRow) {
        navigate("/dashboard");
        return;
      }

      // Load sections
      const { data: sectionRows } = await supabase
        .from("exam_sections")
        .select("*")
        .eq("exam_id", examId)
        .order("sort_order");

      const sections: ExamSection[] = (sectionRows || []).map((s: any) => ({
        id: s.id,
        label: s.label,
        instructions: s.instructions || "",
        totalQuestions: s.total_questions,
        requiredQuestions: s.required_questions,
        isCompulsory: s.is_compulsory,
        sortOrder: s.sort_order,
      }));

      const { data: questionRows } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("sort_order");

      const questions: ExamQuestion[] = [];
      for (const q of questionRows || []) {
        const { data: subRows } = await supabase
          .from("sub_questions")
          .select("*")
          .eq("question_id", q.id)
          .order("sort_order");

        const subQuestions: SubQuestion[] = (subRows || []).map((s: any) => ({
          id: s.id,
          label: s.label,
          text: s.text,
          marks: s.marks,
          modelAnswer: s.model_answer || "",
          hints: (s.hints as string[]) || [],
          keyPoints: (s.key_points as string[]) || [],
        }));

        const financialTables = (q.financial_tables as unknown as FinancialTable[]) || [];

        questions.push({
          id: q.question_number,
          title: q.title,
          scenario: q.scenario,
          financialTables,
          images: (q.images as unknown as { src: string; alt: string; caption?: string }[]) || [],
          required: q.required,
          subQuestions,
          totalMarks: subQuestions.reduce((acc, s) => acc + s.marks, 0),
          sectionId: q.section_id || undefined,
        });
      }

      const instructions = examRow.instructions
        ? examRow.instructions.split("\n").filter(Boolean)
        : ["Attempt ALL questions.", "Show ALL workings."];

      setExam({
        id: examRow.id,
        subject: examRow.subject,
        code: examRow.subject.split(" ").map((w: string) => w[0]).join("").toUpperCase(),
        date: new Date(examRow.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        duration: examRow.duration_minutes,
        totalMarks: examRow.total_marks,
        gradient: "gradient-primary",
        icon: "📝",
        questions,
        sections,
        instructions,
      });
      setLoading(false);
    };

    loadExam();
  }, [examId, navigate]);

  if (loading || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (exam.questions.length === 0) {
    navigate("/dashboard");
    return null;
  }

  return <ExamContentWithCredits exam={exam} />;
};

const ExamContentWithCredits = ({ exam }: { exam: Exam }) => {
  const { hasAttempts, loading: creditsLoading, remainingAttempts, consumeAttempt, simulatePayment } = useUserCredits();
  const [payLoading, setPayLoading] = useState(false);

  if (creditsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasAttempts) {
    return (
      <PaymentPrompt
        attemptsExhausted={remainingAttempts <= 0}
        loading={payLoading}
        onPay={async () => {
          setPayLoading(true);
          await simulatePayment();
          setPayLoading(false);
        }}
      />
    );
  }

  return <ExamContent exam={exam} consumeAttempt={consumeAttempt} remainingAttempts={remainingAttempts} />;
};

const ExamContent = ({ exam, consumeAttempt, remainingAttempts }: { exam: Exam; consumeAttempt: () => Promise<boolean>; remainingAttempts: number }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    state,
    startExam,
    navigateTo,
    updateAnswer,
    toggleBookmark,
    submitExam,
    goNext,
    goPrev,
    canGoNext,
    canGoPrev,
    answeredCount,
    totalSubQuestions,
  } = useExamState(exam);

  const [showCalculator, setShowCalculator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Create attempt and consume credit when exam starts
  useEffect(() => {
    if (state.isStarted && !attemptId) {
      const createAttempt = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Consume one attempt credit
        await consumeAttempt();
        const { data } = await supabase
          .from("exam_attempts")
          .insert({ user_id: user.id, exam_id: exam.id, answers: {} })
          .select("id")
          .single();
        if (data) setAttemptId(data.id);
      };
      createAttempt();
    }
  }, [state.isStarted, attemptId, exam.id]);

  // Save attempt on submit (score will be updated by ResultsPage after AI grading)
  useEffect(() => {
    if (state.isSubmitted && attemptId) {
      supabase
        .from("exam_attempts")
        .update({
          answers: state.answers,
          submitted_at: new Date().toISOString(),
          time_spent_seconds: exam.duration * 60 - state.timeRemaining,
        })
        .eq("id", attemptId)
        .then(() => {});
    }
  }, [state.isSubmitted]);

  if (!state.isStarted) {
    return <ExamInstructions exam={exam} onStart={startExam} />;
  }

  if (state.isSubmitted) {
    return <ResultsPage exam={exam} answers={state.answers} attemptId={attemptId} />;
  }

  const currentQuestion = exam.questions.find((q) => q.id === state.currentQuestionId)!;

  return (
    <div className="flex h-screen flex-col bg-background">
      <ExamNavBar
        subject={exam.subject}
        timeRemaining={state.timeRemaining}
        totalTime={exam.duration * 60}
        onOpenCalculator={() => setShowCalculator(true)}
        onSubmit={() => setShowSubmitConfirm(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <div className="w-64 flex-shrink-0">
            <QuestionSidebar
              exam={exam}
              currentSubQuestionId={state.currentSubQuestionId}
              answers={state.answers}
              bookmarked={state.bookmarked}
              onNavigate={navigateTo}
            />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <QuestionContent
              question={currentQuestion}
              currentSubQuestionId={state.currentSubQuestionId}
              examSubject={exam.subject}
            />
            <AnswerArea
              subQuestionId={state.currentSubQuestionId}
              answer={state.answers[state.currentSubQuestionId] || ""}
              isBookmarked={state.bookmarked.has(state.currentSubQuestionId)}
              onUpdateAnswer={updateAnswer}
              onToggleBookmark={toggleBookmark}
              onPrev={goPrev}
              onNext={goNext}
              canPrev={canGoPrev}
              canNext={canGoNext}
            />
          </div>
        </main>
      </div>

      {isMobile && (
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="fixed bottom-5 left-5 z-40 gradient-primary rounded-full p-3.5 shadow-lg text-white gradient-btn-hover"
        >
          <List className="h-5 w-5" />
        </button>
      )}

      <Drawer open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Questions</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-2 pb-4">
            <QuestionSidebar
              exam={exam}
              currentSubQuestionId={state.currentSubQuestionId}
              answers={state.answers}
              bookmarked={state.bookmarked}
              onNavigate={(qId, sId) => {
                navigateTo(qId, sId);
                setShowMobileSidebar(false);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

      <SubmitConfirmation
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={() => {
          setShowSubmitConfirm(false);
          submitExam();
        }}
        answeredCount={answeredCount}
        totalCount={totalSubQuestions}
      />
    </div>
  );
};

export default ExamPage;
