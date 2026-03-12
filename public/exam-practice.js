(function () {
  const PAGE = document.querySelector('[data-exam-practice-page]');
  if (!PAGE) return;

  const DECK_SELECTOR = PAGE.querySelector('[data-exam-deck-selector]');
  const DECK_GRID = PAGE.querySelector('[data-deck-grid]');
  const SESSION_SECTION = PAGE.querySelector('[data-exam-session]');
  const LOADING = PAGE.querySelector('[data-exam-loading]');
  const ERROR_SECTION = PAGE.querySelector('[data-exam-error]');
  const ERROR_MESSAGE = PAGE.querySelector('[data-exam-error-message]');

  const DECK_NAME_EL = PAGE.querySelector('[data-exam-deck-name]');
  const PROGRESS_EL = PAGE.querySelector('[data-exam-progress]');
  const QUESTION_INDEX_EL = PAGE.querySelector('[data-exam-question-index]');
  const QUESTION_TEXT_EL = PAGE.querySelector('[data-exam-question-text]');
  const ANSWER_EL = PAGE.querySelector('[data-exam-answer]');
  const REVEAL_BTN = PAGE.querySelector('[data-exam-reveal]');
  const KNOWN_BTN = PAGE.querySelector('[data-exam-known]');
  const UNKNOWN_BTN = PAGE.querySelector('[data-exam-unknown]');
  const SHUFFLE_BTN = PAGE.querySelector('[data-exam-shuffle]');
  const PREV_BTN = PAGE.querySelector('[data-exam-prev]');
  const NEXT_BTN = PAGE.querySelector('[data-exam-next]');
  const BACK_BTN = PAGE.querySelector('[data-exam-back]');

  const STORAGE_KEY_PREFIX = 'cmput275-exam-practice-';

  function parseDeckText(text) {
    const blocks = text.split(/\[Q-[^\]]+\]/);
    const results = [];
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i].trim();
      let question = '';
      let answer = '';
      const lines = block.split(/\r?\n/);
      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith('Question:')) {
          question = t.slice(9).trim();
        } else if (t.startsWith('Answer:')) {
          answer = t.slice(7).trim();
          break;
        }
      }
      if (question && answer) {
        results.push({ question, answer });
      }
    }
    return results;
  }

  function setVisibility(hideDeck, hideSession, hideLoading, hideError) {
    DECK_SELECTOR.hidden = !!hideDeck;
    SESSION_SECTION.hidden = !!hideSession;
    LOADING.hidden = !!hideLoading;
    ERROR_SECTION.hidden = !!hideError;
  }

  function loadState(deckId) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + deckId);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (_) {}
    return null;
  }

  function saveState(deckId, state) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + deckId, JSON.stringify(state));
    } catch (_) {}
  }

  let state = {
    deckId: null,
    deckName: null,
    deckFile: null,
    questions: [],
    index: 0,
    statuses: {},
    order: [],
  };

  function getOrder() {
    if (state.order.length === state.questions.length) return state.order;
    return state.questions.map((_, i) => i);
  }

  function currentQuestionIndex() {
    const order = getOrder();
    return order[state.index];
  }

  function renderQuestion() {
    const order = getOrder();
    const total = order.length;
    if (total === 0) return;
    const idx = currentQuestionIndex();
    const q = state.questions[idx];
    const oneBased = state.index + 1;

    QUESTION_INDEX_EL.textContent = `Question ${oneBased} of ${total}`;
    QUESTION_TEXT_EL.textContent = q.question;
    ANSWER_EL.textContent = q.answer;
    ANSWER_EL.hidden = true;
    REVEAL_BTN.textContent = 'Reveal answer';
    REVEAL_BTN.setAttribute('aria-expanded', 'false');

    const status = state.statuses[idx] || '';
    KNOWN_BTN.classList.toggle('active', status === 'known');
    UNKNOWN_BTN.classList.toggle('active', status === 'unknown');

    PREV_BTN.disabled = state.index === 0;
    NEXT_BTN.disabled = state.index === total - 1;

    const knownCount = Object.values(state.statuses).filter((s) => s === 'known').length;
    const unknownCount = Object.values(state.statuses).filter((s) => s === 'unknown').length;
    PROGRESS_EL.textContent = `Practice score: ${knownCount}/${total} known${unknownCount ? ` | ${unknownCount} unknown` : ''}`;
  }

  function persistState() {
    if (!state.deckId) return;
    saveState(state.deckId, {
      index: state.index,
      statuses: state.statuses,
      order: state.order.length ? state.order : undefined,
    });
  }

  function loadDeck(deckId, deckName, deckFile) {
    setVisibility(true, true, false, true);
    fetch('/examquestions/' + encodeURIComponent(deckFile))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load questions');
        return r.text();
      })
      .then((text) => {
        const questions = parseDeckText(text);
        if (questions.length === 0) throw new Error('No questions found in this deck');
        const saved = loadState(deckId);
        state = {
          deckId,
          deckName,
          deckFile,
          questions,
          index: saved && typeof saved.index === 'number' && saved.index >= 0 && saved.index < questions.length ? saved.index : 0,
          statuses: saved && saved.statuses && typeof saved.statuses === 'object' ? saved.statuses : {},
          order: saved && Array.isArray(saved.order) && saved.order.length === questions.length ? saved.order : [],
        };
        setVisibility(true, false, true, true);
        DECK_NAME_EL.textContent = deckName;
        renderQuestion();
      })
      .catch((err) => {
        setVisibility(false, true, true, false);
        ERROR_MESSAGE.textContent = err.message || 'Could not load this deck.';
      });
  }

  function backToDecks() {
    persistState();
    state = { deckId: null, deckName: null, deckFile: null, questions: [], index: 0, statuses: {}, order: [] };
    setVisibility(false, true, true, true);
  }

  function shuffleDeck() {
    const order = state.questions.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    state.order = order;
    state.index = 0;
    persistState();
    renderQuestion();
  }

  DECK_GRID.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-deck-id][data-deck-file][data-deck-name]');
    if (!btn) return;
    loadDeck(btn.dataset.deckId, btn.dataset.deckName, btn.dataset.deckFile);
  });

  BACK_BTN.addEventListener('click', backToDecks);

  REVEAL_BTN.addEventListener('click', () => {
    const show = ANSWER_EL.hidden;
    ANSWER_EL.hidden = !show;
    REVEAL_BTN.textContent = show ? 'Hide answer' : 'Reveal answer';
    REVEAL_BTN.setAttribute('aria-expanded', String(show));
  });

  function setStatus(status) {
    const idx = currentQuestionIndex();
    const next = state.statuses[idx] === status ? '' : status;
    if (next) state.statuses[idx] = next;
    else delete state.statuses[idx];
    persistState();
    renderQuestion();
  }

  KNOWN_BTN.addEventListener('click', () => setStatus('known'));
  UNKNOWN_BTN.addEventListener('click', () => setStatus('unknown'));

  SHUFFLE_BTN.addEventListener('click', shuffleDeck);

  PREV_BTN.addEventListener('click', () => {
    if (state.index > 0) {
      state.index--;
      persistState();
      renderQuestion();
    }
  });

  NEXT_BTN.addEventListener('click', () => {
    if (state.index < getOrder().length - 1) {
      state.index++;
      persistState();
      renderQuestion();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!SESSION_SECTION.hidden && state.questions.length) {
      if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        if (state.index > 0) {
          state.index--;
          persistState();
          renderQuestion();
          e.preventDefault();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        if (state.index < getOrder().length - 1) {
          state.index++;
          persistState();
          renderQuestion();
          e.preventDefault();
        }
      }
    }
  });
})();
