export enum QuestionType {
    Art = "art",
    Music = "music",
    News = "news",
    ElectionData = "election_data",
    Quote = "quote",
}

export interface GameConfig {
    totalQuestions: number;
    questionTypes: QuestionType[];
    // timePerQuestion?: number; // TODO: add timed questions
}

export const createGameConfig = (
    totalQuestions: number,
    questionTypes: QuestionType[],
): GameConfig => {
    return {
        totalQuestions,
        questionTypes,
    };
};

export interface QuestionContent {
    type: "text" | "image" | "audio" | "video" | "data";
    data: any | TextContent; // This will be specialized based on content type
}

export interface TextContent {
    text: string;
}

export enum GameStatus {
    NotStarted = "not_started",
    InProgress = "in_progress",
    Ended = "ended",
}
