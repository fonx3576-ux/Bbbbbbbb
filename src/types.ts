export interface OneHourPhase {
  phaseNumber: number;
  timeRange: string;
  title: string;
  objective: string;
  actionItems: string[];
}

export interface KeyItem {
  term: string;
  phoneticOrReading?: string;
  meaning: string;
  example: string;
  proTip?: string;
}

export interface CommonPitfall {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested?: string;
}

export interface RecallItem {
  id: number;
  prompt: string;
  answer: string;
  hint?: string;
  category?: "concept" | "rule" | "vocab" | "trap";
}

export interface StudyGuide {
  id: string;
  title: string;
  targetSubject: string;
  targetLanguage?: "th" | "en" | "zh";
  estimatedReadTimeMinutes: number;
  conciseSummary: string[];
  oneHourPhases: OneHourPhase[];
  keyItems: KeyItem[];
  commonPitfalls: CommonPitfall[];
  mnemonicTrick: string;
  recallItems?: RecallItem[];
  mockQuiz: QuizQuestion[];
  createdAt: number;
}

export interface QuizResult {
  score: number;
  total: number;
  userAnswers: Record<number, number>;
  incorrectQuestions: Array<{
    question: string;
    chosen: string;
    correct: string;
    explanation: string;
  }>;
}

export interface RemedialReview {
  mistakePatternSummary: string;
  goldenRulesToFix: string[];
  targetedBreakdowns: Array<{
    questionText: string;
    userChosen?: string;
    correctAnswer: string;
    howToRemember: string;
  }>;
  encouragement: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}
