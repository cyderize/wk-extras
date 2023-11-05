<script>
  import { createEventDispatcher } from "svelte";
  import { shuffle } from "../lib/util";
  import { fly } from "svelte/transition";

  export let choices;
  export let key;

  const dispatch = createEventDispatcher();

  function select(index) {
    if (done) {
      return;
    }
    if (choices[index].correct) {
      done = true;
    }
    chosen = [...chosen.slice(0, index), true, ...chosen.slice(index + 1)];
    dispatch("select", { index });
  }

  let randomised = [];
  let chosen = null;
  let done = true;

  function init(key) {
    randomised = choices
      ? shuffle(choices.map((choice, index) => ({ ...choice, index })))
      : null;
    chosen = choices.map(() => false);
    done = false;
  }

  $: init(key);
</script>

<div class="wrapper">
  {#key key}
    <div class="choices" in:fly={{ duration: 200, y: -100 }}>
      {#each randomised as choice}
        <button
          class="choice button"
          class:correct={choice.correct && chosen[choice.index]}
          class:incorrect={!choice.correct && chosen[choice.index]}
          class:disabled={done}
          class:long={choice.label.length > 6}
          type="button"
          on:click={() => select(choice.index)}
        >
          {choice.label}
        </button>
      {/each}
    </div>
  {/key}
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 0.5rem;
  }

  .choices {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    flex: 1 0 0;
    background: var(--border-color);
    border: solid 1px var(--border-color);
    border-radius: 1rem;
    overflow: hidden;
    height: 100%;
  }

  .choice {
    display: block;
    border: 0;
    font-size: 2rem;
    word-break: break-word;
    transition: background-color 0.2s ease;
  }

  .choice.disabled {
    background-color: var(--button-background);
  }

  .choice.correct {
    background-color: rgb(33, 190, 60);
    color: #fff;
  }

  .choice.incorrect {
    background-color: rgb(197, 51, 51);
    color: #fff;
  }

  .choice.long {
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    .choice {
      font-size: 1.5rem;
    }

    .choice.long {
      font-size: 1.2rem;
    }
  }
</style>
