<script lang="ts">
  import client from "$lib/client";
  import Button from "$lib/components/ui/button/button.svelte";
  import { MoveRight } from "@lucide/svelte";
  import { onMount } from "svelte";

  // Define types for the API response
  interface ImageData {
    inlineData: {
      data: string | undefined;
      mimeType: string | undefined;
    }
  }

  interface ApiResponse {
    realImageData: ImageData;
    genImageData: ImageData;
    isAIGenerated?: boolean;
    error?: string;
  }

  let loading = true;
  let error: Error | null = null;
  let data: ApiResponse | null = null;

  onMount(async () => {
    try {
      loading = true;
      const response = await client.images.$get();
      console.log('API response:', response);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      data = await response.json();
      loading = false;
    } catch (err) {
      console.error('Error fetching images:', err);
      error = err instanceof Error ? err : new Error(String(err));
      loading = false;
    }
  });

  // Create a reactive object that mimics the structure expected by the template
  $: imageData = {
    loading,
    error,
    data
  };
</script>

<div>
  <!-- Test endpoint response -->
  <section id="api-test" class="container my-12">
    <h2 class="text-3xl font-semibold mb-6">API Connection Test</h2>
    
  </section>

  <!-- Images response -->
  {#if imageData.loading}
    <p>Loading images...</p>
  {:else if imageData.error}
    <div class="my-8">
      <p class="text-red-500 mb-4">Error loading images: {imageData.error.message}</p>
      <p class="mb-4">The API is currently experiencing issues with image generation. This is likely due to a problem with the Gemini API.</p>
      <p>Please try again later or check the API server logs for more information.</p>
    </div>
  {:else if imageData.data}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="border p-4 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-2">Generated Image</h3>
        {#if imageData.data.error}
          <p class="text-red-500">Error: {imageData.data.error}</p>
          <img 
            src="https://placehold.co/600x400?text=Generated+Image+(Fallback)" 
            alt="AI Generated Image (Fallback)" 
            class="w-full h-auto rounded-md mt-4"
          />
        {:else}
          <img 
            src={`data:${imageData.data.genImageData?.inlineData?.mimeType || 'image/jpeg'};base64,${imageData.data.genImageData?.inlineData?.data}`} 
            alt="AI Generated Image" 
            class="w-full h-auto rounded-md"
            on:error={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400?text=Generated+Image+(Error)'; }}
          />
        {/if}
      </div>
      
      <div class="border p-4 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-2">Original Artwork</h3>
        {#if imageData.data.error}
          <p class="text-red-500">Error: {imageData.data.error}</p>
          <img 
            src="https://placehold.co/600x400?text=Original+Artwork+(Fallback)" 
            alt="Original Artwork (Fallback)" 
            class="w-full h-auto rounded-md mt-4"
          />
        {:else}
          <img 
            src={`data:${imageData.data.realImageData?.inlineData?.mimeType || 'image/jpeg'};base64,${imageData.data.realImageData?.inlineData?.data}`} 
            alt="Original Artwork" 
            class="w-full h-auto rounded-md"
            on:error={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400?text=Original+Artwork+(Error)'; }}
          />
        {/if}
      </div>
    </div>
  {/if}
  <section id="hero" class="bg-gray-300">
    <div
      class="h-[65vh] flex flex-col justify-center bg-gray-300 container gap-6"
    >
      <h1 class="text-7xl font-semibold max-w-[60vw]">
        Can you outsmart 40 billion parameters?
      </h1>
      <p class="text-3xl font-light leading-snug">
        The Large Liar Model is a simple game that challenges you to predict the
        outcome of a game of chance. With 40 billion parameters, it's a daunting
        task, but with the Large Liar Model, you'll have a chance to outsmart
        the model and win the game.
      </p>
      <div class="flex gap-4">
        <a href="/game">
          <button
            class="transition-all hover:bg-black/80 justify-between w-52 scale-100 duration-300 ease-in-out px-6 py-4 text-2xl flex items-center gap-2 ring-offset-background focus-visible:ring-ring whitespace-nowrap rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-black group text-yellow-400"
          >
            Play Now
            <MoveRight size={40} absoluteStrokeWidth />
          </button>
        </a>
      </div>
      <div class="pb-20"></div>
    </div>
  </section>

</div>
