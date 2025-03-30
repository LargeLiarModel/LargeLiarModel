import { Question } from "./Question.svelte";
import { GameStatus, QuestionType } from "./types";
import type { GameConfig } from "./types";
import client from "$lib/client";

interface GameState {
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    gameStarted: boolean;
    gameEnded: boolean;
    progress: number;
}

export default class GameController {
    config: GameConfig;
    questions: Question[] = $state([]);
    currentQuestionIndex = $state(0);
    score = $state(0);
    gameState: GameStatus = $state(GameStatus.InProgress);
    isLoading = $state(true); // Track loading state
    userAnswers: {
        questionId: string;
        userGuess: boolean;
    }[] = $state([]);

    constructor(config: GameConfig) {
        this.config = config;
        this.config.questionTypes.forEach((type, i) => {
            this.questions.push(
                new Question({
                    id: i.toString(),
                    type: type,
                }),
            );
        });

        // Start preloading the first batch of questions and initialize
        this.initialize();
    }

    async initialize() {
        try {
            // Preload first batch of questions
            await this.preloadContent(0, 3);
            // Set loading to false when initial content is loaded
            this.isLoading = false;
        } catch (error) {
            console.error("Error initializing game content:", error);
            // Even on error, we should stop the loading state to prevent UI from being stuck
            this.isLoading = false;
        }
    }

    async preloadContent(startIndex: number, count: number) {
        const endIndex = Math.min(startIndex + count, this.questions.length);
        const loadPromises = [];

        for (let i = startIndex; i < endIndex; i++) {
            if (!this.questions[i].content) {
                loadPromises.push(this.loadQuestionContent(i));
            }
        }

        await Promise.all(loadPromises);
    }

    async loadQuestionContent(index: number) {
        const question = this.questions[index];

        if (question.content) return; // Already loaded

        switch (question.type) {
            case QuestionType.StockPhoto:
                await this.loadStockPhotoContent(index);
                break;
            case QuestionType.Quote:
                await this.loadQuoteContent(index);
                break;
            case QuestionType.Art:
                await this.loadArtContent(index);
                break;
            case QuestionType.Music:
                await this.loadMusicContent(index);
                break;
            case QuestionType.News:
                await this.loadNewsContent(index);
                break;
            default:
                console.warn(
                    `No loader implemented for question type: ${question.type}`,
                );
                // Add placeholder content to prevent UI from getting stuck
                this.addPlaceholderContent(index);
        }
    }

    // Placeholder implementations for other content types
    async loadQuoteContent(index: number) {
        try {
            // In a real implementation, this would fetch from an API
            const quotes = [
                {
                    text: "To be or not to be, that is the question.",
                    isReal: true,
                },
                {
                    text: "The only thing we have to fear is fear itself.",
                    isReal: true,
                },
                {
                    text: "Life is what happens when you're busy making other plans.",
                    isReal: true,
                },
                {
                    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
                    isReal: true,
                },
                {
                    text: "The future belongs to those who believe in the beauty of their dreams.",
                    isReal: true,
                },
                {
                    text: "The best way to predict the future is to create it.",
                    isReal: true,
                },
                {
                    text: "Happiness is not something ready-made. It comes from your own actions.",
                    isReal: true,
                },
                {
                    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
                    isReal: true,
                },
                {
                    text: "The way to get started is to quit talking and begin doing.",
                    isReal: true,
                },
                {
                    text: "If life were predictable it would cease to be life, and be without flavor.",
                    isReal: true,
                },
            ];

            const randomIndex = Math.floor(Math.random() * quotes.length);
            const isCorrect = quotes[randomIndex].isReal;

            this.questions[index].content = {
                text: quotes[randomIndex].text,
            };
            this.questions[index].correctAnswer = isCorrect;
        } catch (error) {
            console.error("Error loading quote content:", error);
            this.addPlaceholderContent(index);
        }
    }

    async loadArtContent(index: number) {
        try {
            const response = await fetch("https://testing.rushil.land");

            console.log("response ", response);

            if (!response.ok) {
                throw new Error(
                    `API responded with status: ${response.status}`,
                );
            }

            const data = (await response.json()) as {
                fake_image: string;
                image_id: number;
                real_image: string;
            };

            if (Math.random() < 0.5 && data.real_image) {
                this.questions[index].content = {
                    realImage: data.real_image,
                    fakeImage: data.fake_image,
                    correctAnswer: true,
                };
                this.questions[index].correctAnswer = true;
            } else if (data.fake_image) {
                this.questions[index].content = {
                    realImage: data.real_image,
                    fakeImage: data.fake_image,
                    correctAnswer: false,
                };
                this.questions[index].correctAnswer = false;
            } else {
                console.warn("No valid image data received from API");
                this.addPlaceholderContent(index);
            }
        } catch (error) {
            console.error("Error loading stock photo content:", error);
            // Add placeholder content on error to prevent UI from getting stuck
            this.addPlaceholderContent(index);
        }
    }

    async loadMusicContent(index: number) {
        try {
            // Placeholder implementation
            const musicPieces = [
                { artist: "Artist 1", song: "Song 1", isReal: true },
                { artist: "Artist 2", song: "Song 2", isReal: false },
            ];

            const randomIndex = Math.floor(Math.random() * musicPieces.length);
            const isCorrect = musicPieces[randomIndex].isReal;

            this.questions[index].content = {
                artist: musicPieces[randomIndex].artist,
                song: musicPieces[randomIndex].song,
            };
            this.questions[index].correctAnswer = isCorrect;
        } catch (error) {
            console.error("Error loading music content:", error);
            this.addPlaceholderContent(index);
        }
    }

    async loadNewsContent(index: number) {
        try {
            const response = await client.news.$get();

            if (!response.ok) {
                throw new Error(
                    `API responded with status: ${response.status}`,
                );
            }

            const data = (await response.json()) as {
                isReal: boolean;
                title: string;
                source?: string;
                textContent: string;
                publishedAt: string;
            };

            if (data.isReal) {
                this.questions[index].content = {
                    headline: data.title,
                    source: data.source,
                    text: data.textContent,
                    date: data.publishedAt,
                };

                this.questions[index].correctAnswer = true;
            } else {
                this.questions[index].content = {
                    headline: data.title,
                    text: data.textContent,
                    date: data.publishedAt,
                };

                this.questions[index].correctAnswer = false;
            }
        } catch (error) {
            console.error("Error loading news content:", error);
            this.addPlaceholderContent(index);
        }
    }

    // Add placeholder content to prevent UI from getting stuck
    addPlaceholderContent(index: number) {
        const question = this.questions[index];

        switch (question.type) {
            case QuestionType.Quote:
                question.content = { text: "Placeholder quote text" };
                break;
            case QuestionType.Art:
                question.content = {
                    imageUrl: "https://via.placeholder.com/300",
                };
                break;
            case QuestionType.Music:
                question.content = {
                    artist: "Placeholder Artist",
                    song: "Placeholder Song",
                };
                break;
            case QuestionType.News:
                question.content = {
                    headline: "Placeholder Headline",
                    source: "Placeholder Source",
                };
                break;
            case QuestionType.StockPhoto:
                // For stock photos, we can't easily create placeholder base64 data
                // So we'll use a different approach
                question.content = { imageData: "" };
                break;
            default:
                // Generic placeholder
                question.content = { text: "Placeholder content" };
        }

        // Set a default correctAnswer if not already set
        if (question.correctAnswer === undefined) {
            question.correctAnswer = Math.random() > 0.5;
        }
    }

    async loadStockPhotoContent(index: number) {
        try {
            const response = await client.images.$get();

            if (!response.ok) {
                throw new Error(
                    `API responded with status: ${response.status}`,
                );
            }

            const data = await response.json();

            // Check if the "generated" image is actually AI-generated
            // The API returns isAIGenerated=true when the image is AI-generated, undefined/false when it's a fallback
            // Use type assertion to handle the property that might not be in the type definition
            // biome-ignore lint/suspicious/noExplicitAny: The API response includes properties not in the type definition
            const apiResponse = data as any;
            const isActuallyAIGenerated = apiResponse.isAIGenerated === true;

            if (Math.random() > 0.5 && data.realImageData?.inlineData?.data) {
                // Use the real image
                this.questions[index].content = {
                    imageData: data.realImageData.inlineData.data,
                };
                this.questions[index].correctAnswer = true;
            } else if (data.genImageData?.inlineData?.data) {
                // Use the "generated" image, but set correctAnswer based on whether it's actually AI-generated
                this.questions[index].content = {
                    imageData: data.genImageData.inlineData.data,
                };
                this.questions[index].correctAnswer = !isActuallyAIGenerated; // Only false if truly AI-generated
            } else {
                // If neither real nor generated image data is available, use placeholder
                console.warn("No valid image data received from API");
                this.addPlaceholderContent(index);
            }
        } catch (error) {
            console.error("Error loading stock photo content:", error);
            // Add placeholder content on error to prevent UI from getting stuck
            this.addPlaceholderContent(index);
        }
    }

    getCurrentQuestion(): Question | null {
        if (this.gameState !== GameStatus.InProgress) {
            return null;
        }

        return this.questions[this.currentQuestionIndex];
    }

    submitAnswer(userGuess: boolean) {
        if (this.gameState !== GameStatus.InProgress) {
            throw new Error("Game is not in progress");
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];

        // Make sure we have a valid question with content before proceeding
        if (!currentQuestion || !currentQuestion.content) {
            console.warn(
                "Attempted to answer a question that isn't fully loaded",
            );
            return;
        }

        const correct = userGuess === currentQuestion.correctAnswer;

        if (correct) {
            this.score++;
        }

        this.userAnswers.push({
            questionId: currentQuestion.id,
            userGuess: userGuess,
        });

        this.currentQuestionIndex++;

        // Set loading state while we preload the next batch
        const nextIndex = this.currentQuestionIndex;
        if (
            nextIndex < this.questions.length &&
            !this.questions[nextIndex].content
        ) {
            // Only set loading if the next question's content isn't already loaded
            this.isLoading = true;
        }

        // Preload more content when we advance
        this.preloadContent(this.currentQuestionIndex, 3) // Always keep 3 questions ahead loaded
            .then(() => {
                // Clear loading state when preloading is done
                this.isLoading = false;
            })
            .catch((error) => {
                console.error("Error preloading content:", error);
                this.isLoading = false;
            });

        if (this.currentQuestionIndex === this.questions.length) {
            this.gameState = GameStatus.Ended;
        }

        return;
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
                    this.userAnswers[index].userGuess ===
                        this.questions[index].correctAnswer
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
