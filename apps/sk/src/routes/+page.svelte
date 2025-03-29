<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
</script>

<div class="">
  <section id="hero" class="bg-gray-300">
    <div class="h-[65vh] flex flex-col justify-center bg-gray-300 container gap-6">
      <h1 class="text-7xl font-semibold max-w-[60vw]">
        Can you outsmart 40 billion parameters?
      </h1>
      <p class="max-w-[60vw] mt-4">
        The Large Liar Model is a simple game that challenges you to predict the
        outcome of a game of chance. With 40 billion parameters, it's a daunting
        task, but with the Large Liar Model, you'll have a chance to outsmart
        the model and win the game.
      </p>
      <div class="flex gap-4">
        <Button>Play Now</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  </section>
</div>
