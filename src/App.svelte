<script>
  import { subjects, assignments, apiKey, period } from "./lib/db";
  import { fade, fly } from "svelte/transition";

  let apiKeyInput = $apiKey;
  let periodInput = $period;
  let selected = null;

  $: asgs = ($assignments || [])
    .map((asg) => ({
      timestamp: new Date(asg.available_at).valueOf(),
      subject: $subjects[asg.subject_id] || {},
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  $: radicals = asgs
    .filter((asg) => asg.subject.object === "radical")
    .map((r) => {
      if (r.subject.data.characters === null) {
        return {
          ...r,
          image: (async () => {
            const img = r.subject.data.character_images.find(
              (img) =>
                img.content_type === "image/svg+xml" &&
                img.metadata.inline_styles === false
            );
            if (!img) {
              return "";
            }
            const response = await fetch(img.url);
            return await response.text();
          })(),
        };
      }
      return { ...r };
    });
  $: kanji = asgs.filter((asg) => asg.subject.object === "kanji");
  $: vocab = asgs.filter(
    (asg) =>
      asg.subject.object === "vocabulary" ||
      asg.subject.object === "kana_vocabulary"
  );

  function updateConfig() {
    if ($apiKey !== apiKeyInput) {
      $apiKey = apiKeyInput;
    }
    if ($period !== periodInput) {
      $period = periodInput;
    }
  }
</script>

<main>
  <details
    class="config-box"
    on:toggle={() => updateConfig()}
    open={!$apiKey}
  >
    <summary>Configuration</summary>
    <div class="config">
      <label class="field">
        <div>WaniKani API key (v2):</div>
        <input class="input" type="text" bind:value={apiKeyInput} />
      </label>
      <label class="field">
        <div>Show reviews available in this many days:</div>
        <input
          class="input"
          type="number"
          bind:value={periodInput}
          min="1"
          max="14"
        />
      </label>
      <div class="field">
        <button on:click={updateConfig}>Save</button>
      </div>
    </div>
  </details>

  {#if radicals.length > 0}
    <h3>Radicals</h3>
    <div class="radicals items">
      {#each radicals as radical}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="item" on:click={() => (selected = radical)}>
          {#if radical.subject.data.characters}
            <div class="characters">
              {radical.subject.data.characters}
            </div>
          {:else}
            {#await radical.image then svg}
              <div class="character-image">
                {@html svg}
              </div>
            {/await}
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if kanji.length > 0}
    <h3>Kanji</h3>
    <div class="kanji items">
      {#each kanji as kj}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="item" on:click={() => (selected = kj)}>
          <div class="characters">
            {kj.subject.data.characters}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if vocab.length > 0}
    <h3>Vocabulary</h3>
    <div class="vocab items">
      {#each vocab as vc}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="item" on:click={() => (selected = vc)}>
          <div class="characters">
            {vc.subject.data.characters}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

{#if selected}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="modal"
    on:click={(e) => {
      if (e.target === e.currentTarget) selected = null;
    }}
    transition:fade={{ duration: 100 }}
  >
    <div class="spacer" />
    <div class="middle">
      <div class="window" transition:fly={{ y: -100, duration: 200 }}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="exit" on:click={() => (selected = null)}>×</div>
        <div class="content">
          <div class="header">
            <div class="selected-item">
              {#if selected.subject.data.characters}
                <div class="characters">
                  {selected.subject.data.characters}
                </div>
              {:else}
                {#await selected.image then svg}
                  <div class="character-image">
                    {@html svg}
                  </div>
                {/await}
              {/if}
            </div>
          </div>
          <div class="section">
            <a href={selected.subject.data.document_url} target="_blank">View on WaniKani</a>
          </div>
          <div class="section">
            <strong>Meaning: </strong>
            {selected.subject.data.meanings
              .filter((m) => m.accepted_answer)
              .map((m) => m.meaning)
              .join(", ")}
          </div>
          {#if selected.subject.data.readings}
            <div class="section">
              <strong>Reading: </strong>
              {selected.subject.data.readings
                .filter((m) => m.accepted_answer)
                .map((m) => m.reading)
                .join(", ")}
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class="spacer" />
  </div>
{/if}

<style>
  .config-box {
    border: solid 1px #ccc;
    border-radius: 1rem;
  }

  .config-box summary {
    padding: 1rem;
    cursor: pointer;
  }

  .config {
    max-width: 960px;
    padding: 1rem;
    padding-top: 0;
  }

  .config .field {
    display: flex;
    align-items: baseline;
  }

  .config .field:not(:first-child) {
    padding-top: 1rem;
  }

  .config .field .input {
    flex: 1 1 auto;
    padding: 0.5rem;
    margin-left: 1rem;
  }

  .config button {
    padding: 0.5rem 1rem;
    background-color: #0099ffc0;
    color: #fff;
    font-size: 1rem;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .config button:hover {
    background-color: #0099ff;
  }

  h3 {
    padding: 1rem 0.5rem;
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

  :global(.item .character-image svg) {
    width: 2.5rem;
    height: 2.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 3rem;
    pointer-events: none;
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

  .modal .window {
    max-width: 960px;
    min-height: 100px;
    margin: 0 auto;
    background-color: var(--background-color);
    box-shadow: -1rem -1rem 2rem #00000042, 1rem -1rem 2rem #00000042,
      -1rem 1rem 2rem #00000042, 1rem 1rem 2rem #00000042;
    position: relative;
  }

  .modal .window .exit {
    position: absolute;
    top: 0rem;
    right: 0rem;
    width: 3rem;
    height: 3rem;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    opacity: 0.8;
  }

  .modal .exit:hover {
    opacity: 1;
  }

  .modal .content {
    padding: 1rem;
  }

  .modal .header {
    display: flex;
  }

  .modal .selected-item {
    font-size: 2.5rem;
  }

  :global(.modal .selected-item .character-image svg) {
    width: 2.5rem;
    height: 2.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 3rem;
    pointer-events: none;
  }

  .modal .section:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .config .field {
      flex-direction: column;
      align-items: stretch;
    }

    .config .field .input {
      margin-left: 0;
      margin-top: 0.5rem;
    }

    .modal .spacer {
      flex: 1 1 auto;
      pointer-events: none;
    }
  }
</style>
