<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import "../app.css";
  let { children } = $props();
</script>

<div class="bg-yellow-400">
  <Nav />
  {@render children()}
</div>
