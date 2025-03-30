<script lang="ts">
import Button from "../ui/button/button.svelte";
import LoadingSpinner from "../ui/LoadingSpinner.svelte";
import type { Question } from "$lib/game/Question.svelte";
import { ArrowRight } from "@lucide/svelte";
import { handle } from "hono/cloudflare-pages";

import { onMount } from "svelte";

let isSmallScreen = false;

onMount(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
        // Set initial value
        isSmallScreen = window.innerWidth < 768; // adjust breakpoint as needed

        // Add resize listener
        const handleResize = () => {
            isSmallScreen = window.innerWidth < 768;
        };

        window.addEventListener("resize", handleResize);

        // Clean up listener on component destroy
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }
});

let { currentQuestion, setAnswer } = $props();

let answered = $state(false);

let guess = false;

let handleAnswer = (answer: boolean) => {
    guess = answer;
    answered = true;
    if (isSmallScreen) {
        handleGuess(guess);
    }
};

let handleGuess = (guess: boolean) => {
    setAnswer(guess);
    answered = false;
};
</script>

<div class="bg-white flex flex-col justify-center items-center p-10 rounded">
  {#if currentQuestion?.content}
    <h1 class="text-xl md:text-4xl font-bold mb-2">Is this real art?</h1>
    <div class="flex flex-col m-2 w-full h-100">    
      <div class="flex flex-row justify-center w-full">
        <div class="flex flex-col {answered ? "m-4" : ""} items-center">
          {#if answered}
          <h1 class="text-3xl font-semibold">Real Art</h1>
          {/if}
          {#if (!answered && !currentQuestion.content.correctAnswer) || answered }
          <button class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400">
            <img src="data:image/png;base64,{currentQuestion.content.realImage}" alt="Stock photo" class="w-full h-full object-cover" />
          </button>
          {/if}
          </div>
          <div class="flex flex-col {answered ? "m-4" : ""} items-center">
          {#if answered}
          <h1 class="text-3xl font-semibold">AI-Generated</h1>
          {/if}
          {#if (!answered && currentQuestion.content.correctAnswer) || answered}
          <button class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400">
            <img src="data:image/png;base64,{currentQuestion.content.fakeImage}" alt="Stock photo" class="w-full h-full object-cover" />
          </button>
          {/if}
        </div>
      </div>
      {#if answered}
      <Button class="m-5" onclick={() => handleGuess(guess)}>Next Question <ArrowRight /></Button>
      {:else}


      <div class="flex flex-row justify-center gap-4 mt-4 w-full">
        <Button onclick={() => handleAnswer(true)} class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16">
          REAL
        </Button>

        <Button onclick={() => handleAnswer(false)} class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16">
          AI-GENERATED
        </Button>
      </div>
      {/if}
    </div>
  {:else}
  <LoadingSpinner />
  {/if}
</div>
