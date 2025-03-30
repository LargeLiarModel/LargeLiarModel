<script lang="ts">
import client from "$lib/client";
import Button from "$lib/components/ui/button/button.svelte";
import { MoveRight } from "@lucide/svelte";
</script>

  <section id="hero" class="">
    <div
      class="h-[100vh] flex flex-col justify-center container gap-6 pt-32"
    >
      <h1 class="text-3xl md:text-7xl font-semibold max-w-[60vw]">
        Can you outsmart 40 billion parameters?
      </h1>
      <p class="text-l md:text-3xl font-light leading-snug">
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
