<script lang="ts">
import { GameStatus, QuestionType, type GameConfig } from "$lib/game/types";
import type { Question } from "$lib/game/Question.svelte";
import Button from "../ui/button/button.svelte";

let { currentQuestion, setAnswer } = $props();
</script>

<div class="bg-white flex flex-col justify-center p-10 h-full rounded-lg mb-4">
    <p class="text-2xl relative">
      <span class="absolute opacity-20 top-5 -left-5 text-[10rem]">&#8220;</span>
      {currentQuestion.content.data.text}
    </p>
  </div>
  <div class="flex flex-row justify-center gap-4 w-full">
  <Button onclick={() => setAnswer(true)} class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16">
    REAL
  </Button>

  <Button onclick={() => setAnswer(false)} class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16">
    AI-GENERATED
  </Button>
</div>