<script lang="ts">
import Nav from "$lib/components/Nav.svelte";
import "../app.css";
let { children } = $props();
</script>

<Nav />
<div class="bg-yellow-400 h-screen w-screen">
  {@render children()}
</div>
