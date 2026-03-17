import { useState, useCallback, useEffect, useRef } from "react";
import { Exam, SubQuestion } from "@/data/examData";

export interface ExamState {
  currentQuestionId: number;
  currentSubQuestionId: string;
  answers: Record<string, string>;
  bookmarked: Set<string>;
  timeRemaining: number; // seconds
  isStarted: boolean;
  isSubmitted: boolean;
}

export function useExamState(exam: Exam) {
  const [state, setState] = useState<ExamState>({
    currentQuestionId: exam.questions[0]?.id ?? 1,
    currentSubQuestionId: exam.questions[0]?.subQuestions[0]?.id ?? "1a",
    answers: {},
    bookmarked: new Set(),
    timeRemaining: exam.duration * 60,
    isStarted: false,
    isSubmitted: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isStarted && !state.isSubmitted && state.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isStarted, state.isSubmitted, state.timeRemaining]);

  const startExam = useCallback(() => {
    setState((prev) => ({ ...prev, isStarted: true }));
  }, []);

  const navigateTo = useCallback((questionId: number, subQuestionId: string) => {
    setState((prev) => ({
      ...prev,
      currentQuestionId: questionId,
      currentSubQuestionId: subQuestionId,
    }));
  }, []);

  const updateAnswer = useCallback((subQuestionId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [subQuestionId]: answer },
    }));
  }, []);

  const toggleBookmark = useCallback((subQuestionId: string) => {
    setState((prev) => {
      const newBookmarked = new Set(prev.bookmarked);
      if (newBookmarked.has(subQuestionId)) {
        newBookmarked.delete(subQuestionId);
      } else {
        newBookmarked.add(subQuestionId);
      }
      return { ...prev, bookmarked: newBookmarked };
    });
  }, []);

  const submitExam = useCallback(() => {
    setState((prev) => ({ ...prev, isSubmitted: true }));
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Navigation helpers
  const allSubQuestions: { questionId: number; sub: SubQuestion }[] = [];
  exam.questions.forEach((q) =>
    q.subQuestions.forEach((sub) => allSubQuestions.push({ questionId: q.id, sub }))
  );

  const currentIndex = allSubQuestions.findIndex(
    (item) => item.sub.id === state.currentSubQuestionId
  );

  const goNext = useCallback(() => {
    if (currentIndex < allSubQuestions.length - 1) {
      const next = allSubQuestions[currentIndex + 1];
      navigateTo(next.questionId, next.sub.id);
    }
  }, [currentIndex, allSubQuestions, navigateTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = allSubQuestions[currentIndex - 1];
      navigateTo(prev.questionId, prev.sub.id);
    }
  }, [currentIndex, allSubQuestions, navigateTo]);

  const answeredCount = Object.keys(state.answers).filter(
    (k) => state.answers[k].trim().length > 0
  ).length;
  const totalSubQuestions = allSubQuestions.length;

  return {
    state,
    startExam,
    navigateTo,
    updateAnswer,
    toggleBookmark,
    submitExam,
    goNext,
    goPrev,
    canGoNext: currentIndex < allSubQuestions.length - 1,
    canGoPrev: currentIndex > 0,
    answeredCount,
    totalSubQuestions,
    allSubQuestions,
  };
}
