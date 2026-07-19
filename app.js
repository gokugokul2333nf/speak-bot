const STORAGE_KEY = "speakagain-desktop-state-v1";

const pictureWords = [
  {
    id: "apple",
    word: "Apple",
    category: "Food",
    phrase: "I want an apple.",
    cue: "Round fruit",
    image: "assets/apple.svg",
    accepted: ["apple", "an apple"],
  },
  {
    id: "cup",
    word: "Cup",
    category: "Daily object",
    phrase: "I need a cup.",
    cue: "Used for drinking",
    image: "assets/cup.svg",
    accepted: ["cup", "a cup"],
  },
  {
    id: "book",
    word: "Book",
    category: "Daily object",
    phrase: "Please give me the book.",
    cue: "Used for reading",
    image: "assets/book.svg",
    accepted: ["book", "the book"],
  },
  {
    id: "phone",
    word: "Phone",
    category: "Daily object",
    phrase: "I want my phone.",
    cue: "Used to call someone",
    image: "assets/phone.svg",
    accepted: ["phone", "my phone"],
  },
  {
    id: "water",
    word: "Water",
    category: "Need",
    phrase: "I want water.",
    cue: "Used when thirsty",
    image: "assets/water.svg",
    accepted: ["water", "want water"],
  },
  {
    id: "chair",
    word: "Chair",
    category: "Home",
    phrase: "I want to sit on the chair.",
    cue: "Used for sitting",
    image: "assets/chair.svg",
    accepted: ["chair", "the chair"],
  },
];

const phrases = [
  { id: "help", phrase: "I need help.", focus: "Ask for support" },
  { id: "pain", phrase: "I have pain.", focus: "Share discomfort" },
  { id: "bathroom", phrase: "I need the bathroom.", focus: "Personal need" },
  { id: "hungry", phrase: "I am hungry.", focus: "Food request" },
  { id: "yes", phrase: "Yes, please.", focus: "Polite response" },
  { id: "no", phrase: "No, thank you.", focus: "Polite response" },
];

let state = loadState();
let currentRecognition = null;
let toastTimer = null;

const elements = {
  body: document.body,
  todayLabel: document.querySelector("#todayLabel"),
  sectionTitle: document.querySelector("#sectionTitle"),
  practiceStage: document.querySelector("#practiceStage"),
  completedStat: document.querySelector("#completedStat"),
  accuracyStat: document.querySelector("#accuracyStat"),
  streakStat: document.querySelector("#streakStat"),
  minutesStat: document.querySelector("#minutesStat"),
  goalSummary: document.querySelector("#goalSummary"),
  goalMeter: document.querySelector("#goalMeter"),
  dailyGoal: document.querySelector("#dailyGoal"),
  sessionLog: document.querySelector("#sessionLog"),
  caregiverNotes: document.querySelector("#caregiverNotes"),
  notesSavedLabel: document.querySelector("#notesSavedLabel"),
  largeTextToggle: document.querySelector("#largeTextToggle"),
  slowVoiceToggle: document.querySelector("#slowVoiceToggle"),
  resetTodayButton: document.querySelector("#resetTodayButton"),
  clearLogButton: document.querySelector("#clearLogButton"),
  toast: document.querySelector("#toast"),
};

const iconPaths = {
  image: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8.5" cy="10" r="1.5"></circle><path d="m21 15-5-5L5 21"></path>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>',
  target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>',
  chart: '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M8 16v-5"></path><path d="M12 16V8"></path><path d="M16 16v-9"></path>',
  minus: '<path d="M5 12h14"></path>',
  plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  rotate: '<path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path>',
  check: '<path d="M20 6 9 17l-5-5"></path>',
  percent: '<path d="M19 5 5 19"></path><circle cx="7" cy="7" r="2"></circle><circle cx="17" cy="17" r="2"></circle>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-8 0 3-2 4-4 5 0-3-1-5-3-6 0 4-2 6-2 9 0 4 3 7 7 7z"></path>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"></path><path d="M16 9.5a4 4 0 0 1 0 5"></path><path d="M19 7a8 8 0 0 1 0 10"></path>',
  mic: '<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"></path><path d="M19 11a7 7 0 0 1-14 0"></path><path d="M12 18v4"></path><path d="M8 22h8"></path>',
  arrow: '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
  trash: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path>',
  play: '<path d="M8 5v14l11-7z"></path>',
};

function loadState() {
  const fallback = {
    section: "words",
    indexes: { words: 0, phrases: 0, matching: 0 },
    goal: 8,
    history: [],
    notes: "",
    largeText: false,
    slowVoice: true,
  };

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...fallback, ...stored, indexes: { ...fallback.indexes, ...(stored?.indexes || {}) } };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatToday() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function icon(name) {
  const path = iconPaths[name] || iconPaths.check;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

function hydrateIcons(scope = document) {
  scope.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("Text-to-speech is not available in this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = state.slowVoice ? 0.72 : 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function getRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

function startSpeechPractice(target, mode) {
  if (currentRecognition) {
    currentRecognition.abort();
    currentRecognition = null;
  }

  const recognition = getRecognition();
  if (!recognition) {
    updateFeedback("Speech recognition is unavailable in this browser.", "Try opening this in Chrome on localhost.", "warn");
    return;
  }

  const micButton = document.querySelector("[data-action='speak']");
  if (micButton) {
    micButton.classList.add("is-listening");
    micButton.querySelector("span:last-child").textContent = "Listening";
  }

  updateFeedback("Listening...", "Speak clearly when the browser microphone prompt appears.", "warn");

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const score = scoreSpeech(transcript, target.expected, target.accepted);
    const result = feedbackForScore(score, transcript, target.expected);
    addHistory({
      mode,
      target: target.expected,
      transcript,
      score,
      correct: score >= 70,
      duration: 1,
    });
    updateFeedback(result.title, result.body, result.kind);
  };

  recognition.onerror = (event) => {
    const message = event.error === "not-allowed" ? "Microphone permission was blocked." : "Speech recognition stopped before a result.";
    updateFeedback(message, "Listen to the prompt and try again when ready.", "low");
  };

  recognition.onend = () => {
    if (micButton) {
      micButton.classList.remove("is-listening");
      micButton.querySelector("span:last-child").textContent = "Speak";
    }
    currentRecognition = null;
    renderStats();
    renderLog();
  };

  currentRecognition = recognition;
  try {
    recognition.start();
  } catch {
    currentRecognition = null;
    if (micButton) {
      micButton.classList.remove("is-listening");
      micButton.querySelector("span:last-child").textContent = "Speak";
    }
    updateFeedback("Microphone could not start.", "Refresh the page and try again.", "low");
  }
}

function normalizeSpeech(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(a|an|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSpeech(transcript, expected, accepted = []) {
  const heard = normalizeSpeech(transcript);
  const targets = [expected, ...accepted].map(normalizeSpeech).filter(Boolean);

  if (!heard || targets.length === 0) {
    return 0;
  }

  let best = 0;
  targets.forEach((target) => {
    if (heard === target || heard.includes(target) || target.includes(heard)) {
      best = Math.max(best, 100);
      return;
    }

    const editScore = Math.round((1 - levenshtein(heard, target) / Math.max(heard.length, target.length)) * 100);
    const heardWords = new Set(heard.split(" "));
    const targetWords = target.split(" ");
    const overlap = targetWords.filter((word) => heardWords.has(word)).length / targetWords.length;
    const overlapScore = Math.round(overlap * 100);
    best = Math.max(best, editScore, overlapScore);
  });

  return Math.max(0, Math.min(100, best));
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row]);

  for (let col = 0; col <= a.length; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let col = 1; col <= a.length; col += 1) {
      const cost = a[col - 1] === b[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function feedbackForScore(score, transcript, expected) {
  if (score >= 85) {
    return {
      title: "Clear response",
      body: `Heard "${transcript}". Target: "${expected}".`,
      kind: "good",
    };
  }

  if (score >= 60) {
    return {
      title: "Close response",
      body: `Heard "${transcript}". Try the target again: "${expected}".`,
      kind: "warn",
    };
  }

  return {
    title: "Keep practicing",
    body: `Heard "${transcript}". Target: "${expected}".`,
    kind: "low",
  };
}

function updateFeedback(title, body, kind = "neutral") {
  const feedback = document.querySelector("#feedbackCard");
  if (!feedback) {
    return;
  }

  feedback.className = `feedback-card ${kind === "good" ? "is-good" : kind === "warn" ? "is-warn" : kind === "low" ? "is-low" : ""}`;
  feedback.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p>`;
}

function addHistory(entry) {
  state.history.unshift({
    ...entry,
    id: window.crypto && typeof window.crypto.randomUUID === "function" ? window.crypto.randomUUID() : String(Date.now()),
    date: todayKey(),
    time: new Date().toISOString(),
  });
  state.history = state.history.slice(0, 120);
  saveState();
}

function todayHistory() {
  const today = todayKey();
  return state.history.filter((item) => item.date === today);
}

function computeStreak() {
  const dates = new Set(state.history.map((item) => item.date));
  let count = 0;
  const cursor = new Date();

  while (dates.has(todayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function renderStats() {
  const today = todayHistory();
  const attempts = today.filter((item) => typeof item.score === "number");
  const accuracy = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0;
  const minutes = today.reduce((sum, item) => sum + (item.duration || 1), 0);
  const goalPercent = Math.min(100, Math.round((today.length / state.goal) * 100));
  const streak = computeStreak();

  elements.completedStat.textContent = today.length;
  elements.accuracyStat.textContent = `${accuracy}%`;
  elements.streakStat.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
  elements.minutesStat.textContent = `${minutes} min`;
  elements.goalSummary.textContent = `${today.length} of ${state.goal}`;
  elements.goalMeter.style.width = `${goalPercent}%`;
  elements.dailyGoal.textContent = state.goal;
}

function renderLog() {
  const entries = state.history.slice(0, 12);
  if (!entries.length) {
    elements.sessionLog.innerHTML = '<div class="log-empty">No practice recorded yet.</div>';
    return;
  }

  elements.sessionLog.innerHTML = entries
    .map((entry) => {
      const badgeClass = entry.score >= 70 ? "" : entry.score >= 45 ? "is-mid" : "is-low";
      const time = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(entry.time));
      return `
        <article class="log-item">
          <div>
            <strong>${escapeHtml(entry.target)}</strong>
            <p>${escapeHtml(labelForMode(entry.mode))} - ${time}</p>
            ${entry.transcript ? `<p>Heard: ${escapeHtml(entry.transcript)}</p>` : ""}
          </div>
          <span class="score-badge ${badgeClass}">${Math.round(entry.score)}%</span>
        </article>
      `;
    })
    .join("");
}

function labelForMode(mode) {
  return {
    words: "Picture word",
    phrases: "Daily phrase",
    matching: "Match meaning",
  }[mode] || "Practice";
}

function renderCurrentSection() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === state.section);
  });

  const titles = {
    words: "Picture Words",
    phrases: "Daily Phrases",
    matching: "Match Meaning",
    progress: "Progress",
  };

  elements.sectionTitle.textContent = titles[state.section];

  if (state.section === "words") {
    renderWords();
  } else if (state.section === "phrases") {
    renderPhrases();
  } else if (state.section === "matching") {
    renderMatching();
  } else {
    renderProgress();
  }

  hydrateIcons(elements.practiceStage);
}

function renderWords() {
  const item = pictureWords[state.indexes.words % pictureWords.length];
  elements.practiceStage.innerHTML = `
    <div class="exercise-layout">
      <div>
        <p class="section-kicker">${escapeHtml(item.category)}</p>
        <h3 class="exercise-title">${escapeHtml(item.word)}</h3>
        <p class="exercise-subtitle">${escapeHtml(item.cue)}</p>
        <span class="target-phrase">${escapeHtml(item.phrase)}</span>
        <div class="practice-actions">
          <button class="secondary-button" type="button" data-action="listen">
            <span data-icon="volume"></span>
            <span>Listen</span>
          </button>
          <button class="primary-button" type="button" data-action="speak">
            <span data-icon="mic"></span>
            <span>Speak</span>
          </button>
          <button class="secondary-button" type="button" data-action="next">
            <span data-icon="arrow"></span>
            <span>Next</span>
          </button>
        </div>
        <div class="feedback-card" id="feedbackCard">
          <strong>Ready</strong>
          <p>${escapeHtml(item.word)} is selected.</p>
        </div>
      </div>
      <div>
        <div class="picture-frame">
          <img src="${item.image}" alt="${escapeHtml(item.word)} illustration" />
        </div>
        <div class="word-strip">
          ${pictureWords
            .map(
              (word, index) => `
                <button class="word-pill ${index === state.indexes.words ? "is-active" : ""}" type="button" data-word-index="${index}">
                  ${escapeHtml(word.word)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  elements.practiceStage.querySelector("[data-action='listen']").addEventListener("click", () => speak(`${item.word}. ${item.phrase}`));
  elements.practiceStage.querySelector("[data-action='speak']").addEventListener("click", () => {
    startSpeechPractice({ expected: item.word, accepted: item.accepted }, "words");
  });
  elements.practiceStage.querySelector("[data-action='next']").addEventListener("click", () => {
    state.indexes.words = (state.indexes.words + 1) % pictureWords.length;
    saveState();
    renderCurrentSection();
  });
  elements.practiceStage.querySelectorAll("[data-word-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.indexes.words = Number(button.dataset.wordIndex);
      saveState();
      renderCurrentSection();
    });
  });
}

function renderPhrases() {
  const item = phrases[state.indexes.phrases % phrases.length];
  elements.practiceStage.innerHTML = `
    <div class="exercise-layout">
      <div>
        <p class="section-kicker">${escapeHtml(item.focus)}</p>
        <h3 class="exercise-title">${escapeHtml(item.phrase)}</h3>
        <p class="exercise-subtitle">Practice short, useful speech for daily needs.</p>
        <div class="practice-actions">
          <button class="secondary-button" type="button" data-action="listen">
            <span data-icon="volume"></span>
            <span>Listen</span>
          </button>
          <button class="primary-button" type="button" data-action="speak">
            <span data-icon="mic"></span>
            <span>Speak</span>
          </button>
          <button class="secondary-button" type="button" data-action="next">
            <span data-icon="arrow"></span>
            <span>Next</span>
          </button>
        </div>
        <div class="feedback-card" id="feedbackCard">
          <strong>Ready</strong>
          <p>${escapeHtml(item.phrase)} is selected.</p>
        </div>
      </div>
      <div>
        <div class="phrase-list">
          ${phrases
            .map(
              (phrase, index) => `
                <button class="word-pill ${index === state.indexes.phrases ? "is-active" : ""}" type="button" data-phrase-index="${index}">
                  ${escapeHtml(phrase.phrase)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  elements.practiceStage.querySelector("[data-action='listen']").addEventListener("click", () => speak(item.phrase));
  elements.practiceStage.querySelector("[data-action='speak']").addEventListener("click", () => {
    startSpeechPractice({ expected: item.phrase, accepted: [item.phrase.replace(/[.]/g, "")] }, "phrases");
  });
  elements.practiceStage.querySelector("[data-action='next']").addEventListener("click", () => {
    state.indexes.phrases = (state.indexes.phrases + 1) % phrases.length;
    saveState();
    renderCurrentSection();
  });
  elements.practiceStage.querySelectorAll("[data-phrase-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.indexes.phrases = Number(button.dataset.phraseIndex);
      saveState();
      renderCurrentSection();
    });
  });
}

function matchingChoices() {
  const targetIndex = state.indexes.matching % pictureWords.length;
  const target = pictureWords[targetIndex];
  const otherWords = pictureWords.filter((item) => item.id !== target.id);
  const first = otherWords[(targetIndex + 1) % otherWords.length];
  const second = otherWords[(targetIndex + 3) % otherWords.length];
  return shuffle([target, first, second]);
}

function renderMatching() {
  const target = pictureWords[state.indexes.matching % pictureWords.length];
  const choices = matchingChoices();

  elements.practiceStage.innerHTML = `
    <div>
      <p class="section-kicker">Comprehension</p>
      <h3 class="exercise-title">Find: ${escapeHtml(target.word)}</h3>
      <p class="exercise-subtitle">${escapeHtml(target.cue)}</p>
      <div class="practice-actions">
        <button class="secondary-button" type="button" data-action="listen">
          <span data-icon="volume"></span>
          <span>Listen</span>
        </button>
        <button class="secondary-button" type="button" data-action="next">
          <span data-icon="arrow"></span>
          <span>Next</span>
        </button>
      </div>
      <div class="match-grid">
        ${choices
          .map(
            (choice) => `
              <button class="choice-button" type="button" data-choice-id="${choice.id}">
                <img src="${choice.image}" alt="${escapeHtml(choice.word)} illustration" />
                <span>${escapeHtml(choice.word)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div class="feedback-card" id="feedbackCard">
        <strong>Ready</strong>
        <p>${escapeHtml(target.word)} is selected.</p>
      </div>
    </div>
  `;

  elements.practiceStage.querySelector("[data-action='listen']").addEventListener("click", () => speak(`Find ${target.word}`));
  elements.practiceStage.querySelector("[data-action='next']").addEventListener("click", nextMatch);
  let answered = false;
  elements.practiceStage.querySelectorAll("[data-choice-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (answered) {
        return;
      }
      answered = true;
      const correct = button.dataset.choiceId === target.id;
      button.classList.add(correct ? "is-correct" : "is-wrong");
      elements.practiceStage.querySelectorAll("[data-choice-id]").forEach((choiceButton) => {
        choiceButton.disabled = true;
      });
      if (!correct) {
        const correctButton = elements.practiceStage.querySelector(`[data-choice-id='${target.id}']`);
        correctButton?.classList.add("is-correct");
      }
      addHistory({
        mode: "matching",
        target: target.word,
        transcript: correct ? "Selected correct picture" : `Selected ${button.textContent.trim()}`,
        score: correct ? 100 : 0,
        correct,
        duration: 1,
      });
      updateFeedback(correct ? "Correct match" : "Try the target again", `Target: ${target.word}.`, correct ? "good" : "low");
      renderStats();
      renderLog();
    });
  });
}

function nextMatch() {
  state.indexes.matching = (state.indexes.matching + 1) % pictureWords.length;
  saveState();
  renderCurrentSection();
}

function renderProgress() {
  const modes = [
    { key: "words", label: "Words" },
    { key: "phrases", label: "Phrases" },
    { key: "matching", label: "Matching" },
  ];
  const totals = modes.map((mode) => {
    const entries = state.history.filter((entry) => entry.mode === mode.key);
    const score = entries.length ? Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length) : 0;
    return { ...mode, entries: entries.length, score };
  });
  const recent = state.history.slice(0, 8);

  elements.practiceStage.innerHTML = `
    <div class="progress-view">
      <div>
        <p class="section-kicker">Skill progress</p>
        <h3 class="exercise-title">Practice Summary</h3>
        <p class="exercise-subtitle">Tracked from completed speech and matching exercises on this desktop.</p>
      </div>
      <div class="progress-bars">
        ${totals
          .map(
            (mode) => `
              <div class="skill-row">
                <span>${mode.label}</span>
                <div class="mini-track"><span style="width: ${mode.score}%"></span></div>
                <strong>${mode.score}%</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
    <div class="recent-table" style="margin-top: 24px;">
      ${
        recent.length
          ? recent
              .map(
                (entry) => `
                  <div class="recent-row">
                    <strong>${escapeHtml(entry.target)}</strong>
                    <span>${escapeHtml(labelForMode(entry.mode))}</span>
                    <span>${Math.round(entry.score)}%</span>
                  </div>
                `
              )
              .join("")
          : '<div class="log-empty">No progress data yet.</div>'
      }
    </div>
  `;
}

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
}

function bindGlobalEvents() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.section = button.dataset.section;
      saveState();
      renderCurrentSection();
    });
  });

  document.querySelectorAll("[data-adjust-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      const delta = Number(button.dataset.adjustGoal);
      state.goal = Math.max(1, Math.min(30, state.goal + delta));
      saveState();
      renderStats();
    });
  });

  elements.resetTodayButton.addEventListener("click", () => {
    const today = todayKey();
    state.history = state.history.filter((entry) => entry.date !== today);
    saveState();
    renderStats();
    renderLog();
    renderCurrentSection();
    showToast("Today was reset.");
  });

  elements.clearLogButton.addEventListener("click", () => {
    state.history = [];
    saveState();
    renderStats();
    renderLog();
    renderCurrentSection();
    showToast("Practice history was cleared.");
  });

  elements.caregiverNotes.addEventListener("input", () => {
    state.notes = elements.caregiverNotes.value;
    elements.notesSavedLabel.textContent = "Saving";
    saveState();
    window.setTimeout(() => {
      elements.notesSavedLabel.textContent = "Saved";
    }, 300);
  });

  elements.largeTextToggle.addEventListener("change", () => {
    state.largeText = elements.largeTextToggle.checked;
    elements.body.classList.toggle("large-type", state.largeText);
    saveState();
  });

  elements.slowVoiceToggle.addEventListener("change", () => {
    state.slowVoice = elements.slowVoiceToggle.checked;
    saveState();
  });
}

function init() {
  elements.todayLabel.textContent = formatToday();
  elements.caregiverNotes.value = state.notes;
  elements.largeTextToggle.checked = state.largeText;
  elements.slowVoiceToggle.checked = state.slowVoice;
  elements.body.classList.toggle("large-type", state.largeText);
  hydrateIcons();
  bindGlobalEvents();
  renderStats();
  renderLog();
  renderCurrentSection();
}

init();
