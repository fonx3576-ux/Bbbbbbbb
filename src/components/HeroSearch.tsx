import React, { useState } from "react";
import { Search, ArrowRight, Loader2, BookOpen, Sparkles } from "lucide-react";
import { SAMPLE_STUDY_GUIDES } from "../data/sampleGuides";
import { StudyGuide } from "../types";

interface HeroSearchProps {
  onSearch: (topic: string, rawContent?: string, targetLanguage?: "th" | "en" | "zh") => void;
  onSelectSample: (guide: StudyGuide) => void;
  isLoading: boolean;
  selectedLang: "th" | "en" | "zh";
  onSelectLang: (lang: "th" | "en" | "zh") => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  onSelectSample,
  isLoading,
  selectedLang,
  onSelectLang,
}) => {
  const [topicInput, setTopicInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !topicInput.trim()) return;
    onSearch(topicInput.trim(), undefined, selectedLang);
  };

  // Placeholders and recommendations tailored strictly for Thai, English, and Chinese
  const languageContent = {
    th: {
      placeholder: "พิมพ์เนื้อหาที่ต้องการ เช่น อักษร 3 หมู่, กฎการผันวรรณยุกต์, คำเป็นคำตาย...",
      quickPicks: [
        { label: "กฎการผันวรรณยุกต์ 5 เสียง", query: "การผันวรรณยุกต์ 5 เสียงและอักษร 3 หมู่" },
        { label: "คำเป็น vs คำตาย (นมยวง/กบด)", query: "หลักคำเป็นคำตาย นมยวง และ กบด" },
        { label: "อักษรนำและคำควบกล้ำ", query: "หลักการจำอักษรนำและคำควบกล้ำแท้ไม่แท้" },
      ],
      sampleTitle: "บทเรียน 1 ชม. แนะนำสำหรับภาษาไทย",
    },
    en: {
      placeholder: "Type what you want to learn, e.g. Present Perfect vs Past Simple, Conditionals...",
      quickPicks: [
        { label: "Present Perfect vs Past Simple", query: "English Present Perfect vs Past Simple tenses" },
        { label: "If-Clauses (Conditionals 1, 2, 3)", query: "English Conditional Sentences Zero First Second Third" },
        { label: "Passive Voice in 60 Minutes", query: "Active vs Passive Voice grammar rules" },
      ],
      sampleTitle: "Recommended 1-Hour English Masterclasses",
    },
    zh: {
      placeholder: "输入想学习的中文主题，例如：HSK量词、把字句、声调规律、时态助词了...",
      quickPicks: [
        { label: "HSK 1-2 核心量词 (个/本/张)", query: "HSK 1-2 基础量词用法与易错点" },
        { label: "中文S+T+L+V+O基本语序", query: "中文时间状语与基本句子语序" },
        { label: "助词“了”与“吗”用法", query: "中文动态助词了与疑问助词吗" },
      ],
      sampleTitle: "推荐中文 1小时精要课程",
    },
  };

  const currentContent = languageContent[selectedLang];

  return (
    <div className="py-8 sm:py-14 max-w-3xl mx-auto px-4 text-center">
      {/* 1. Large Magnifying Glass as drawn in Wireframe Image 1 */}
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-900 flex items-center justify-center text-slate-900 mb-6 transition-transform hover:scale-105 shadow-xs">
        <Search className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.4]" />
      </div>

      {/* 2. Bold Red Title: FR : Fast Read */}
      <h1 className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight mb-1.5 font-display">
        FR : Fast Read
      </h1>

      {/* 3. Bold Red Subtitle: Your AI Helper */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight mb-5 font-display">
        Your AI Helper
      </h2>

      {/* 4. Thai Wireframe Description from sketch */}
      <p className="text-base sm:text-lg text-slate-800 max-w-lg mx-auto font-bold leading-relaxed mb-8">
        ช่วยสรุปเนื้อหาและหาข้อมูล ทวนเนื้อหา และทำข้อสอบจำลอง <br />
        <span className="text-slate-900">ทั้งหมดภายใน 1 ชม.เท่านั้น!</span>
      </p>

      {/* 5. Clean 3-Language Selector (Thai, English, Chinese) */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
          Language:
        </span>
        <button
          type="button"
          onClick={() => onSelectLang("th")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
            selectedLang === "th"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          🇹🇭 ภาษาไทย
        </button>
        <button
          type="button"
          onClick={() => onSelectLang("en")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
            selectedLang === "en"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          onClick={() => onSelectLang("zh")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
            selectedLang === "zh"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          🇨🇳 中文
        </button>
      </div>

      {/* 6. Signature Oval Input Container matching the sketch: พิมพ์เนื้อหาที่ต้องการ */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6 text-left">
        <div className="relative flex items-center">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder={currentContent.placeholder}
            disabled={isLoading}
            className="w-full pl-6 pr-32 py-4 text-sm sm:text-base bg-white border-3 border-slate-900 rounded-full focus:outline-none focus:ring-4 focus:ring-red-100 placeholder:text-slate-400 font-bold shadow-sm transition-all text-slate-900"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="absolute right-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>1-Hour Study</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Topic Chips */}
      <div className="max-w-xl mx-auto mb-10 flex flex-wrap items-center justify-center gap-2">
        {currentContent.quickPicks.map((pick, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setTopicInput(pick.query);
              onSearch(pick.query, undefined, selectedLang);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {pick.label}
          </button>
        ))}
      </div>

      {/* 7. Ready-to-Test 1-Hour Masterclasses (Thai, English, Chinese) */}
      <div className="text-left max-w-2xl mx-auto pt-6 border-t border-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-600" />
            <span>{currentContent.sampleTitle}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">100% Fact-Checked</span>
        </div>

        <div className="space-y-3">
          {/* Selected Language Primary Masterclass first */}
          {(() => {
            const currentMatching = SAMPLE_STUDY_GUIDES.filter((s) => s.targetLanguage === selectedLang);
            const others = SAMPLE_STUDY_GUIDES.filter((s) => s.targetLanguage !== selectedLang);
            const ordered = [...currentMatching, ...others];

            return ordered.map((sample) => {
              const isCurrentLang = sample.targetLanguage === selectedLang;
              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className={`p-4 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between gap-4 group border ${
                    isCurrentLang
                      ? "bg-white border-red-200 hover:border-red-500 ring-1 ring-red-50"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className={`font-bold ${isCurrentLang ? "text-red-600" : "text-slate-600"}`}>
                        {sample.targetSubject}
                      </span>
                      {isCurrentLang && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 rounded-md">
                          Selected
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">1-Hour Condensed</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-500">5 Exam Questions</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {sample.title}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isCurrentLang
                      ? "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-white"
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
