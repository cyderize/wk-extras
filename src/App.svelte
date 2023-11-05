<script>
  import { fly } from "svelte/transition";
  import Config from "./components/Config.svelte";
  import Quiz from "./components/Quiz.svelte";
  import Tiles from "./components/Tiles.svelte";

  let quiz = null;
</script>

<main>
  {#if quiz}
    <div in:fly={{ duration: 200, y: -200 }}>
      <Quiz items={quiz} on:exit={() => (quiz = null)} />
    </div>
  {:else}
    <Config />
    <Tiles on:quiz={(e) => (quiz = e.detail.subjects)} />
  {/if}
</main>
