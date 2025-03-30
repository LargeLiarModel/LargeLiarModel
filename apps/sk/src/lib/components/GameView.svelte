<script lang="ts">
import {
    GameStatus,
    QuestionType,
    type ArtContent,
    type GameConfig,
    type MusicContent,
    type NewsContent,
    type QuoteContent,
    type StockPhotoContent,
} from "$lib/game/types";
import GameController from "$lib/game/GameController.svelte";
import QuoteCard from "./cards/QuoteCard.svelte";
import Logo from "./Logo.svelte";
import { Question } from "$lib/game/Question.svelte";
import ImageCard from "./cards/ArtCard.svelte";
import AudioCard from "./cards/AudioCard.svelte";
import ArtCard from "./cards/ArtCard.svelte";
import StockPhotoCard from "./cards/StockPhotoCard.svelte";
import client from "$lib/client";
import { Content } from "./ui/sheet";

let { config } = $props();

let gc: GameController = $state(new GameController(config));
let questionContent: (
    | StockPhotoContent
    | ArtContent
    | QuoteContent
    | MusicContent
    | NewsContent
)[] = $state([]);

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

let preloadNextQuestion = async () => {
    if (gc.currentQuestionIndex + 1 < gc.questions.length) {
        let idx = gc.currentQuestionIndex + 1;
        if (gc.questions[idx].type === QuestionType.StockPhoto) {
            const response = await client.images.$get();
            console.log("API response:", response);

            if (!response.ok) {
                throw new Error(
                    `API responded with status: ${response.status}`,
                );
            }

            let data = await response.json();
            if (Math.random() > 0.5) {
                questionContent.push({
                    imageData: data.realImageData.inlineData.data,
                });
                gc.questions[idx].correctAnswer = true;
            } else {
                if (data.genImageData)
                    questionContent.push({
                        imageData: data.genImageData.inlineData.data,
                    });
                gc.questions[idx].correctAnswer = false;
            }
            console.log(gc.questions[idx]);
        }
    }
};

$effect(() => {
    preloadNextQuestion();
});
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
        {#if currentQuestion }
            <h2 class="text-xs m-2 px-2 font-semibold flex justify-between w-full">
                <p>QUESTIONS</p>
                <p>{gc.currentQuestionIndex + 1}/{gc.questions.length}</p>
            </h2>
            {#if currentQuestion.type === QuestionType.Quote}
                <QuoteCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {:else if currentQuestion.type === QuestionType.Art}
                <ArtCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {:else if currentQuestion.type === QuestionType.Music}
                <AudioCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
            {:else if currentQuestion.type == QuestionType.StockPhoto}
                <StockPhotoCard i={gc.currentQuestionIndex} questionContent={questionContent} setAnswer={(e: boolean) => processAnswer(e)} />
            {/if}
        {:else}
            <h2>Loading...</h2>
        {/if}
        <div class="m-4">
            {@render progressDots(answers)}
        </div>
    </div>
</div>
