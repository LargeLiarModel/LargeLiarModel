<script lang="ts">
import { onMount } from 'svelte';
import client from '$lib/client';

let { currentQuestion, setAnswer } = $props();
let realImage = $state('');
let genImage = $state('');
let loading = $state(true);
let error = $state<Error | null>(null);

// Randomly decide which image is on the left vs right
let realImageOnLeft = $state(Math.random() > 0.5);

interface ImageData {
  inlineData: {
    data: string;
    mimeType: string;
  }
}

interface ApiResponse {
  realImageData: ImageData;
  genImageData: ImageData; // Changed from string to match the actual structure
  isAIGenerated?: boolean; // Flag indicating if genImageData is truly AI-generated
  error?: string;
}

onMount(async () => {
  try {
    loading = true;
    // Use the client directly with required form parameter
    const response = await client.images.$get({ form: {} as never });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json() as ApiResponse;
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.realImageData?.inlineData?.data && data.genImageData) {
      realImage = `data:${data.realImageData.inlineData.mimeType || 'image/jpeg'};base64,${data.realImageData.inlineData.data}`;
      genImage = `data:${data.genImageData.inlineData.mimeType || 'image/jpeg'};base64,${data.genImageData.inlineData.data}`;
      loading = false;
      
      // Check if the "generated" image is actually AI-generated
      const isActuallyAIGenerated = data.isAIGenerated === true;
      
      // If the "generated" image is not actually AI-generated (it's a fallback real image),
      // update the currentQuestion's correctAnswer property to reflect this
      if (!isActuallyAIGenerated && currentQuestion) {
        console.log("Warning: Using fallback real image instead of AI-generated image");
        // Both images are real in this case, so we need to update the question's correctAnswer
        currentQuestion.correctAnswer = true;
      }
    } else {
      throw new Error('Invalid image data received from API');
    }
  } catch (err) {
    console.error('Error fetching images:', err);
    error = err instanceof Error ? err : new Error(String(err));
    loading = false;
    
    // Fallback to placeholder images if API fails
    realImage = 'https://placehold.co/600x600?text=Real+Image+(Fallback)';
    genImage = 'https://placehold.co/600x600?text=Generated+Image+(Fallback)';
  }
});

function handleImageClick(isRealImage: boolean): void {
  // The correct answer is when the user clicks on the real image
  setAnswer(isRealImage);
}
</script>

<div class="bg-white flex flex-col justify-center items-center p-10 rounded">
  <h1 class="text-4xl font-bold mb-2">Which image is real?</h1>
  <p class="text-xl">Click on the authentic picture below.</p>
  
  {#if loading}
    <div class="flex justify-center items-center h-80 w-full">
      <p class="text-xl">Loading images...</p>
    </div>
  {:else if error}
    <div class="flex justify-center items-center h-80 w-full">
      <p class="text-xl text-red-500">Error loading images. Using fallbacks.</p>
    </div>
  {/if}
  
  <div class="flex flex-row justify-center space-x-8 m-2 w-full h-100">
    <div class="flex flex-col items-center">
      <button 
        onclick={() => handleImageClick(realImageOnLeft)} 
        class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400"
        disabled={loading}
      >
        <img 
          src={realImageOnLeft ? realImage : genImage} 
          alt="Option A" 
          class="w-full h-full object-cover" 
        />
      </button>
    </div>
    
    <div class="flex flex-col items-center">
      <button 
        onclick={() => handleImageClick(!realImageOnLeft)} 
        class="w-80 h-80 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400"
        disabled={loading}
      >
        <img 
          src={!realImageOnLeft ? realImage : genImage} 
          alt="Option B" 
          class="w-full h-full object-cover" 
        />
      </button>
    </div>
  </div>
</div>
