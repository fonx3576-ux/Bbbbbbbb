import React, { useState } from "react";
import { Menu, X, History, Plus, Globe, BookOpen, Brain, Award } from "lucide-react";

interface HeaderProps {
  activeTab: "search" | "info" | "recall" | "exam";
  hasActiveGuide: boolean;
  selectedLang: "th" | "en" | "zh";
  onSelectLang: (lang: "th" | "en" | "zh") => void;
  onNavigate: (tab: "search" | "info" | "recall" | "exam") => void;
  onOpenHistory: () => void;
  onNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  hasActiveGuide,
  selectedLang,
  onSelectLang,
  onNavigate,
  onOpenHistory,
  onNewSession,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Left Zone: Hamburger Menu as drawn in Wireframe Image 1 + Brand wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 text-slate-700 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[2.3]" />
            </button>

            <button
              onClick={onNewSession}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors whitespace-nowrap">
                FR : <span className="text-red-600">Fast Read</span>
              </span>
            </button>
          </div>

          {/* Center Zone: Clean single-line links for the 3 study stages */}
          <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate("search")}
              className={`cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === "search" ? "text-red-600 font-bold" : "hover:text-slate-900"
              }`}
            >
              {selectedLang === "th" ? "ค้นหา" : selectedLang === "zh" ? "查找" : "Search"}
            </button>

            {hasActiveGuide && (
              <>
                <button
                  onClick={() => onNavigate("info")}
                  className={`cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "info" ? "text-red-600 font-bold" : "hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. Information</span>
                </button>
                <button
                  onClick={() => onNavigate("recall")}
                  className={`cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "recall" ? "text-red-600 font-bold" : "hover:text-slate-900"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>2. Recall</span>
                </button>
                <button
                  onClick={() => onNavigate("exam")}
                  className={`cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "exam" ? "text-red-600 font-bold" : "hover:text-slate-900"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>3. Exam</span>
                </button>
              </>
            )}

            <button
              onClick={onOpenHistory}
              className="cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedLang === "th" ? "ประวัติ" : selectedLang === "zh" ? "历史" : "Saved"}</span>
            </button>
          </nav>

          {/* Right Zone: 3-Language Switcher & New Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick 3 Language Switcher (Thai, English, Chinese) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => onSelectLang("th")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedLang === "th" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Thai (ภาษาไทย)"
              >
                TH
              </button>
              <button
                onClick={() => onSelectLang("en")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedLang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onSelectLang("zh")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedLang === "zh" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chinese (中文)"
              >
                ZH
              </button>
            </div>

            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Drawer for Hamburger Menu (Wireframe 1) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="text-lg font-bold text-slate-900">
                  FR : <span className="text-red-600">Fast Read</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Languages Only Selection */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>3 Languages Mode</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => {
                      onSelectLang("th");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLang === "th" ? "bg-red-50 text-red-700 border border-red-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>🇹🇭 ภาษาไทย (Thai)</span>
                    {selectedLang === "th" && <span className="text-red-600 font-bold">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      onSelectLang("en");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLang === "en" ? "bg-red-50 text-red-700 border border-red-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {selectedLang === "en" && <span className="text-red-600 font-bold">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      onSelectLang("zh");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLang === "zh" ? "bg-red-50 text-red-700 border border-red-200" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>🇨🇳 中文 (Chinese)</span>
                    {selectedLang === "zh" && <span className="text-red-600 font-bold">✓</span>}
                  </button>
                </div>
              </div>

              {/* 3 Learning Steps in Drawer */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1-Hour Pathway
                </div>
                <button
                  onClick={() => {
                    onNavigate("search");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  🔍 Find Topic
                </button>

                {hasActiveGuide && (
                  <>
                    <button
                      onClick={() => {
                        onNavigate("info");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      📖 1. Information Part (ส่วนข้อมูล)
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("recall");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      🧠 2. Recall Part (ส่วนทวนเนื้อหา)
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("exam");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      📝 3. Exam Part (ส่วนข้อสอบจำลอง)
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    onOpenHistory();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer pt-2 border-t border-slate-100"
                >
                  📁 Saved Study Sessions
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
              FR : Fast Read · Your AI Helper
            </div>
          </div>
        </div>
      )}
    </>
  );
};
