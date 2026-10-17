import React, { useState } from "react";
import {
  Volume2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  Bookmark,
  Share2,
} from "lucide-react";
import { StudyGuide, OneHourPhase } from "../types";
import { OneHourTimer } from "./OneHourTimer";

interface StudyGuideViewProps {
  guide: StudyGuide;
  selectedLang?: "th" | "en" | "zh";
  onProceedToRecall: () => void;
  onProceedToExam: () => void;
  onSaveToSession: (guide: StudyGuide) => void;
  isSaved?: boolean;
}

export const StudyGuideView: React.FC<StudyGuideViewProps> = ({
  guide,
  selectedLang = "th",
  onProceedToRecall,
  onProceedToExam,
  onSaveToSession,
  isSaved = false,
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "vocab" | "traps">("summary");

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentPhase: OneHourPhase = guide.oneHourPhases[currentPhaseIndex] || guide.oneHourPhases[0];

  const labels = {
    th: {
      step1: "1. Information Part (ส่วนข้อมูล)",
      step2: "2. Recall Part (ส่วนทวน)",
      step3: "3. Exam Part (ส่วนข้อสอบ)",
      subHeader: "ส่วนที่ 1: หาข้อมูลและสรุปเนื้อหา (Information Part)",
      nextTitle: "ไปขั้นตอนทวนเนื้อหา (Proceed to Recall Part)",
      nextDesc: "เมื่ออ่านสรุปเนื้อหาจบแล้ว ขั้นตอนต่อไปคือการทวนความจำด้วย Flashcards และการฝึกดึงความรู้ ก่อนลงสนามสอบจำลองจริง",
      nextBtn: "ไปส่วนทวนเนื้อหา (Recall Part)",
      skipBtn: "ข้ามไปข้อสอบ (Skip to Exam)",
    },
    en: {
      step1: "1. Information Part (Key Study)",
      step2: "2. Recall Part (Active Recall)",
      step3: "3. Exam Part (Mock Test)",
      subHeader: "Part 1: Topic Research & Key Concepts (Information Part)",
      nextTitle: "Proceed to Active Recall Drill",
      nextDesc: "Solidify core concepts using interactive flashcards and retrieval practice before taking the timed exam.",
      nextBtn: "Start Recall Part",
      skipBtn: "Skip to Exam",
    },
    zh: {
      step1: "1. Information Part (精要信息)",
      step2: "2. Recall Part (主动复习)",
      step3: "3. Exam Part (模拟考场)",
      subHeader: "部分 1: 核心信息精要与知识梳理 (Information Part)",
      nextTitle: "进入第二步：知识复习 (Proceed to Recall Part)",
      nextDesc: "完成核心要点学习后，使用知识卡片进行主动回忆与查漏补缺，然后再进入全真模拟考场。",
      nextBtn: "进入复习环节 (Recall Part)",
      skipBtn: "跳过直接考试 (Skip to Exam)",
    },
  }[selectedLang];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* 3-Part Learning Pipeline Stepper */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl text-center text-xs font-bold">
        <div className="py-2 px-3 rounded-lg bg-red-600 text-white shadow-xs">
          {labels.step1}
        </div>
        <button
          onClick={onProceedToRecall}
          className="py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          {labels.step2}
        </button>
        <button
          onClick={onProceedToExam}
          className="py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
        >
          {labels.step3}
        </button>
      </div>

      {/* Top Banner & Title Metadata */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            {/* Zero-Pill metadata with clean typographic separators */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span className="text-red-600 uppercase tracking-wider">{guide.targetSubject}</span>
              <span aria-hidden="true">·</span>
              <span>{labels.subHeader}</span>
              <span aria-hidden="true">·</span>
              <span>{guide.estimatedReadTimeMinutes} min reading</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {guide.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSaveToSession(guide)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSaved
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? "Saved" : "Save Guide"}</span>
            </button>
          </div>
        </div>

        {/* 1-Hour Countdown Timer */}
        <div className="mt-4">
          <OneHourTimer
            phases={guide.oneHourPhases}
            currentPhaseIndex={currentPhaseIndex}
            onPhaseSelect={(idx) => setCurrentPhaseIndex(idx)}
            onProceedToQuiz={onProceedToRecall}
          />
        </div>
      </div>

      {/* Navigation Tabs for Guide Sections */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "summary"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          01. Concise Summary & Memory Hook
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "timeline"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          02. 1-Hour Phase Breakdown
        </button>
        <button
          onClick={() => setActiveTab("vocab")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "vocab"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          03. Key Rules & Vocabulary ({guide.keyItems.length})
        </button>
        <button
          onClick={() => setActiveTab("traps")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "traps"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          04. Common Pitfalls & Traps ({guide.commonPitfalls.length})
        </button>
      </div>

      {/* Tab 1: Concise Summary & Concept Condensation (Wireframe Image 2 representation) */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Wireframe Image 2 Concept Box: Long text condensed into digestible clarity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>สรุปเนื้อหาให้สั้นและเข้าใจที่สุด (Concise Core Summary)</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              All unnecessary fluff removed. Review these high-yield core principles within 5 minutes before moving to the quiz.
            </p>

            <div className="space-y-3">
              {guide.conciseSummary.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed font-medium">
                    {point}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mnemonic Anchor / Memory Hook */}
          {guide.mnemonicTrick && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>สูตรช่วยจำ / Mnemonic Memory Anchor</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-amber-950 font-display">
                "{guide.mnemonicTrick}"
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Repeat this rule mentally 3 times. It will be directly tested in the mock exam.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 1-Hour Phase Breakdown */}
      {activeTab === "timeline" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">
              The 60-Minute Learning Pathway
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Follow this timeline sequentially to prevent cognitive overload.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.oneHourPhases.map((phase, idx) => (
              <div
                key={phase.phaseNumber}
                onClick={() => setCurrentPhaseIndex(idx)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  currentPhaseIndex === idx
                    ? "border-red-500 bg-red-50/30 ring-2 ring-red-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold font-mono tabular-nums text-slate-500 mb-2">
                  <span className="text-red-600">Phase {phase.phaseNumber}</span>
                  <span>{phase.timeRange}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  {phase.title}
                </h4>
                <p className="text-xs text-slate-600 font-medium mb-3">
                  <span className="font-bold text-slate-800">Goal:</span> {phase.objective}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  {phase.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0">·</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: High-Yield Key Items (Rules & Vocabulary) */}
      {activeTab === "vocab" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Core Rules & Essential Vocabulary
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Listen to correct pronunciation and observe standard usage patterns.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Click speaker to listen
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.keyItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white space-y-2.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                      {item.term}
                    </span>
                    {item.phoneticOrReading && (
                      <span className="ml-2 text-xs font-mono text-slate-500">
                        [{item.phoneticOrReading}]
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(item.term)}
                    title="Pronounce"
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-medium text-slate-700">
                  <span className="font-semibold text-slate-900">Meaning: </span>
                  {item.meaning}
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Example: </span>
                  <span className="font-sans text-slate-800">{item.example}</span>
                </div>

                {item.proTip && (
                  <div className="text-xs text-red-700 font-medium flex items-start gap-1.5 pt-1">
                    <span className="font-bold shrink-0">Pro-Tip:</span>
                    <span>{item.proTip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Common Pitfalls & Traps */}
      {activeTab === "traps" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Common Pitfalls & Exam Traps</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              These are the exact points where test-takers lose marks. Study them before the quiz!
            </p>
          </div>

          <div className="space-y-4">
            {guide.commonPitfalls.map((pitfall, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-red-100 bg-red-50/20 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    ❌ Common Mistake:
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {pitfall.mistake}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    ✅ Correct Form:
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {pitfall.correction}
                  </span>
                </div>

                <div className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 pt-1">
                  <span className="font-semibold text-slate-700">Why: </span>
                  {pitfall.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hand-drawn wireframe button from Image 2:
          "ปุ่มไปขั้นตอนสำหรับแอปในการเก็บเนื้อหาของเรา" -> Transition to Recall Part */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold mb-1">
            Step 1 of 3 Complete · Next: Active Recall
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            {labels.nextTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {labels.nextDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={onProceedToRecall}
            className="w-full sm:w-auto px-7 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-red-500/25 active:scale-95"
          >
            <span>{labels.nextBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onProceedToExam}
            className="w-full sm:w-auto px-4 py-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {labels.skipBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
