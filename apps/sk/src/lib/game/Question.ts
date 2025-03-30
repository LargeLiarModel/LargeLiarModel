import type { QuestionType, QuestionContent } from "./types";

export class Question {
    id: string;
    type: QuestionType;
    content: QuestionContent;
    correctAnswer: boolean;
    explanation?: string;

    constructor(data: {
        id: string;
        type: QuestionType;
        content: QuestionContent;
        correctAnswer: boolean;
        explanation?: string;
    }) {
        this.id = data.id;
        this.type = data.type;
        this.content = data.content;
        this.correctAnswer = data.correctAnswer;
        this.explanation = data.explanation;
    }

    // Helper to render the question based on content type
    getDisplayData() {
        return {
            contentType: this.content.type,
            data: this.content.data,
            category: this.type,
            correctAnswer: this.correctAnswer,
        };
    }
}
