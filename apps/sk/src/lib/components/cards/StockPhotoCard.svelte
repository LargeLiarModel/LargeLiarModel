<script lang="ts">
import Button from "../ui/button/button.svelte";

let { i, questionContent, setAnswer } = $props();
</script>

<div class="bg-white flex flex-col justify-center items-center p-10 rounded">
  {#if questionContent[i]}
  <h1 class="text-4xl font-bold mb-2">Is this image real?</h1>
  <div class="flex flex-col justify-center space-x-8 m-2 w-full h-100">    
    <div class="flex flex-col items-center">
      <button onclick={() => setAnswer(false)} class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400">
        <img src="data:image/png;base64,{questionContent[i].imageData}" alt="Option B" class="w-full h-full object-cover" />
      </button>
    </div>
    <div class="flex flex-row justify-center gap-4 w-full">
  <Button onclick={() => setAnswer(true)} class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16">
    REAL
  </Button>

  <Button onclick={() => setAnswer(false)} class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16">
    AI-GENERATED
  </Button>
</div>
  </div>
  {:else}
  <h2>Loading...</h2>
  {/if}
</div>