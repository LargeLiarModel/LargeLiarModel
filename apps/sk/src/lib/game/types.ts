export enum QuestionType {
    Art = "art",
    Music = "music",
    News = "news",
    StockPhoto = "stock_photo",
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

export interface QuoteContent {
    text: string;
}

export interface ArtContent {
    realImage: string;
    fakeImage: string;
    correctAnswer: boolean;
}

export interface MusicContent {
    artist: string;
    song: string;
}

export interface NewsContent {
    headline: string;
    source?: string;
    text: string;
    date: string;
}

export interface StockPhotoContent {
    imageData: string;
}

export enum GameStatus {
    NotStarted = "not_started",
    InProgress = "in_progress",
    Ended = "ended",
}
