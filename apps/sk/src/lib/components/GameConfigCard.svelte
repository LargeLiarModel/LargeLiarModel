<script>
import { createGameConfig, QuestionType } from "$lib/game/types";
import Button from "./ui/button/button.svelte";

let { setConfig } = $props();

let config = createGameConfig(5, [
    QuestionType.Quote,
    QuestionType.Quote,
    QuestionType.Quote,
    QuestionType.Quote,
    QuestionType.Quote,
]);
</script>
<div class="flex flex-col items-center justify-center gap-6">
    <h1 class="text-3xl font-bold">Let's get started!</h1>
    <Button onclick={() => setConfig(config)} >Start</Button>
</div>