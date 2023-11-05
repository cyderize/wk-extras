import { derived, get, readable, readonly, writable } from "svelte/store";

/**
 * @type Promise<IDBDatabase>
 */
const db = new Promise((resolve, reject) => {
  const idb = indexedDB.open("wk-extras");
  idb.onerror = (e) => {
    reject(e);
  };
  idb.onupgradeneeded = () => {
    const db = idb.result;
    db.createObjectStore("wk-extras");
  };
  idb.onsuccess = () => {
    resolve(idb.result);
  };
});

const getObject = async (key) => {
  const store = (await db).transaction("wk-extras").objectStore("wk-extras");
  return await new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const setObject = async (key, value) => {
  const store = (await db)
    .transaction("wk-extras", "readwrite")
    .objectStore("wk-extras");
  return await new Promise((resolve, reject) => {
    const updateRequest = store.put(value, key);
    updateRequest.onsuccess = () => resolve(value);
    updateRequest.onerror = reject;
  });
};

let subjectsSequenceID = 0;
let assignmentsSequenceID = 0;

const apiKeyStore = writable(localStorage.getItem("wk-extras.apiKey"));
const periodStore = writable(
  JSON.parse(localStorage.getItem("wk-extras.period") || "3")
);
const subjectsStore = writable({});

const getSubjects = async (reset) => {
  try {
    const key = get(apiKeyStore);
    if (!key) {
      return;
    }
    subjectsSequenceID++;
    const sequenceID = subjectsSequenceID;
    const headers = new Headers({
      "Wanikani-Revision": "20170710",
      Authorization: `Bearer ${key}`,
    });
    let url = "https://api.wanikani.com/v2/subjects";
    let updated = localStorage.getItem("wk-extras.subjectsUpdated");
    let result = {};
    if (!reset && updated) {
      const cached = await getObject("subjects");
      if (cached) {
        url += `?updated_after=${updated}`;
        result = cached;
      }
    }
    while (url && subjectsSequenceID === sequenceID) {
      const response = await fetch(url, {
        headers,
      });
      const json = await response.json();
      url = json.pages.next_url;
      for (const subject of json.data) {
        result[subject.id] = subject;
      }
      if (json.data_updated_at) {
        updated = json.data_updated_at;
      }
    }
    if (subjectsSequenceID !== sequenceID) {
      return;
    }
    localStorage.setItem("wk-extras.subjectsUpdated", updated);
    setObject("subjects", result);
    subjectsStore.set(result);
  } catch (e) {
    console.error(e);
  }
};

export const apiKey = {
  subscribe: apiKeyStore.subscribe,
  set: (newKey) => {
    localStorage.setItem("wk-extras.apiKey", newKey);
    apiKeyStore.set(newKey);
    getSubjects(true);
  },
};

export const period = {
  subscribe: periodStore.subscribe,
  set: (newPeriod) => {
    localStorage.setItem("wk-extras.period", newPeriod);
    periodStore.set(newPeriod);
  },
};

getSubjects(false);

export const subjects = readonly(subjectsStore);
export const assignments = derived(
  [apiKey, period],
  ([$apiKey, $period], set) => {
    (async () => {
      try {
        if (!$apiKey || !$period) {
          return;
        }
        assignmentsSequenceID++;
        const sequenceID = assignmentsSequenceID;
        const headers = new Headers({
          "Wanikani-Revision": "20170710",
          Authorization: `Bearer ${$apiKey}`,
        });
        const end = new Date();
        end.setDate(end.getDate() + $period);
        let url = `https://api.wanikani.com/v2/assignments?available_before=${end.toISOString()}`;
        const result = [];
        while (url && sequenceID === assignmentsSequenceID) {
          const response = await fetch(url, {
            headers,
          });
          const json = await response.json();
          url = json.pages.next_url;
          result.push(...json.data.map((asg) => asg.data));
        }
        if (sequenceID !== assignmentsSequenceID) {
          return;
        }
        set(result);
      } catch (e) {
        console.error(e);
      }
    })();
  }
);

export const radicals = derived(
  [assignments, subjects],
  ([$assignments, $subjects]) =>
    $assignments &&
    $subjects &&
    $assignments
      .map((asg) => {
        const subject = $subjects[asg.subject_id];
        if (!subject || subject.object !== "radical") {
          return null;
        }
        const data = {
          type: "radical",
          timestamp: new Date(asg.available_at).valueOf(),
          level: subject.data.level,
          characters: subject.data.characters,
          meanings: subject.data.meanings,
          url: subject.data.document_url,
        };
        if (!data.characters) {
          data.image = (async () => {
            const img = subject.data.character_images.find(
              (img) =>
                img.content_type === "image/svg+xml" &&
                img.metadata.inline_styles === false
            );
            if (!img) {
              const fallback =
                subject.data.character_images.find(
                  (img) => img.content_type === "image/svg+xml"
                ) || subject.data.character_images[0];
              if (fallback) {
                return { url: fallback.url };
              }
              return {};
            }
            const response = await fetch(img.url);
            return { html: await response.text() };
          })();
        }
        return data;
      })
      .filter((x) => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
);

export const kanji = derived(
  [assignments, subjects],
  ([$assignments, $subjects]) =>
    $assignments &&
    $subjects &&
    $assignments
      .map((asg) => {
        const subject = $subjects[asg.subject_id];
        if (!subject || subject.object !== "kanji") {
          return null;
        }
        return {
          type: "kanji",
          timestamp: new Date(asg.available_at).valueOf(),
          level: subject.data.level,
          characters: subject.data.characters,
          meanings: subject.data.meanings,
          readings: subject.data.readings,
          url: subject.data.document_url,
        };
      })
      .filter((x) => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
);

export const vocab = derived(
  [assignments, subjects],
  ([$assignments, $subjects]) =>
    $assignments &&
    $subjects &&
    $assignments
      .map((asg) => {
        const subject = $subjects[asg.subject_id];
        if (
          !subject ||
          (subject.object !== "vocabulary" &&
            subject.object !== "kana_vocabulary")
        ) {
          return null;
        }
        return {
          type: "vocab",
          timestamp: new Date(asg.available_at).valueOf(),
          level: subject.data.level,
          characters: subject.data.characters,
          meanings: subject.data.meanings,
          readings: subject.data.readings,
          url: subject.data.document_url,
        };
      })
      .filter((x) => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
);

export const corpus = derived(subjects, ($subjects) => {
  if (!$subjects) {
    return null;
  }
  const objectMap = {
    radical: "radical",
    kanji: "kanji",
    vocabulary: "vocab",
    kana_vocabulary: "vocab",
  };
  const result = { radical: {}, kanji: {}, vocab: {} };
  for (const k in $subjects) {
    const type = $subjects[k].object;
    const data = $subjects[k].data;
    const level = data.level;
    if (!result.radical[level]) {
      result.radical[level] = { meanings: [] };
      result.kanji[level] = { meanings: [], readings: [] };
      result.vocab[level] = { meanings: [], readings: [] };
    }
    result[objectMap[type]][level].meanings.push(
      ...data.meanings.filter((x) => x.accepted_answer).map((x) => x.meaning)
    );
    if (data.readings) {
      result[objectMap[type]][level].readings.push(
        ...data.readings.filter((x) => x.accepted_answer).map((x) => x.reading)
      );
    }
  }
  return result;
});
