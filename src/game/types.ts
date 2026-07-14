export type Tier = "Standard" | "Priority" | "VIP" | "Executive";

export type Category =
  | "Accounts"
  | "Network"
  | "Hardware"
  | "Software"
  | "Email"
  | "Security"
  | "Mobile";

export type Mood = "calm" | "confused" | "annoyed" | "panicked" | "friendly";

export interface Persona {
  name: string;
  role: string;
  company: string;
  avatar: string; // emoji
  /** Voice tuning for the Web Speech API */
  pitch: number;
  rate: number;
  /** Preferred voice gender hint for picking a system voice */
  voiceHint: "female" | "male" | "neutral";
}

export interface ChoiceOption {
  id: string;
  text: string;
  /** true = correct/best action, advances the ticket */
  correct: boolean;
  /** what the client says back after this choice */
  reply: string;
  /** how the client's mood shifts after this reply */
  mood?: Mood;
  /** satisfaction change applied when picked */
  csat: number;
  /** short coaching note shown after a wrong pick */
  coaching?: string;
}

export interface ScenarioStep {
  /** the situation the agent is looking at right now (client message already shown) */
  clientMessage: string;
  clientMood: Mood;
  /** what the player must do at this step */
  options: ChoiceOption[];
  /** relevant KB article ids for this step */
  kb?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: Category;
  tier: Tier;
  /** 1 (trainee) .. 5 (nightmare) */
  difficulty: number;
  persona: Persona;
  summary: string;
  /** SLA time in seconds to resolve for full bonus */
  slaSeconds: number;
  xp: number;
  steps: ScenarioStep[];
  /** minimum player level required to see this ticket in the queue */
  minLevel: number;
  tags: string[];
}

export interface KbArticle {
  id: string;
  title: string;
  category: Category;
  body: string;
}

export type ChatRole = "client" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
}

export interface TicketResult {
  scenarioId: string;
  title: string;
  persona: string;
  csat: number; // 0..100
  xpEarned: number;
  timeSeconds: number;
  slaMet: boolean;
  firstTryStreak: number;
  wrongPicks: number;
}

/** Per-ticket record kept for the performance dashboard (trend + breakdown). */
export interface HistoryEntry {
  scenarioId: string;
  category: Category;
  csat: number;
  xpEarned: number;
  slaMet: boolean;
  wrongPicks: number;
  ts: number;
}

/** Rolling per-category performance for strengths/weaknesses. */
export interface CategoryStat {
  resolved: number;
  csatSum: number;
}

export interface Progress {
  xp: number;
  ticketsResolved: number;
  totalCsat: number; // running sum for average
  bestStreak: number;
  currentStreak: number;
  completedScenarioIds: string[];
  unlockedBadgeIds: string[];
  soundOn: boolean;
  voiceOn: boolean;
  agentName: string;
  /** last N resolved tickets, newest last — powers the dashboard trend */
  history: HistoryEntry[];
  /** per-category tallies for the dashboard breakdown */
  categoryStats: Partial<Record<Category, CategoryStat>>;
  /** rank levels whose certification exam has been passed */
  passedExamLevels: number[];
  /** number of tickets whose wrap-up documentation was fully correct */
  docsCorrect: number;
  /** whether the first-time floor tutorial has been shown */
  tutorialSeen: boolean;
}
