<script>
  import Statistics from "./Statistics.svelte";

  export let label;
  export let image = null;
  export let category;
  export let correct = 0;
  export let incorrect = 0;
  export let remaining = 0;
</script>

<div>
  <Statistics {correct} {incorrect} {remaining} />

  {#if label}
    <div class="characters" class:long={label.length > 3}>
      {label}
    </div>
  {:else}
    {#await image then img}
      <div class="character-image">
        {#if img.html}
          {@html img.html}
        {:else if img.url}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={img.url} />
        {/if}
      </div>
    {/await}
  {/if}

  <div class="category">
    {category}
  </div>
</div>

<style>
  .characters {
    text-align: center;
    font-size: 5rem;
    padding: 0.5rem;
    word-break: break-word;
  }

  .character-image {
    display: flex;
    justify-content: center;
  }

  :global(.character-image svg) {
    width: 5rem;
    height: 5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 3rem;
    pointer-events: none;
  }

  .character-image img {
    width: 5rem;
    height: 5rem;
    pointer-events: none;
  }

  @media (prefers-color-scheme: dark) {
    .character-image img {
      filter: invert(1);
    }
  }

  .category {
    text-align: center;
    font-weight: bold;
    padding: 0 0.5rem 1rem 0.5rem;
  }

  @media (max-height: 560px) {
    .characters {
      font-size: 3rem;
    }

    .character-image img {
      width: 3rem;
      height: 3rem;
    }

    :global(.character-image svg) {
      width: 3rem;
      height: 3rem;
    }

    .characters.long {
      font-size: 2rem;
    }
  }
</style>
