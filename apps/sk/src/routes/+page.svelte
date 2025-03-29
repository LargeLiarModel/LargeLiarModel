<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { MoveRight } from "@lucide/svelte";
</script>

<div class="">
  <section id="hero" class="bg-yellow-400">
    <div class="h-screen flex flex-col justify-center container gap-8 pt-14">
      <h1 class="text-9xl font-extrabold -m-1">
        Can you outsmart 40 billion parameters?
      </h1>
      <p class="text-3xl font-light leading-snug">
        The Large Liar Model is a simple game that challenges you to predict the
        outcome of a game of chance. With 40 billion parameters, it's a daunting
        task, but with the Large Liar Model, you'll have a chance to outsmart
        the model and win the game.
      </p>
      <div class="flex gap-4">
        <button
          class="px-6 py-4 text-2xl flex items-center gap-2 ring-offset-background focus-visible:ring-ring justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-secondary/30 hover:bg-secondary/40 group"
        >
          Play Now
          <MoveRight class="group-hover:translate-x-1 transform ease-in-out" size={40} absoluteStrokeWidth />
        </button>
      </div>
      <div class="pb-20"></div>
    </div>
  </section>
</div>
