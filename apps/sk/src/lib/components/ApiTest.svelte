<script lang="ts">
  import { onMount } from 'svelte';
  import client, { checkApiConnection } from '$lib/client';
  import type { Client } from '@largeliarmodel/hono-api/dist/client';
  
  let connectionStatus = 'Checking...';
  let apiData: Record<string, unknown> | null = null;
  let error: unknown = null;
  
  onMount(async () => {
    try {
      const result = await checkApiConnection();
      if (result.success) {
        connectionStatus = 'Connected';
        if (result.data instanceof Response) {
          apiData = await result.data.json();
        } else if (result.data) {
          apiData = result.data as Record<string, unknown>;
        } else {
          apiData = { message: "No data returned" };
        }
      } else {
        connectionStatus = 'Failed to connect';
        error = result.error;
      }
    } catch (err) {
      connectionStatus = 'Error';
      error = err;
    }
  });
  
  async function fetchQuotes() {
    try {
      connectionStatus = 'Fetching quotes...';
      // Use the RPC client directly
      const response = await client.twin.quotes.$get();
      const data = await response.json();
      connectionStatus = 'Quotes fetched';
      apiData = data;
      error = null;
    } catch (err) {
      connectionStatus = 'Error fetching quotes';
      error = err;
      console.error(err);
    }
  }
</script>

<div class="api-test">
  <h2>API Connection Test</h2>
  <p>Status: {connectionStatus}</p>
  
  {#if error}
    <div class="error">
      <h3>Error:</h3>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  {/if}
  
  {#if apiData}
    <div class="data">
      <h3>API Response:</h3>
      <pre>{JSON.stringify(apiData, null, 2)}</pre>
    </div>
  {/if}
  
  <button on:click={fetchQuotes}>Fetch Quotes</button>
</div>

<style>
  .api-test {
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }
  
  .error {
    background-color: #ffeeee;
    padding: 1rem;
    border-radius: 0.25rem;
    margin: 1rem 0;
  }
  
  .data {
    background-color: #eeffee;
    padding: 1rem;
    border-radius: 0.25rem;
    margin: 1rem 0;
  }
  
  pre {
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
  }
  
  button {
    background-color: #4a5568;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #2d3748;
  }
</style>
