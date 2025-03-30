<script lang="ts">
  import Button from "./ui/button/button.svelte";
  import type { Question } from "$lib/game/Question.svelte";
  import { QuestionType } from "$lib/game/types";
  import type { ArtContent, StockPhotoContent } from "$lib/game/types";

  let { gameResults, questions, onRestart } = $props();

  // Filter questions to get only those with images (StockPhoto and Art types)
  let imageQuestions = $derived(
    questions.filter(
      (q: Question) =>
        (q.type === QuestionType.StockPhoto || q.type === QuestionType.Art) &&
        q.content,
    ),
  );

  // Separate real and AI-generated images
  let realImages = $derived(
    imageQuestions.filter((q: Question) => q.correctAnswer === true),
  );

  let aiImages = $derived(
    imageQuestions.filter((q: Question) => q.correctAnswer === false),
  );

  // Helper function to get image source from question
  function getImageSrc(question: Question): string {
    if (question.type === QuestionType.StockPhoto && question.content) {
      const content = question.content as StockPhotoContent;
      if (content.imageData) {
        return `data:image/png;base64,${content.imageData}`;
      }
    }

    if (question.type === QuestionType.Art && question.content) {
      const content = question.content as ArtContent;
      if (content.imageUrl) {
        return content.imageUrl;
      }
    }

    return "";
  }

  // Helper function to determine if the user answered correctly for a specific question
  function wasAnsweredCorrectly(question: Question): boolean | null {
    if (!gameResults || !gameResults.answers) return null;

    const userAnswer = gameResults.answers.find(
      (a: { questionId: string; userGuess: boolean }) =>
        a.questionId === question.id,
    );
    if (!userAnswer) return null;

    return userAnswer.userGuess === question.correctAnswer;
  }

  // Helper function to get the appropriate CSS class based on the answer correctness
  function getOutlineClass(question: Question): string {
    const result = wasAnsweredCorrectly(question);

    if (result === true) return "ring-4 ring-green-500"; // Correct answer
    if (result === false) return "ring-4 ring-red-500"; // Incorrect answer
    return ""; // No outline if we don't have answer data
  }
</script>

<div
  class="bg-white flex flex-col items-center p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
>
  <h1 class="text-4xl font-bold mb-6">Game Over</h1>

  <div class="text-center mb-8">
    <h2 class="text-3xl font-semibold">
      Your Score: {gameResults.score}/{gameResults.totalQuestions}
    </h2>
    <p class="text-xl mt-2">{gameResults.percentage}% Correct</p>
  </div>

  <div class="">
    <h3 class="text-2xl font-semibold mb-4 w-full text-center">Real Images</h3>
    <div class="flex gap-4 justify-center">
      {#each realImages as question}
        <div
          class={`w-32 aspect-square bg-gray-100 rounded-lg overflow-hidden ${getOutlineClass(question)}`}
        >
          <img
            src={getImageSrc(question)}
            alt="Real image"
            class="w-full h-full object-cover"
          />
        </div>
      {/each}
      {#if realImages.length === 0}
        <p class="text-gray-500 italic">No real images in this game</p>
      {/if}
    </div>
  </div>

  <div class="mt-10">
    <h3 class="text-2xl font-semibold mb-4 w-full text-center">
      AI-Generated Images
    </h3>
    <div class="flex gap-4 justify-center">
      {#each aiImages as question}
        <div
          class={`w-32 aspect-square bg-gray-100 rounded-lg overflow-hidden ${getOutlineClass(question)}`}
        >
          <img
            src={getImageSrc(question)}
            alt="AI-generated image"
            class="w-full h-full object-cover"
          />
        </div>
      {/each}
      {#if aiImages.length === 0}
        <p class="text-gray-500 italic">No AI-generated images in this game</p>
      {/if}
    </div>
  </div>
</div>
<Button onclick={onRestart} class="text-xl font-bold w-full py-8">
  Play Again
</Button>
