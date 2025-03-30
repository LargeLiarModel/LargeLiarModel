import type {
    QuestionType,
    QuoteContent,
    ArtContent,
    MusicContent,
    NewsContent,
    StockPhotoContent,
} from "./types";

export class Question {
    id: string;
    type: QuestionType;
    correctAnswer?: boolean;
    explanation?: string;

    constructor(data: {
        id: string;
        type: QuestionType;
        correctAnswer?: boolean;
        explanation?: string;
    }) {
        this.id = data.id;
        this.type = data.type;
        this.correctAnswer = data.correctAnswer;
        this.explanation = data.explanation;
    }
}
