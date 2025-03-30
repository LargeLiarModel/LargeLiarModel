<script>
import { Question } from "$lib/game/Question.svelte";
import { createGameConfig, QuestionType } from "$lib/game/types";
import Button from "./ui/button/button.svelte";

let { setConfig } = $props();

let config = createGameConfig(12, [
    QuestionType.StockPhoto,
    QuestionType.StockPhoto,
    QuestionType.StockPhoto,
    QuestionType.News,
    QuestionType.News,
    QuestionType.News,
    QuestionType.Art,
    QuestionType.Art,
    QuestionType.Art,
]);
</script>
<div class="flex flex-col items-center justify-center gap-6">
    <h1 class="text-3xl font-bold">Let's get started!</h1>
    <Button onclick={() => setConfig(config)} >Start</Button>
</div>