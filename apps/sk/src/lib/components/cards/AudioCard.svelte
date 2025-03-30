<script lang="ts">
import Button from "../ui/button/button.svelte";

let { currentQuestion, setAnswer } = $props();
</script>

<div class="bg-white flex flex-col justify-center p-10 h-full rounded-lg mb-4">
  <h1 class="text-4xl font-bold mb-2">Is this a real track?</h1>
  <p class="text-xl">Click on the authentic picture below.</p>

  <audio class="m-3" controls>
    <source src="/sample_audio.mp3" type="mp3">
  </audio>  
</div>

  <div class="flex flex-row justify-center gap-4 w-full">
  <Button onclick={() => setAnswer(true)} class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16">
    REAL
  </Button>

  <Button onclick={() => setAnswer(false)} class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16">
    AI-GENERATED
  </Button>
</div>