<script>
  import { createEventDispatcher } from "svelte";
  import { radicals, kanji, vocab, apiKey } from "../lib/db";
  import Modal from "./Modal.svelte";

  const dispatch = createEventDispatcher();

  let selected = null;
</script>

{#if $radicals && $radicals.length > 0}
  <div class="heading">
    <h3>Radicals</h3>
    <button
      type="button"
      class="button quiz-button"
      on:click={() => dispatch("quiz", { subjects: $radicals })}>Quiz</button
    >
  </div>
  <div class="radicals items">
    {#each $radicals as radical}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="item" on:click={() => (selected = radical)}>
        {#if radical.characters}
          <div class="characters">
            {radical.characters}
          </div>
        {:else}
          {#await radical.image then img}
            <div class="character-image">
              {#if img.html}
                {@html img.html}
              {:else if img.url}
                <img src={img.url} alt={radical.meanings[0].meaning} />
              {/if}
            </div>
          {/await}
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if $kanji && $kanji.length > 0}
  <div class="heading">
    <h3>Kanji</h3>
    <button
      type="button"
      class="button quiz-button"
      on:click={() => dispatch("quiz", { subjects: $kanji })}>Quiz</button
    >
  </div>
  <div class="kanji items">
    {#each $kanji as kj}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="item" on:click={() => (selected = kj)}>
        <div class="characters">
          {kj.characters}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if $vocab && $vocab.length > 0}
  <div class="heading">
    <h3>Vocabulary</h3>
    <button
      type="button"
      class="button quiz-button"
      on:click={() => dispatch("quiz", { subjects: $vocab })}>Quiz</button
    >
  </div>
  <div class="vocab items">
    {#each $vocab as vc}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="item" on:click={() => (selected = vc)}>
        <div class="characters">
          {vc.characters}
        </div>
      </div>
    {/each}
  </div>
{/if}

<Modal on:close={() => (selected = null)} active={selected !== null}>
  <div class="header">
    <div class="selected-item">
      {#if selected.characters}
        <div class="characters">
          {selected.characters}
        </div>
      {:else}
        {#await selected.image then img}
          <div class="character-image">
            {#if img.html}
              {@html img.html}
            {:else if img.url}
              <img src={img.url} alt={selected.meanings[0].meaning} />
            {/if}
          </div>
        {/await}
      {/if}
    </div>
  </div>
  <div class="section">
    <a href={selected.url} target="_blank">View on WaniKani</a>
  </div>
  <div class="section">
    <strong>Meaning: </strong>
    {selected.meanings
      .filter((m) => m.accepted_answer)
      .map((m) => m.meaning)
      .join(", ")}
  </div>
  {#if selected.readings}
    <div class="section">
      <strong>Reading: </strong>
      {selected.readings
        .filter((m) => m.accepted_answer)
        .map((m) => m.reading)
        .join(", ")}
    </div>
  {/if}
</Modal>

{#if $apiKey && (!$radicals || !$kanji || !$vocab)}
  <div class="loader">
    <div class="lds-ring">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
{/if}

<style>
  .heading {
    display: flex;
    align-items: center;
  }

  h3 {
    padding: 1rem 0.5rem;
  }

  .quiz-button {
    padding: 0.25rem 0.4rem;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
  }

  .item {
    height: 4rem;
    min-width: 4rem;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .radicals .item {
    background-color: #00a2ff52;
    border: solid 1px #00a2ffbb;
  }

  .kanji .item {
    background-color: #ff00b352;
    border: solid 1px #ff00b3be;
  }

  .vocab .item {
    background-color: #ae00ff52;
    border: solid 1px #ae00ffa4;
  }

  .radicals .item:hover {
    background-color: #00a2ff7c;
    border: solid 1px #00a2ffc5;
  }

  .kanji .item:hover {
    background-color: #ff00b385;
    border: solid 1px #ff00b3cb;
  }

  .vocab .item:hover {
    background-color: #ae00ff81;
    border: solid 1px #ae00ffb6;
  }

  .header {
    display: flex;
  }

  .selected-item {
    font-size: 2.5rem;
  }

  :global(.character-image svg) {
    width: 2.5rem;
    height: 2.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 3rem;
    pointer-events: none;
  }

  .character-image img {
    width: 2.5rem;
    height: 2.5rem;
    pointer-events: none;
  }

  @media (prefers-color-scheme: dark) {
    .character-image img {
      filter: invert(1);
    }
  }

  .section:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  .loader {
    text-align: center;
    padding: 2rem;
  }
</style>
