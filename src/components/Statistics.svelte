<script>
  export let correct = 0;
  export let incorrect = 0;
  export let remaining = 0;

  $: count = correct + incorrect;
  $: percentage = count > 0 ? Math.round((100 * correct) / count) : null;
</script>

<div class="stats">
  <span class="correct">{correct}</span>
  <span>|</span>
  <span class="incorrect">{incorrect}</span>
  {#if percentage !== null}
    <span>|</span>
    <span>{percentage}%</span>
  {/if}
  <span>|</span>
  <span>{remaining}</span>
</div>

<style>
  .stats {
    display: flex;
    justify-content: center;
  }

  .stats > * {
    padding: 0 0.25rem;
  }

  .correct {
    color: rgb(33, 190, 60);
  }

  .incorrect {
    color: rgb(197, 51, 51);
  }
</style>
