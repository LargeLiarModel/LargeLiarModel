<script lang="ts">
import GameConfigCard from "./GameConfigCard.svelte";
import GameView from "./GameView.svelte";
import RobotLogo from "./Logo.svelte";

import type { GameConfig } from "$lib/game/types";

let config: GameConfig | null = $state(null);
</script>
 
<div>
    {#if !config}
        <GameConfigCard setConfig={(e: GameConfig) => config = e} />
    {:else}
        <GameView config={config} />
    {/if}
</div>