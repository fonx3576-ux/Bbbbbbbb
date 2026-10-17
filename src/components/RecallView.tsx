import React, { useState } from "react";
import {
  Brain,
  RotateCw,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  X,
  Award,
} from "lucide-react";
import { StudyGuide, RecallItem } from "../types";

interface RecallViewProps {
  guide: StudyGuide;
  onProceedToExam: () => void;
  onBackToInfo: () => void;
  selectedLang: "th" | "en" | "zh";
}

export const RecallView: React.FC<RecallViewProps> = ({
  guide,
  onProceedToExam,
  onBackToInfo,
  selectedLang,
}) => {
  // Generate recall items from guide keyItems, pitfalls, and summary if not pre-populated
  const recallItems: RecallItem[] = guide.recallItems && guide.recallItems.length > 0
    ? guide.recallItems
    : [
        ...guide.keyItems.map((item, idx) => {
          let prompt = `คำศัพท์/กฎ: "${item.term}" มีความหมายและการใช้งานอย่างไร?`;
          let answer = `${item.meaning}\n\nตัวอย่าง: ${item.example}${item.proTip ? `\nPro-Tip: ${item.proTip}` : ""}`;
          let hint = item.phoneticOrReading ? `การออกเสียง: [${item.phoneticOrReading}]` : undefined;

          if (selectedLang === "zh") {
            prompt = `【核心知识/拼音】: "${item.term}" 的准确含义与读音用法是什么？`;
            answer = `${item.meaning}\n\n例句: ${item.example}${item.proTip ? `\n考点提示: ${item.proTip}` : ""}`;
            hint = item.phoneticOrReading ? `拼音/读音: [${item.phoneticOrReading}]` : undefined;
          } else if (selectedLang === "en") {
            prompt = `Concept / Rule: What is the meaning and correct usage of "${item.term}"?`;
            answer = `${item.meaning}\n\nExample: ${item.example}${item.proTip ? `\nPro-Tip: ${item.proTip}` : ""}`;
            hint = item.phoneticOrReading ? `Phonetics: [${item.phoneticOrReading}]` : undefined;
          }

          return {
            id: idx + 1,
            prompt,
            answer,
            hint,
            category: "vocab" as const,
          };
        }),
        ...guide.commonPitfalls.map((pitfall, idx) => {
          let prompt = `จุดที่มักผิด: "${pitfall.mistake}" แก้ไขให้ถูกต้องอย่างไร และทำไม?`;
          let answer = `แก้ไขเป็น: "${pitfall.correction}"\n\nเหตุผล: ${pitfall.explanation}`;
          let hint = "นึกถึงข้อควรระวังในห้องสอบ";

          if (selectedLang === "zh") {
            prompt = `【易错陷阱】: "${pitfall.mistake}" 应该如何订正？原因是什么？`;
            answer = `正确形式: "${pitfall.correction}"\n\n解析: ${pitfall.explanation}`;
            hint = "考试常见易错点";
          } else if (selectedLang === "en") {
            prompt = `Common Trap: How do you correct "${pitfall.mistake}" and why?`;
            answer = `Correction: "${pitfall.correction}"\n\nReason: ${pitfall.explanation}`;
            hint = "Pay attention to test trap";
          }

          return {
            id: guide.keyItems.length + idx + 1,
            prompt,
            answer,
            hint,
            category: "trap" as const,
          };
        }),
      ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());

  const currentItem = recallItems[currentIndex] || recallItems[0];
  const total = recallItems.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < total ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const markMastered = (id: number) => {
    setMasteredIds((prev) => new Set(prev).add(id));
    setReviewIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    handleNext();
  };

  const markReview = (id: number) => {
    setReviewIds((prev) => new Set(prev).add(id));
    setMasteredIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    handleNext();
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const masteredCount = masteredIds.size;
  const progressPercent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Step Indicator Header (Step 2 of 3) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            <Brain className="w-4 h-4" />
            <span>ส่วนที่ 2: ทวนเนื้อหา (Recall Part) · Active Recall Drill</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {guide.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Flashcard {currentIndex + 1} of {total} · {masteredCount} Mastered ({progressPercent}%)
          </p>
        </div>

        <button
          onClick={onBackToInfo}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-center"
        >
          <BookOpen className="w-4 h-4" />
          <span>Back to Information Part</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600">Recall Mastery Progress</span>
          <span className="font-mono text-red-600 font-bold">{masteredCount} / {total} Cards Mastered</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-red-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Active Recall Flashcard */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-10 shadow-sm text-center relative min-h-[320px] flex flex-col justify-between">
        {/* Card Counter & Category */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>CARD {currentIndex + 1} / {total}</span>
          <span className="uppercase font-bold tracking-wider text-slate-600">
            {isFlipped ? "💡 เฉลย & คำอธิบาย (Answer)" : "❓ คำถามทวนความจำ (Prompt)"}
          </span>
        </div>

        {/* Card Core Content */}
        <div className="my-8 px-4">
          {!isFlipped ? (
            <div className="space-y-4">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentItem.prompt}
              </div>
              {currentItem.hint && (
                <div className="text-xs text-amber-700 bg-amber-50 inline-block px-3 py-1.5 rounded-lg border border-amber-200/60 font-medium">
                  {currentItem.hint}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-lg sm:text-xl font-bold text-red-600 leading-relaxed whitespace-pre-line text-left max-w-xl mx-auto bg-red-50/50 p-5 rounded-xl border border-red-100">
                {currentItem.answer}
              </div>
            </div>
          )}
        </div>

        {/* Flip & Audio Buttons */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? "Show Question Again" : "Flip to Reveal Answer (คลิกเพื่อดูเฉลย)"}</span>
          </button>

          {/* Self Assessment (when flipped) */}
          {isFlipped && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => markReview(currentItem.id)}
                className="px-4 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 text-amber-600" />
                <span>Need Review (ยังจำไม่ได้)</span>
              </button>
              <button
                onClick={() => markMastered(currentItem.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Got It! (จำได้แม่นแล้ว)</span>
              </button>
            </div>
          )}
        </div>

        {/* Card Navigation Arrows */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Card</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= total - 1}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <span>Next Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transition to Exam Part (Step 3) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold mb-1">
            Step 3 of 3 · Final Phase
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            พร้อมทำข้อสอบจำลองหรือยัง? (Proceed to Exam Part)
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            เมื่อทวนเนื้อหาจนมั่นใจแล้ว กดเริ่มทำข้อสอบจำลอง 5 ข้อเพื่อวัดคะแนนและรับคำแนะนำแก้ไขจุดที่ผิดพลาดทันที
          </p>
        </div>

        <button
          onClick={onProceedToExam}
          className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-red-500/25 active:scale-95 shrink-0"
        >
          <span>ไปส่วนทำข้อสอบ (Exam Part)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
