import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HeroSearch } from "./components/HeroSearch";
import { StudyGuideView } from "./components/StudyGuideView";
import { RecallView } from "./components/RecallView";
import { MockQuizView } from "./components/MockQuizView";
import { AiHelperDrawer } from "./components/AiHelperDrawer";
import { SavedSessionsModal } from "./components/SavedSessionsModal";
import { StudyGuide, RemedialReview } from "./types";
import { SAMPLE_STUDY_GUIDES } from "./data/sampleGuides";

export default function App() {
  const [activeTab, setActiveTab] = useState<"search" | "info" | "recall" | "exam">("search");
  const [currentGuide, setCurrentGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<"th" | "en" | "zh">("th");
  const [savedGuides, setSavedGuides] = useState<StudyGuide[]>(() => {
    try {
      const stored = localStorage.getItem("fr_saved_guides");
      return stored ? JSON.parse(stored) : SAMPLE_STUDY_GUIDES;
    } catch {
      return SAMPLE_STUDY_GUIDES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fr_saved_guides", JSON.stringify(savedGuides));
    } catch (e) {
      console.error("Failed to persist saved guides:", e);
    }
  }, [savedGuides]);

  const handleSearch = async (topic: string, rawContent?: string, targetLang?: "th" | "en" | "zh") => {
    setIsLoading(true);

    // Robust language detection
    let detectedLang: "th" | "en" | "zh" = targetLang || selectedLang;
    const query = (topic || "").trim().toLowerCase();

    // 1. Chinese detection
    if (
      /chinese|mandarin|pinyin|hanzi|hsk|bopomofo|zhuyin|cantonese|beijing|putonghua|china|จีน|ภาษาจีน|ตัวจีน|อักษรจีน|พินอิน|ฮั่นจื้อ|中文|汉语|拼音|声母|韵母|声调|汉字/i.test(query) ||
      /[\u4E00-\u9FFF]/.test(topic)
    ) {
      detectedLang = "zh";
    }
    // 2. English detection
    else if (
      /english|tenses|tense|grammar|verb|vocabulary|esl|conditionals|passive voice|preposition|pronoun|ielts|toefl|อังกฤษ|ภาษาอังกฤษ|ไวยากรณ์อังกฤษ|英语|英文/i.test(query)
    ) {
      detectedLang = "en";
    }
    // 3. Thai detection
    else if (
      /thai|ภาษาไทย|วรรณยุกต์|อักษรไทย|พยัญชนะไทย|ไตรยางศ์|คำเป็น|คำตาย|สระไทย|ตัวสะกด|อักษรนำ|ควบกล้ำ|การันต์|ทัณฑฆาต|泰语|泰文/i.test(query)
    ) {
      detectedLang = "th";
    }
    // 4. Pure Thai script without mentioning Chinese or English
    else if (/[\u0E00-\u0E7F]/.test(topic)) {
      detectedLang = "th";
    }

    // Sync UI language selector
    setSelectedLang(detectedLang);

    try {
      const response = await fetch("/api/study/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          rawContent,
          targetLanguage: detectedLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const finalLang = (data.targetLanguage as "th" | "en" | "zh") || detectedLang;
      setSelectedLang(finalLang);

      const newGuide: StudyGuide = {
        id: `guide-${Date.now()}`,
        title: data.title || topic,
        targetSubject: data.targetSubject || (finalLang === "th" ? "Thai (ภาษาไทย)" : finalLang === "zh" ? "Chinese (中文)" : "English"),
        targetLanguage: finalLang,
        estimatedReadTimeMinutes: data.estimatedReadTimeMinutes || 5,
        conciseSummary: data.conciseSummary || [],
        oneHourPhases: data.oneHourPhases || [],
        keyItems: data.keyItems || [],
        commonPitfalls: data.commonPitfalls || [],
        mnemonicTrick: data.mnemonicTrick || "",
        recallItems: data.recallItems,
        mockQuiz: data.mockQuiz || [],
        createdAt: Date.now(),
      };

      setCurrentGuide(newGuide);
      setActiveTab("info"); // Step 1: Information Part
    } catch (err: any) {
      console.warn("Fallback to verified curriculum for topic:", err);
      // Guarantee 100% accurate language matching fallback
      const fallback = detectedLang === "zh"
        ? SAMPLE_STUDY_GUIDES[2]
        : detectedLang === "en"
        ? SAMPLE_STUDY_GUIDES[1]
        : SAMPLE_STUDY_GUIDES[0];
      setCurrentGuide(fallback);
      setActiveTab("info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: StudyGuide) => {
    if (sample.targetLanguage) {
      setSelectedLang(sample.targetLanguage);
    }
    setCurrentGuide(sample);
    setActiveTab("info"); // Step 1: Information Part
  };

  const handleToggleSaveGuide = (guide: StudyGuide) => {
    setSavedGuides((prev) => {
      const exists = prev.some((g) => g.id === guide.id);
      if (exists) {
        return prev.filter((g) => g.id !== guide.id);
      } else {
        return [guide, ...prev];
      }
    });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedGuides((prev) => prev.filter((g) => g.id !== id));
  };

  const handleRequestRemedial = async (incorrectQuestions: any[]): Promise<RemedialReview | null> => {
    try {
      const response = await fetch("/api/study/remedial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentGuide ? currentGuide.title : "Language & Topics",
          incorrectQuestions,
          targetLanguage: currentGuide?.targetLanguage || selectedLang,
        }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("Remedial fetch failed:", e);
      return null;
    }
  };

  const isCurrentSaved = currentGuide ? savedGuides.some((g) => g.id === currentGuide.id) : false;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Bar with 3-Part Navigation */}
      <Header
        activeTab={activeTab}
        hasActiveGuide={!!currentGuide}
        selectedLang={selectedLang}
        onSelectLang={(lang) => setSelectedLang(lang)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewSession={() => {
          setActiveTab("search");
        }}
      />

      {/* Main View Area with Information -> Recall -> Exam Steps */}
      <main className="flex-1">
        {activeTab === "search" && (
          <HeroSearch
            onSearch={handleSearch}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
            selectedLang={selectedLang}
            onSelectLang={(lang) => setSelectedLang(lang)}
          />
        )}

        {/* Step 1: Information Part (ส่วนหาข้อมูล & สรุปเนื้อหา) */}
        {activeTab === "info" && currentGuide && (
          <StudyGuideView
            guide={currentGuide}
            selectedLang={currentGuide.targetLanguage || selectedLang}
            onProceedToRecall={() => setActiveTab("recall")}
            onProceedToExam={() => setActiveTab("exam")}
            onSaveToSession={handleToggleSaveGuide}
            isSaved={isCurrentSaved}
          />
        )}

        {/* Step 2: Recall Part (ส่วนทวนเนื้อหา) */}
        {activeTab === "recall" && currentGuide && (
          <RecallView
            guide={currentGuide}
            onProceedToExam={() => setActiveTab("exam")}
            onBackToInfo={() => setActiveTab("info")}
            selectedLang={currentGuide.targetLanguage || selectedLang}
          />
        )}

        {/* Step 3: Exam Part (ส่วนทำข้อสอบจำลอง) */}
        {activeTab === "exam" && currentGuide && (
          <MockQuizView
            topic={currentGuide.title}
            questions={currentGuide.mockQuiz}
            selectedLang={currentGuide.targetLanguage || selectedLang}
            onBackToGuide={() => setActiveTab("info")}
            onBackToRecall={() => setActiveTab("recall")}
            onRequestRemedialAdvice={handleRequestRemedial}
          />
        )}
      </main>

      {/* Floating AI Helper Drawer matching Wireframe 1 */}
      <AiHelperDrawer currentGuide={currentGuide} />

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedGuides={savedGuides}
        onSelectGuide={(guide) => {
          if (guide.targetLanguage) {
            setSelectedLang(guide.targetLanguage);
          }
          setCurrentGuide(guide);
          setActiveTab("info");
        }}
        onDeleteGuide={handleDeleteSaved}
      />
    </div>
  );
}
