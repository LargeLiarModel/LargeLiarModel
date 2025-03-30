<script lang="ts">
let { currentQuestion, setAnswer } = $props();
</script>

<div class="bg-white flex flex-col justify-center items-center p-10 rounded">
  <h1 class="text-4xl font-bold mb-2">Which image is real?</h1>
  <p class="text-xl">Click on the authentic picture below.</p>
  <div class="flex flex-row justify-center space-x-8 m-2 w-full h-100">
    <div class="flex flex-col items-center">
      <button onclick={() => setAnswer(true)} class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400">
        <img src="https://placehold.co/600" alt="Option A" class="w-full h-full object-cover" />
      </button>
    </div>
    
    <div class="flex flex-col items-center">
      <button onclick={() => setAnswer(false)} class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400">
        <img src="https://placehold.co/600" alt="Option B" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</div>