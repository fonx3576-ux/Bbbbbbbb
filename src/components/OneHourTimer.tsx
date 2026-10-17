import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Volume2,
  VolumeX,
  AlertTriangle,
  Bell,
  ArrowRight,
  Plus,
  Zap,
} from "lucide-react";
import { OneHourPhase } from "../types";

interface OneHourTimerProps {
  phases: OneHourPhase[];
  currentPhaseIndex: number;
  onPhaseSelect: (index: number) => void;
  onProceedToQuiz: () => void;
}

export const OneHourTimer: React.FC<OneHourTimerProps> = ({
  phases,
  currentPhaseIndex,
  onPhaseSelect,
  onProceedToQuiz,
}) => {
  // Starts at exactly 60 minutes (3600 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);
  const [isRunning, setIsRunning] = useState<boolean>(true); // Auto-starts for immediate 1-hour focus
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Alert modal states
  const [alertState, setAlertState] = useState<"none" | "ending_soon" | "ended">("none");
  const hasTriggeredWarningRef = useRef<boolean>(false);
  const hasTriggeredEndedRef = useRef<boolean>(false);

  // Web Audio API chime (gentle harmonic tone synthesized in-browser, no external audio file)
  const playChime = (type: "warning" | "ended") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "warning") {
        // Two-tone attention bell (D5 -> A5)
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else {
        // Harmonious completion chime (C5 -> E5 -> G5 -> C6)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.18);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.36);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.54);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      console.warn("Audio chime unsupported or blocked:", e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          const nextVal = prev - 1;

          // 5-minute warning alert (300 seconds)
          if (nextVal === 300 && !hasTriggeredWarningRef.current) {
            hasTriggeredWarningRef.current = true;
            setAlertState("ending_soon");
            playChime("warning");
          }

          // 0 seconds: Session Completed
          if (nextVal <= 0) {
            setIsRunning(false);
            if (!hasTriggeredEndedRef.current) {
              hasTriggeredEndedRef.current = true;
              setAlertState("ended");
              playChime("ended");
            }
            return 0;
          }

          return nextVal;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, soundEnabled]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const elapsedSeconds = 3600 - secondsRemaining;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / 3600) * 100)));

  // Phase synchronization based on elapsed time:
  // Phase 1: 0-15m (3600 - 2700s remaining)
  // Phase 2: 15-35m (2700 - 1500s remaining)
  // Phase 3: 35-50m (1500 - 600s remaining)
  // Phase 4: 50-60m (600 - 0s remaining)
  useEffect(() => {
    if (secondsRemaining > 2700) {
      onPhaseSelect(0);
    } else if (secondsRemaining > 1500) {
      onPhaseSelect(1);
    } else if (secondsRemaining > 600) {
      onPhaseSelect(2);
    } else {
      onPhaseSelect(3);
    }
  }, [secondsRemaining]);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(3600);
    hasTriggeredWarningRef.current = false;
    hasTriggeredEndedRef.current = false;
    setAlertState("none");
  };

  const addTimeMinutes = (mins: number) => {
    setSecondsRemaining((prev) => {
      const updated = prev + mins * 60;
      if (updated > 300) {
        hasTriggeredWarningRef.current = false;
      }
      return updated;
    });
    setAlertState("none");
    if (!isRunning) setIsRunning(true);
  };

  // Quick test helper for immediate verification
  const setTestEndingSoon = () => {
    hasTriggeredWarningRef.current = false;
    hasTriggeredEndedRef.current = false;
    setSecondsRemaining(10); // 10 seconds left
    setIsRunning(true);
  };

  const isWarningZone = secondsRemaining <= 300 && secondsRemaining > 0;
  const isExpired = secondsRemaining === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs relative">
      {/* Active Session Ending Soon Banner (when <= 5 mins) */}
      {isWarningZone && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 text-xs text-amber-900 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Session Ending Soon ({formattedTime} left) — Wrap up your reading and prepare for Phase 4 Mock Exam!
            </span>
          </div>
          <button
            onClick={onProceedToQuiz}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md cursor-pointer shrink-0"
          >
            Go to Quiz
          </button>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-colors ${
              isExpired
                ? "bg-red-600 text-white animate-bounce"
                : isWarningZone
                ? "bg-amber-100 text-amber-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <span>60-Minute Fast Study Countdown</span>
              {isWarningZone && (
                <span className="text-amber-600 font-bold">· Ending Soon</span>
              )}
              {isExpired && (
                <span className="text-red-600 font-bold">· Session Finished</span>
              )}
            </div>
            <div
              className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                isExpired
                  ? "text-red-600"
                  : isWarningZone
                  ? "text-amber-600"
                  : "text-slate-900"
              }`}
            >
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{secondsRemaining === 3600 ? "Start 60m" : "Resume"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset to 60:00"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => addTimeMinutes(5)}
            title="Add 5 Minutes"
            className="px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-slate-500" />
            <span>5m</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute alert chimes" : "Enable alert chimes"}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-slate-100 border-slate-300 text-slate-800"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Instant test shortcut so user can trigger the alert right away without waiting 60 mins */}
          <button
            onClick={setTestEndingSoon}
            title="Quick Test Alert (Sets timer to 10 seconds)"
            className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Test Alert (10s)</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExpired ? "bg-red-600" : isWarningZone ? "bg-amber-500" : "bg-red-600"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Phase buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
        {phases.map((phase, idx) => {
          const isActive = currentPhaseIndex === idx;
          return (
            <button
              key={phase.phaseNumber}
              onClick={() => onPhaseSelect(idx)}
              className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1">
                <span className={isActive ? "text-red-400 font-bold" : "text-slate-500 font-medium"}>
                  P{phase.phaseNumber} · {phase.timeRange}
                </span>
              </div>
              <div className="text-xs font-semibold truncate">
                {phase.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal Alert 1: Session Ending Soon (5 Minutes Left) */}
      {alertState === "ending_soon" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              Phase 4 Transition Alert
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Your 1-Hour Session is Ending Soon!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              You have <span className="font-bold text-amber-700">5 minutes remaining</span> in your study session. Wrap up your reading of the rules and head over to Phase 4 for the Mock Exam drill.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => {
                  setAlertState("none");
                  onProceedToQuiz();
                }}
                className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Mock Exam Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAlertState("none")}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Keep Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alert 2: 1-Hour Session Finished (Time's Up) */}
      {alertState === "ended" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              Time is Up · 60 Minutes Complete
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              Study Session Has Ended!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Fantastic work completing your 1-hour fast study session. Now is the ideal moment to take the mock exam to lock the concepts into long-term memory.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => {
                  setAlertState("none");
                  onProceedToQuiz();
                }}
                className="w-full sm:flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Take Mock Exam (ทำข้อสอบ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => addTimeMinutes(5)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                +5 Min Extra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
