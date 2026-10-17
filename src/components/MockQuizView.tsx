import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { QuizQuestion, RemedialReview } from "../types";

interface MockQuizViewProps {
  topic: string;
  questions: QuizQuestion[];
  selectedLang?: "th" | "en" | "zh";
  onBackToGuide: () => void;
  onBackToRecall: () => void;
  onRequestRemedialAdvice: (incorrectQuestions: any[]) => Promise<RemedialReview | null>;
}

export const MockQuizView: React.FC<MockQuizViewProps> = ({
  topic,
  questions,
  selectedLang = "th",
  onBackToGuide,
  onBackToRecall,
  onRequestRemedialAdvice,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [remedialData, setRemedialData] = useState<RemedialReview | null>(null);
  const [isLoadingRemedial, setIsLoadingRemedial] = useState<boolean>(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);
    const score = calculateScore();

    // Collect incorrect questions for remediation
    const incorrect = questions
      .filter((q) => selectedAnswers[q.id] !== q.correctIndex)
      .map((q) => ({
        question: q.question,
        chosen: selectedAnswers[q.id] !== undefined ? q.options[selectedAnswers[q.id]] : "No answer",
        correct: q.options[q.correctIndex],
        explanation: q.explanation,
      }));

    if (incorrect.length > 0) {
      setIsLoadingRemedial(true);
      try {
        const review = await onRequestRemedialAdvice(incorrect);
        if (review) {
          setRemedialData(review);
        }
      } catch (err) {
        console.error("Remedial review error:", err);
      } finally {
        setIsLoadingRemedial(false);
      }
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setRemedialData(null);
  };

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* 3-Part Learning Pipeline Stepper */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl text-center text-xs font-bold">
        <button
          onClick={onBackToGuide}
          className="py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          {selectedLang === "zh" ? "1. 精要信息 (Info)" : selectedLang === "en" ? "1. Information Part" : "1. Information Part (ส่วนข้อมูล)"}
        </button>
        <button
          onClick={onBackToRecall}
          className="py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          {selectedLang === "zh" ? "2. 主动复习 (Recall)" : selectedLang === "en" ? "2. Recall Part" : "2. Recall Part (ส่วนทวน)"}
        </button>
        <div className="py-2 px-3 rounded-lg bg-red-600 text-white shadow-xs">
          {selectedLang === "zh" ? "3. 模拟考场 (Exam)" : selectedLang === "en" ? "3. Exam Part" : "3. Exam Part (ส่วนข้อสอบ)"}
        </div>
      </div>

      {/* Top Header & Wireframe Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Wireframe subtitle from Image 3: นี่คือหน้าข้อสอบจำลองนั้นเอง */}
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            {selectedLang === "zh"
              ? "模拟考场 · 第三步：全真模考检测 (Exam Part)"
              : selectedLang === "en"
              ? "Mock Exam View · Part 3: Timed Challenge (Exam Part)"
              : "นี่คือหน้าข้อสอบจำลองนั้นเอง · ส่วนที่ 3: ทำข้อสอบจำลอง (Exam Part)"}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Mock Exam: {topic}
          </h2>
          <div className="text-xs text-slate-500 mt-1">
            Question {currentIndex + 1} of {totalQuestions} · {answeredCount} answered
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRecall}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Recall
          </button>
          <button
            onClick={onBackToGuide}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            Info Part
          </button>
        </div>
      </div>

      {!isSubmitted ? (
        /* Active Quiz Taking Interface */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question Navigator */}
          <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-slate-100">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono tabular-nums ${
                    isCurrent
                      ? "bg-slate-900 text-white ring-2 ring-red-400"
                      : isAnswered
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Text (Matching Image 3: 1. Question...?) */}
          <div className="space-y-4">
            <div className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentIndex + 1}. {currentQuestion.question}
            </div>

            {currentQuestion.conceptTested && (
              <div className="text-xs text-slate-500">
                Focus concept: <span className="font-semibold text-slate-700">{currentQuestion.conceptTested}</span>
              </div>
            )}

            {/* 4 Options (Directly matching Image 3 wireframe: 1) 2) 3) 4)) */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "border-red-600 bg-red-50/50 text-slate-900 font-semibold shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {optIdx + 1})
                    </span>
                    <span className="text-sm pt-0.5 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Mock Exam ({answeredCount}/{totalQuestions})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results & Remedial View (Fixing Mistakes as requested in Image 2 & 3) */
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
              Your Score: <span className="font-mono tabular-nums text-red-600">{score} / {totalQuestions}</span>
            </h3>
            <p className="text-sm text-slate-600 mb-6 font-medium">
              Accuracy: <span className="font-mono font-bold">{percentage}%</span> · Completed within 1-Hour Drill
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRetakeQuiz}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onBackToGuide}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Re-read 1-Hour Notes</span>
              </button>
            </div>
          </div>

          {/* Section: "แก้ไขจุดที่ผิดพลาด" (Review & Fix Mistakes) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>
                  {selectedLang === "zh"
                    ? "错题诊断与核心考点解析 (Review & Fix Mistakes)"
                    : selectedLang === "en"
                    ? "Targeted Mistakes Analysis & Golden Rules (Fix Mistakes)"
                    : "ขั้นตอนถามคำถามเพื่อทวนเนื้อหา และแก้ไขจุดที่ผิดพลาด"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Detailed Question Breakdown & Remedial Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Understand the reasoning behind every question to lock the concepts into long-term memory.
              </p>
            </div>

            {/* AI Custom Remedial Guidance */}
            {isLoadingRemedial && (
              <div className="p-5 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-3 text-red-800 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-red-600 shrink-0" />
                <span>FR AI Helper is analyzing your mistake patterns to generate golden rules...</span>
              </div>
            )}

            {remedialData && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>AI Mistake Pattern Diagnosis</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 font-medium">
                  {remedialData.mistakePatternSummary}
                </p>

                <div className="pt-2 border-t border-amber-200/60">
                  <div className="text-xs font-bold text-amber-900 mb-2">
                    Golden Rules to Prevent These Mistakes:
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {remedialData.goldenRulesToFix.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-red-600">✓</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Question by question review */}
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-red-200 bg-red-50/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="text-sm font-bold text-slate-900">
                        {idx + 1}. {q.question}
                      </div>
                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        const isAnswer = optIdx === q.correctIndex;
                        let optStyle = "bg-white border-slate-200 text-slate-700";
                        if (isAnswer) {
                          optStyle = "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold";
                        } else if (isSelected && !isCorrect) {
                          optStyle = "bg-red-100 border-red-300 text-red-900 line-through";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${optStyle}`}
                          >
                            <span className="font-mono font-bold">{optIdx + 1})</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3 p-3 bg-white/80 rounded-lg border border-slate-100 text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Explanation: </span>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
