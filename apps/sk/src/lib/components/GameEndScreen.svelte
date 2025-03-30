<script lang="ts">
  import Button from "./ui/button/button.svelte";
  import type { Question } from "$lib/game/Question.svelte";
  import { QuestionType } from "$lib/game/types";
  import type { ArtContent, StockPhotoContent } from "$lib/game/types";

  let { gameResults, questions, onRestart } = $props();

  // Filter questions to get only those with images (StockPhoto and Art types)

  // Helper function to get the appropriate CSS class based on the answer correctness
</script>

<div
  class="bg-white flex flex-col items-center p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
>
  <h1 class="text-3xl md:text-4xl font-bold mb-6">Game Over</h1>

  <div class="text-center mb-8">
    <h2 class="text-xl md:text-3xl font-semibold">
      Your Score: {gameResults.score}/{gameResults.totalQuestions}
    </h2>
    <p class="text-xl mt-2">{gameResults.percentage}% Correct</p>
  </div>
</div>
<Button onclick={onRestart} class="text-xl font-bold w-full py-8">
  Play Again
</Button>
