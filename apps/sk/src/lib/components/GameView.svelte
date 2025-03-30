<script lang="ts">
import { GameStatus, QuestionType, type GameConfig } from "$lib/game/types";
import GameController from "$lib/game/GameController.svelte";
import QuoteCard from "./cards/QuoteCard.svelte";
import Logo from "./Logo.svelte";
import { Question } from "$lib/game/Question";
import ImageCard from "./cards/ImageCard.svelte";
import AudioCard from "./cards/AudioCard.svelte";

let { config } = $props();

let gc: GameController = $state(new GameController(config));

let answers = $derived.by(() => {
    return gc.questions.map((q, i) => {
        const userAnswer = gc.userAnswers[i];
        return userAnswer === undefined
            ? -1
            : userAnswer.userGuess === gc.questions[i].correctAnswer;
    });
});

let currentQuestion = $derived.by(() => {
    return gc.questions[gc.currentQuestionIndex];
});

let processAnswer = (answer: boolean) => {
    gc.submitAnswer(answer);
};

gc.questions = [
    new Question({
        id: "1",
        type: QuestionType.Quote,
        content: {
            type: "text",
            data: {
                text: "Oh, the shimmering crystals in that cavern? They're perfectly safe to touch, they just give off a mild, warming glow.",
            },
        },
        correctAnswer: true,
    }),
    new Question({
        id: "2",
        type: QuestionType.Quote,
        content: {
            type: "text",
            data: {
                text: "The ancient manuscript clearly states that drinking from the silver chalice will grant immortality to any who possess a pure heart.",
            },
        },
        correctAnswer: false,
    }),
    new Question({
        id: "3",
        type: QuestionType.Quote,
        content: {
            type: "text",
            data: {
                text: "According to our latest atmospheric readings, the aurora phenomenon is simply the result of solar particles interacting with Earth's magnetic field, nothing more.",
            },
        },
        correctAnswer: true,
    }),
    // Add an image question to test the ImageCard component
    new Question({
        id: "4",
        type: QuestionType.Art,
        content: {
            type: "image",
            data: {
                // The actual image data will be fetched by the ImageCard component
                imageUrl: "placeholder"
            },
        },
        correctAnswer: true,
    }),
];
</script>

{#snippet progressDots(answers: (boolean | number)[])}
    <div class="flex gap-2">
        {#each answers as answer }
            {#if answer === -1}
                <div class="h-4 w-4 rounded-full bg-current"></div>
            {:else if answer === true}
                <div class="h-4 w-4 text-emerald-600 rounded-full bg-current"></div>
            {:else if answer === false}
                <div class="h-4 w-4 text-red-600 rounded-full bg-current"></div>
            {/if}
        {/each}
    </div>
{/snippet}


<div class="flex flex-col items-center justify-center gap-6 w-full">
    <div class="flex flex-col items-center">
        <Logo />
        {#if currentQuestion}
            <h2 class="text-xs m-2 px-2 font-semibold flex justify-between w-full">
                <p>QUESTIONS</p>
                <p>{gc.currentQuestionIndex + 1}/{gc.questions.length}</p>
            </h2>
            {#if currentQuestion.type === QuestionType.Quote}
                <QuoteCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {:else if currentQuestion.type === QuestionType.Art}
                <ImageCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {:else if currentQuestion.type === QuestionType.Music}
                <AudioCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {/if}
        {/if}<div class="m-4">
            {@render progressDots(answers)}
        </div>
    </div>
</div>
