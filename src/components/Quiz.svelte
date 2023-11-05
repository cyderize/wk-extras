<script>
  import { createEventDispatcher } from "svelte";
  import { chooseRandom, shuffle } from "../lib/util";
  import Choices from "./Choices.svelte";
  import Question from "./Question.svelte";
  import { corpus } from "../lib/db";

  const dispatch = createEventDispatcher();

  export let items = [];

  let quiz = [];
  let currentIndex = 0;
  let canAdvance = false;

  let answered = false;
  let correct = 0;
  let incorrect = 0;

  function generateChoices(item, key, labelKey) {
    const answer =
      item[key].find((x) => x.primary) ||
      item[key].find((x) => x.accepted_answer);
    const choices = [{ correct: true, label: answer[labelKey] }];
    const others = $corpus[item.type][item.level][key];
    for (let i = item.level - 1; i > 0 && others.length < 20; i--) {
      others.push(...$corpus[item.type][i][key]);
    }
    for (
      let i = 0;
      i < 1000 && choices.length < Math.min(others.length, 9);
      i++
    ) {
      const label = chooseRandom(others);
      if (
        choices.every((c) => c.label !== label) &&
        item[key].every((x) => !x.accepted_answer || x[labelKey] !== label)
      ) {
        choices.push({ correct: false, label });
      }
    }
    return choices;
  }

  function generateQuestions(items) {
    if (!items || items.length === 0) {
      return [];
    }
    const result = [];
    for (const item of items) {
      if (item.readings) {
        result.push({
          category: "Reading",
          question: item.characters,
          choices: generateChoices(item, "readings", "reading"),
        });
      }
      result.push({
        category: "Meaning",
        question: item.characters,
        image: item.image,
        choices: generateChoices(item, "meanings", "meaning"),
      });
    }
    quiz = shuffle(result);
    console.log(quiz);
    currentIndex = 0;
    answered = false;
  }

  function select(index) {
    if (index === 0) {
      canAdvance = true;
      if (!answered) {
        correct++;
      }
    } else if (!answered) {
      incorrect++;
      quiz = [...quiz, quiz[currentIndex]];
    }
    answered = true;
  }

  function nextQuestion() {
    currentIndex++;
    canAdvance = false;
    answered = false;
  }

  $: generateQuestions(items);

  $: current =
    quiz && quiz.length > 0 && currentIndex >= 0 && currentIndex < quiz.length
      ? quiz[currentIndex]
      : null;
</script>

<div class="container">
  {#if current}
    <div class="wrapper">
      <div class="top">
        <Question
          label={current.question}
          image={current.image}
          category={current.category}
          {correct}
          {incorrect}
          remaining={quiz.length - currentIndex}
        />
      </div>

      <div class="grow">
        <div class="middle">
          <Choices
            choices={current.choices}
            key={currentIndex}
            on:select={(e) => select(e.detail.index)}
          />
        </div>
        <div class="bottom">
          <button
            type="button"
            class="next-button primary button"
            on:click={nextQuestion}
            disabled={!canAdvance}
          >
            <span class="next-label">Next Question</span>
            <span class="next-icon">▶</span>
          </button>
        </div>
      </div>
    </div>
  {:else if correct + incorrect > 0}
    <div class="done">
      <div>
        <div class="message">Quiz complete!</div>
        <div>You scored:</div>
        <div class="score">
          {Math.round((100 * correct) / (correct + incorrect))}%
        </div>
        <div>
          <button
            class="primary button back"
            type="button"
            on:click={() => dispatch("exit")}
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="exit" on:click={() => dispatch("exit")}>×</div>

<style>
  .container {
    height: calc(100vh - 4rem);
    max-width: 960px;
    margin: 0 auto;
    padding: 0.5rem;
  }

  .done {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  .done .message {
    font-size: 2rem;
    padding-bottom: 2rem;
  }

  .done .score {
    font-size: 4rem;
  }

  .done .back {
    margin-top: 2rem;
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-size: 1rem;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 500px;
    flex: 0 1 auto;
  }

  .grow {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  .middle {
    display: flex;
    align-items: stretch;
    width: 100%;
    max-width: 700px;
    max-height: 500px;
    flex: 1 1 auto;
    margin: 0 auto;
  }

  .bottom {
    padding: 0.5rem;
  }

  .next-button {
    font-size: 1rem;
    padding: 1rem 2rem;
    border-radius: 1rem;
    margin: 0 auto;
    display: block;
    transition: background-color 0.2s ease;
  }

  @media (min-width: 560px) {
    .wrapper {
      flex-direction: row;
    }

    .top {
      flex: 1 0 auto;
    }
  }

  @media (max-height: 560px) {
    .grow {
      flex-direction: row;
    }

    .bottom {
      display: flex;
      align-items: center;
    }

    .next-button {
      padding: 2rem;
    }
    .next-label {
      display: none;
    }
  }
</style>
