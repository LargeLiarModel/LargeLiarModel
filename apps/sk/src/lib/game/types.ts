export enum QuestionType {
  Art = "art",
  Music = "music",
  News = "news",
  ElectionData = "election_data",
}

export interface GameConfig {
  totalQuestions: number;
  questionTypes: QuestionType[];
  // timePerQuestion?: number; // TODO: add timed questions
}

export interface QuestionContent {
  type: "text" | "image" | "audio" | "video" | "data";
  data: any; // This will be specialized based on content type
}

export enum GameStatus {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Ended = "ended",
}