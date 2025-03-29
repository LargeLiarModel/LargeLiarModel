import type { Question } from "./Question";
import { GameStatus } from "./types";
import type { GameConfig } from "./types";

interface GameState {
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    gameStarted: boolean;
    gameEnded: boolean;
    progress: number;
}

export class GameController {
    private config: GameConfig;
    private questions: Question[] = [];
    private currentQuestionIndex = 0;
    private score = 0;
    private gameState: GameStatus = GameStatus.NotStarted;
    private userAnswers: {
        questionId: string;
        userGuessedAI: boolean;
        correct: boolean;
    }[] = [];

    constructor(config: GameConfig) {
        this.config = config;
    }

    async initGame(): Promise<void> {
        try {
            this.questions = await this.fetchQuestions();
            this.gameState = GameStatus.InProgress;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.userAnswers = [];
        } catch (error) {
            console.error("Failed to initialize game:", error);
            throw new Error("Failed to load questions from API");
        }
    }

    private async fetchQuestions(): Promise<Question[]> {
        try {
            const response = await fetch("/api/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    count: this.config.totalQuestions,
                    types: this.config.questionTypes,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            throw new Error("Failed to load questions from API");
        }
    }

    getCurrentQuestion(): Question | null {
        if (this.gameState !== GameStatus.InProgress) {
            return null;
        }

        return this.questions[this.currentQuestionIndex];
    }

    submitAnswer(userGuessedAi: boolean): {
        correct: boolean;
        explanation?: string;
        isAiGenerated: boolean;
    } {
        if (this.gameState !== GameStatus.InProgress) {
            throw new Error("Game is not in progress");
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];

        const correct = userGuessedAi === currentQuestion.isAiGenerated;

        if (correct) {
            this.score++;
        }

        this.userAnswers.push({
            questionId: currentQuestion.id,
            userGuessedAI: userGuessedAi,
            correct,
        });

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex === this.questions.length) {
            this.gameState = GameStatus.Ended;
        }

        return {
            correct,
            explanation: currentQuestion.explanation,
            isAiGenerated: currentQuestion.isAiGenerated,
        };
    }

    getGameState(): GameState {
        return {
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.questions.length,
            score: this.score,
            gameStarted: this.gameState === GameStatus.InProgress,
            gameEnded: this.gameState === GameStatus.Ended,
            progress:
                this.questions.length > 0
                    ? Math.round(
                          this.currentQuestionIndex / this.questions.length,
                      ) * 100
                    : 0,
        };
    }

    getGameResults() {
        if (this.gameState !== GameStatus.Ended) {
            return null;
        }

        const statsByType = this.questions.reduce(
            (acc, question, index) => {
                const type = question.type;
                if (!acc[type]) {
                    acc[type] = { total: 0, correct: 0 };
                }

                acc[type].total++;

                if (
                    index < this.userAnswers.length &&
                    this.userAnswers[index].correct
                ) {
                    acc[type].correct++;
                }

                return acc;
            },
            {} as Record<string, { total: number; correct: number }>,
        );

        return {
            score: this.score,
            totalQuestions: this.questions.length,
            percentage: Math.round((this.score / this.questions.length) * 100),
            statsByType,
            answers: this.userAnswers,
        };
    }

    reset() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameState = GameStatus.NotStarted;
        this.userAnswers = [];
    }

    updateConfig(newConfig: GameConfig) {
        this.config = newConfig;
    }
}
