<script lang="ts">
  import Button from "../ui/button/button.svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";
  import type { Question } from "$lib/game/Question.svelte";

  let { currentQuestion, setAnswer } = $props();

  // Check if the image data is valid
  let hasValidImageData = $derived(
    currentQuestion?.content?.imageData &&
      currentQuestion.content.imageData.length > 0,
  );
</script>

<div class="bg-white flex flex-col justify-center items-center p-10 rounded">
  {#if currentQuestion?.content && hasValidImageData}
    <h1 class="text-4xl font-bold mb-2">Is this image real?</h1>
    <div class="flex flex-col justify-center m-2 w-fit h-100">
      <img
        src="data:image/png;base64,{currentQuestion.content.imageData}"
        alt="Stock photo"
        class="w-96 h-80 object-cover mb-4 rounded-md"
      />
      <div class="flex flex-row gap-4">
        <Button
          onclick={() => setAnswer(true)}
          class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16"
        >
          REAL
        </Button>

        <Button
          onclick={() => setAnswer(false)}
          class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16"
        >
          AI-GENERATED
        </Button>
      </div>
    </div>
  {:else}
    <LoadingSpinner />
  {/if}
</div>
