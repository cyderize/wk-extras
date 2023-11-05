<script>
  import { createEventDispatcher } from "svelte";

  import { fade, fly } from "svelte/transition";

  const dispatch = createEventDispatcher();

  export let active = false;
</script>

{#if active}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="modal"
    on:click={(e) => {
      if (e.target === e.currentTarget) {
        dispatch("close");
      }
    }}
    transition:fade={{ duration: 100 }}
  >
    <div class="spacer" />
    <div class="middle">
      <div class="window" transition:fly={{ y: -100, duration: 200 }}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="exit" on:click={() => dispatch("close")}>×</div>
        <div class="content">
          <slot />
        </div>
      </div>
    </div>
    <div class="spacer" />
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background-color: #000000aa;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .modal .middle {
    padding: 1rem;
  }

  .modal .spacer {
    flex: 0 1 1rem;
  }

  .modal .middle,
  .modal .spacer {
    pointer-events: none;
  }

  .modal .window {
    max-width: 960px;
    min-height: 100px;
    margin: 0 auto;
    background-color: var(--background-color);
    box-shadow: -1rem -1rem 2rem #00000042, 1rem -1rem 2rem #00000042,
      -1rem 1rem 2rem #00000042, 1rem 1rem 2rem #00000042;
    position: relative;
    pointer-events: auto;
  }

  .modal .content {
    padding: 1rem;
  }

  :global(.modal .selected-item .character-image svg) {
    width: 2.5rem;
    height: 2.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 3rem;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .modal .spacer {
      flex: 1 1 auto;
      pointer-events: none;
    }
  }
</style>
