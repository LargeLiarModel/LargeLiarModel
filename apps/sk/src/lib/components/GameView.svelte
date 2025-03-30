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
import GameEndScreen from "./GameEndScreen.svelte";
import client from "$lib/client";
import { Content } from "./ui/sheet";
    import NewsCard from "./cards/NewsCard.svelte";

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

let restartGame = () => {
    gc.reset();
    // Reinitialize the game controller with the same config
    gc = new GameController(config);
};

// Get game results when the game is over
let gameResults = $derived.by(() => {
    return gc.gameState === GameStatus.Ended ? gc.getGameResults() : null;
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
    {#if gameResults}
        <!-- Game End Screen -->
        <GameEndScreen 
            gameResults={gameResults} 
            questions={gc.questions} 
            onRestart={restartGame} 
        />
    {:else}
        <div class="flex flex-col items-center">
            <Logo />
            {#if gc.isLoading}
                <div class="p-10">
                    <h2 class="text-xl">Loading game content...</h2>
                </div>
            {:else if currentQuestion}
                <h2 class="text-xs m-2 px-2 font-semibold flex justify-between w-full">
                    <p>QUESTIONS</p>
                    <p>{gc.currentQuestionIndex + 1}/{gc.questions.length}</p>
                </h2>
                {#if currentQuestion.type === QuestionType.Quote && currentQuestion.content}
                    <QuoteCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
                {:else if currentQuestion.type === QuestionType.Art && currentQuestion.content}
                    <ArtCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
                {:else if currentQuestion.type === QuestionType.Music && currentQuestion.content}
                    <AudioCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
                {:else if currentQuestion.type === QuestionType.StockPhoto && currentQuestion.content}
                    <StockPhotoCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
                {:else if currentQuestion.type === QuestionType.News && currentQuestion.content}
                    <NewsCard currentQuestion={currentQuestion} setAnswer={(e: boolean) => processAnswer(e)} />
                {/if}
            {:else}
                <h2>Loading...</h2>
            {/if}
            <div class="m-4">
                {@render progressDots(answers)}
            </div>
        </div>
    {/if}
</div>
