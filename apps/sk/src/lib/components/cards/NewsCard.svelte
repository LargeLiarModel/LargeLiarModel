<script lang="ts">
import Button from "../ui/button/button.svelte";
import LoadingSpinner from "../ui/LoadingSpinner.svelte";

function formatDate(dateString: string) {
    const date = new Date(dateString);

    // Get day of month
    const day = date.getDate();

    // Add appropriate suffix to day
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) {
        suffix = "st";
    } else if (day === 2 || day === 22) {
        suffix = "nd";
    } else if (day === 3 || day === 23) {
        suffix = "rd";
    }

    // Format the date using month names
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `Published on ${month} ${day}${suffix}, ${year}`;
}

let { currentQuestion, setAnswer } = $props();
</script>

<div class="bg-white flex flex-col justify-center p-10 h-full rounded-lg mb-4">
  {#if currentQuestion.content} 
    <h1 class="font-serif text-xl md:text-4xl">{currentQuestion.content.headline}</h1>
    <i class="text-xs mb-4">{formatDate(currentQuestion.content.date)}</i>
    <p class="line-clamp-5 md:line-clamp-5">{currentQuestion.content.text}</p>
    {:else}
  <LoadingSpinner />
  {/if}
  </div>
  <div class="flex flex-row justify-center gap-4 w-full">
  <Button onclick={() => setAnswer(true)} class="bg-gray-800 hover:bg-green-500 text-white text-xl font-bold w-full h-16">
    REAL
  </Button>

  <Button onclick={() => setAnswer(false)} class="bg-gray-800 hover:bg-red-500 text-white text-xl font-bold w-full h-16">
    AI-GENERATED
  </Button>
</div>