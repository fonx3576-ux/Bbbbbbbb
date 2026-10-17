import React from "react";
import { X, Trash2, BookOpen, Clock, ArrowRight } from "lucide-react";
import { StudyGuide } from "../types";

interface SavedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedGuides: StudyGuide[];
  onSelectGuide: (guide: StudyGuide) => void;
  onDeleteGuide: (id: string) => void;
}

export const SavedSessionsModal: React.FC<SavedSessionsModalProps> = ({
  isOpen,
  onClose,
  savedGuides,
  onSelectGuide,
  onDeleteGuide,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Saved 1-Hour Study Sessions
            </h3>
            <p className="text-xs text-slate-500">
              Your bookmarks and completed mock exams saved locally.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 max-h-96 overflow-y-auto space-y-3">
          {savedGuides.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>No saved study sessions yet. Click "Save Guide" inside any topic!</span>
            </div>
          ) : (
            savedGuides.map((guide) => (
              <div
                key={guide.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-300 transition-all flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50"
              >
                <div
                  onClick={() => {
                    onSelectGuide(guide);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-red-600 mb-0.5">
                    {guide.targetSubject}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {guide.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {guide.mockQuiz?.length || 0} Quiz Questions · {new Date(guide.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectGuide(guide);
                      onClose();
                    }}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Open Guide"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteGuide(guide.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
