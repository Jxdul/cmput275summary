(function () {
  const THEME_KEY = 'cmput275-theme-mode';
  const STUDY_MODE_KEY = 'cmput275-study-mode';
  const EXAM_STATE_KEY = 'cmput275-exam-state-v1';
  const SECTION_STATE_KEY = 'cmput275-section-state-v1';

  const root = document.documentElement;
  const themeButtons = Array.from(document.querySelectorAll('[data-theme-option]'));

  function getStoredThemeMode() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    return 'auto';
  }

  function applyTheme(mode) {
    if (mode === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
    root.setAttribute('data-theme-mode', mode);

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeOption === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function initTheme() {
    const mode = getStoredThemeMode();
    applyTheme(mode);

    themeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedMode = button.dataset.themeOption;
        localStorage.setItem(THEME_KEY, selectedMode);
        applyTheme(selectedMode);
      });
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => {
      if (getStoredThemeMode() === 'auto') {
        applyTheme('auto');
      }
    });
  }

  function initSlidesFilter() {
    const hub = document.querySelector('[data-slides-hub]');
    if (!hub) {
      return;
    }

    const cards = Array.from(hub.querySelectorAll('[data-slide-card]'));
    const sections = Array.from(hub.querySelectorAll('[data-track-section]'));
    const chips = Array.from(hub.querySelectorAll('[data-track-filter]'));
    const searchInput = hub.querySelector('[data-search-input]');
    const countNode = hub.querySelector('[data-results-count]');
    const emptyState = hub.querySelector('[data-empty-state]');

    let activeTrack = 'all';

    const setActiveTrack = (track) => {
      activeTrack = track;
      chips.forEach((chip) => {
        const isActive = (chip.dataset.trackFilter || 'all') === activeTrack;
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
    };

    const update = () => {
      const query = (searchInput?.value || '').trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = [card.dataset.title, card.dataset.tags, card.dataset.track]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const trackMatch = activeTrack === 'all' || card.dataset.track === activeTrack;
        const searchMatch = !query || haystack.includes(query);
        const isVisible = trackMatch && searchMatch;
        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      sections.forEach((section) => {
        const sectionCards = Array.from(section.querySelectorAll('[data-slide-card]'));
        section.hidden = sectionCards.every((card) => card.hidden);
      });

      if (countNode) {
        countNode.textContent = `${visibleCount} lecture${visibleCount === 1 ? '' : 's'} shown`;
      }
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        setActiveTrack(chip.dataset.trackFilter || 'all');
        update();
      });
    });

    const queryTrack = new URLSearchParams(window.location.search).get('track');
    const allowedTracks = new Set(chips.map((chip) => chip.dataset.trackFilter || 'all'));
    if (queryTrack && allowedTracks.has(queryTrack)) {
      setActiveTrack(queryTrack);
    } else {
      setActiveTrack('all');
    }

    searchInput?.addEventListener('input', update);
    update();
  }

  function readJson(key, fallbackValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallbackValue;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return fallbackValue;
    } catch {
      return fallbackValue;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write errors (private mode / quota).
    }
  }

  function chooseSectionHeadingLevel(article) {
    const counts = { H1: 0, H2: 0, H3: 0 };
    article.querySelectorAll('h1, h2, h3').forEach((heading) => {
      counts[heading.tagName] += 1;
    });

    if (counts.H2 >= 4) return 'H2';
    if (counts.H1 >= 4) return 'H1';
    if (counts.H3 >= 4) return 'H3';
    if (counts.H2 >= 1) return 'H2';
    if (counts.H1 >= 2) return 'H1';
    return null;
  }

  function shouldSectionDefaultOpen(sectionTitle) {
    const title = (sectionTitle || '').toLowerCase();
    if (/mini glossary|slide anchors|traceability/.test(title)) {
      return false;
    }
    if (/big picture|quick reference|pitfalls|edge cases/.test(title)) {
      return true;
    }
    return true;
  }

  function annotateSectionForStudyMode(details) {
    const summary = details.querySelector(':scope > summary');
    const body = details.querySelector(':scope > .study-section-body');
    if (!summary || !body) {
      return;
    }

    const title = (summary.textContent || '').toLowerCase();
    if (/exam-style questions/.test(title)) {
      return;
    }

    const directChildren = Array.from(body.children);
    const listChildren = directChildren.filter((el) => el.tagName === 'UL' || el.tagName === 'OL');
    const hasList = listChildren.length > 0;
    let keptParagraph = false;

    directChildren.forEach((el) => {
      const tag = el.tagName;
      if (tag === 'PRE' || tag === 'TABLE') {
        el.dataset.studyDetail = 'true';
        return;
      }

      if (tag === 'H3' || tag === 'H4') {
        return;
      }

      if (tag === 'UL' || tag === 'OL') {
        Array.from(el.children).forEach((li) => {
          if (/example|correct minimal|tiny example|model answer/i.test(li.textContent || '')) {
            li.dataset.studyDetail = 'true';
          }
        });
        return;
      }

      if (tag === 'P') {
        if (hasList || keptParagraph) {
          el.dataset.studyDetail = 'true';
        } else {
          keptParagraph = true;
        }
        return;
      }

      el.dataset.studyDetail = 'true';
    });

    const hiddenCount = body.querySelectorAll('[data-study-detail="true"]').length;
    if (hiddenCount === 0) {
      return;
    }

    const revealButton = document.createElement('button');
    revealButton.type = 'button';
    revealButton.className = 'section-detail-toggle';
    revealButton.textContent = 'Show details/examples';
    revealButton.setAttribute('aria-expanded', 'false');

    revealButton.addEventListener('click', () => {
      const showing = details.classList.toggle('show-details');
      revealButton.textContent = showing ? 'Hide details/examples' : 'Show details/examples';
      revealButton.setAttribute('aria-expanded', String(showing));
    });

    body.insertBefore(revealButton, body.firstChild);
  }

  function initCollapsibleSections(article) {
    const level = chooseSectionHeadingLevel(article);
    if (!level) {
      return;
    }

    let headings = Array.from(article.querySelectorAll(level.toLowerCase()));
    if (level === 'H1' && headings.length > 1) {
      // Keep the first H1 as page title and collapse the rest.
      headings = headings.slice(1);
    }
    if (headings.length === 0) {
      return;
    }

    const headingSet = new Set(headings);
    const pathKey = window.location.pathname;
    const allSectionState = readJson(SECTION_STATE_KEY, {});
    const pageSectionState = allSectionState[pathKey] || {};

    headings.forEach((heading, index) => {
      const sectionKey = slugify(heading.textContent || `section-${index + 1}`) || `section-${index + 1}`;
      const details = document.createElement('details');
      details.className = 'study-section';
      details.dataset.sectionKey = sectionKey;

      const summary = document.createElement('summary');
      summary.className = 'study-section-summary';
      heading.classList.add('study-section-title');
      summary.appendChild(heading);
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'study-section-body';

      const parent = heading.parentNode;
      parent.insertBefore(details, heading);

      let cursor = details.nextSibling;
      while (cursor) {
        if (cursor.nodeType === 1 && cursor.tagName === level && headingSet.has(cursor)) {
          break;
        }
        const next = cursor.nextSibling;
        body.appendChild(cursor);
        cursor = next;
      }
      details.appendChild(body);

      const persistedOpen = pageSectionState[sectionKey];
      details.open = typeof persistedOpen === 'boolean' ? persistedOpen : shouldSectionDefaultOpen(heading.textContent);

      details.addEventListener('toggle', () => {
        const sectionState = readJson(SECTION_STATE_KEY, {});
        const pageState = sectionState[pathKey] || {};
        pageState[sectionKey] = details.open;
        sectionState[pathKey] = pageState;
        writeJson(SECTION_STATE_KEY, sectionState);
      });

      annotateSectionForStudyMode(details);
    });
  }

  function sanitizeQuestionHtml(html) {
    return html
      .replace(/^\s*<strong>\s*Q(?:uestion)?\s*:?\s*<\/strong>\s*/i, '')
      .replace(/^\s*<em>\s*Q(?:uestion)?\s*:?\s*<\/em>\s*/i, '')
      .trim();
  }

  function sanitizeAnswerHtml(html) {
    return html
      .replace(/^\s*<strong>\s*A(?:nswer)?\s*:?\s*<\/strong>\s*/i, '')
      .replace(/^\s*<em>\s*A(?:nswer)?\s*:?\s*<\/em>\s*/i, '')
      .replace(/^\s*A(?:nswer)?\s*:\s*/i, '')
      .trim();
  }

  function extractQuestionAnswer(item) {
    const nestedList = Array.from(item.children).find((el) => el.tagName === 'UL' || el.tagName === 'OL');
    if (nestedList) {
      const answerRow = Array.from(nestedList.querySelectorAll(':scope > li')).find((li) =>
        /^(answer|a)\s*:?\s*/i.test((li.textContent || '').trim())
      );
      if (answerRow) {
        const questionClone = item.cloneNode(true);
        const nested = questionClone.querySelector('ul, ol');
        if (nested) nested.remove();
        const questionHtml = sanitizeQuestionHtml(questionClone.innerHTML);
        const answerHtml = sanitizeAnswerHtml(answerRow.innerHTML);
        if (questionHtml && answerHtml) {
          return { questionHtml, answerHtml };
        }
      }
    }

    const html = item.innerHTML;
    const markers = [/<strong>\s*A(?:nswer)?\s*:?\s*<\/strong>/i, /<em>\s*A(?:nswer)?\s*:?\s*<\/em>/i];
    for (const marker of markers) {
      const match = marker.exec(html);
      if (!match) continue;
      const questionHtml = sanitizeQuestionHtml(html.slice(0, match.index));
      const answerHtml = sanitizeAnswerHtml(html.slice(match.index + match[0].length));
      if (questionHtml && answerHtml) {
        return { questionHtml, answerHtml };
      }
    }

    return null;
  }

  function initExamPractice(article) {
    const examHeadings = Array.from(article.querySelectorAll('h1, h2, h3')).filter((heading) =>
      /exam-style questions/i.test(heading.textContent || '')
    );
    if (examHeadings.length === 0) {
      return;
    }

    const pathKey = window.location.pathname;
    const examState = readJson(EXAM_STATE_KEY, {});
    const pageExamState = examState[pathKey] || {};

    const persistExamState = () => {
      examState[pathKey] = pageExamState;
      writeJson(EXAM_STATE_KEY, examState);
    };

    examHeadings.forEach((heading) => {
      const section = heading.closest('.study-section');
      const scope = section ? section.querySelector(':scope > .study-section-body') : heading.parentElement;
      if (!scope) return;

      const list = Array.from(scope.children).find((el) => el.tagName === 'OL' || el.tagName === 'UL');
      if (!list) return;

      list.classList.add('exam-list');
      const items = Array.from(list.children).filter((el) => el.tagName === 'LI');
      if (items.length === 0) return;

      const progress = document.createElement('div');
      progress.className = 'exam-progress';
      progress.setAttribute('aria-live', 'polite');
      scope.insertBefore(progress, list);

      const cards = [];

      items.forEach((item, index) => {
        const parsed = extractQuestionAnswer(item);
        if (!parsed) return;

        const examId = `${heading.id || slugify(heading.textContent || 'exam')}-${index + 1}`;
        const prior = pageExamState[examId] || {};

        item.className = 'exam-card';
        item.dataset.examId = examId;
        item.dataset.status = prior.status === 'known' || prior.status === 'unknown' ? prior.status : '';
        item.innerHTML = '';

        const question = document.createElement('div');
        question.className = 'exam-question';
        question.innerHTML = parsed.questionHtml;

        const answer = document.createElement('div');
        answer.className = 'exam-answer';
        answer.innerHTML = parsed.answerHtml;
        answer.hidden = true;

        const controls = document.createElement('div');
        controls.className = 'exam-controls';

        const revealBtn = document.createElement('button');
        revealBtn.type = 'button';
        revealBtn.className = 'exam-btn reveal';
        revealBtn.textContent = 'Reveal answer';
        revealBtn.setAttribute('aria-expanded', 'false');
        revealBtn.addEventListener('click', () => {
          const willShow = answer.hidden;
          answer.hidden = !willShow;
          revealBtn.textContent = willShow ? 'Hide answer' : 'Reveal answer';
          revealBtn.setAttribute('aria-expanded', String(willShow));
        });

        const knownBtn = document.createElement('button');
        knownBtn.type = 'button';
        knownBtn.className = 'exam-btn mark known';
        knownBtn.textContent = 'Known';

        const unknownBtn = document.createElement('button');
        unknownBtn.type = 'button';
        unknownBtn.className = 'exam-btn mark unknown';
        unknownBtn.textContent = 'Unknown';

        const syncStatusButtons = () => {
          const status = item.dataset.status || '';
          knownBtn.classList.toggle('active', status === 'known');
          unknownBtn.classList.toggle('active', status === 'unknown');
        };

        const setStatus = (status) => {
          item.dataset.status = item.dataset.status === status ? '' : status;
          const nextStatus = item.dataset.status;
          if (nextStatus === 'known' || nextStatus === 'unknown') {
            pageExamState[examId] = { status: nextStatus };
          } else {
            delete pageExamState[examId];
          }
          persistExamState();
          syncStatusButtons();
          updateProgress();
        };

        knownBtn.addEventListener('click', () => setStatus('known'));
        unknownBtn.addEventListener('click', () => setStatus('unknown'));

        controls.append(revealBtn, knownBtn, unknownBtn);
        item.append(question, answer, controls);
        syncStatusButtons();
        cards.push(item);
      });

      const updateProgress = () => {
        const total = cards.length;
        const known = cards.filter((card) => card.dataset.status === 'known').length;
        const unknown = cards.filter((card) => card.dataset.status === 'unknown').length;
        progress.textContent = `Practice score: ${known}/${total} known${unknown ? ` • ${unknown} unknown` : ''}`;
      };

      updateProgress();
    });
  }

  function initStudyModeToggle() {
    const article = document.querySelector('.js-study-content');
    const header = document.querySelector('.study-page-header');
    if (!article || !header) {
      return;
    }

    const toolBar = document.createElement('div');
    toolBar.className = 'study-tools';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'study-mode-toggle';
    toggle.setAttribute('aria-pressed', 'false');

    const hint = document.createElement('p');
    hint.className = 'study-tools-hint';
    hint.textContent = 'Study mode keeps concise bullets visible and hides long details until you reveal them.';

    toolBar.append(toggle, hint);
    const metaGrid = header.querySelector('.meta-grid');
    if (metaGrid) {
      header.insertBefore(toolBar, metaGrid);
    } else {
      header.appendChild(toolBar);
    }

    const applyStudyMode = (enabled) => {
      root.classList.toggle('study-mode', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = enabled ? 'Study Mode: On' : 'Study Mode: Off';
    };

    const stored = localStorage.getItem(STUDY_MODE_KEY);
    applyStudyMode(stored === 'on');

    toggle.addEventListener('click', () => {
      const enabled = !root.classList.contains('study-mode');
      localStorage.setItem(STUDY_MODE_KEY, enabled ? 'on' : 'off');
      applyStudyMode(enabled);
    });
  }

  function initStudyPageEnhancements() {
    const article = document.querySelector('.js-study-content');
    if (!article) {
      return;
    }

    initCollapsibleSections(article);
    initExamPractice(article);
    initStudyModeToggle();
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function initTocAndProgress() {
    const article = document.querySelector('.js-study-content');
    if (!article) {
      return;
    }

    const tocList = document.querySelector('[data-toc-list]');
    const headings = Array.from(article.querySelectorAll('h1, h2, h3'));
    const majorHeadings = headings.filter((h) => h.tagName !== 'H3' || headings.length < 18).slice(0, 40);

    if (tocList) {
      tocList.innerHTML = '';
      const seen = new Set();
      majorHeadings.forEach((heading) => {
        if (!heading.id) {
          let id = slugify(heading.textContent || 'section');
          if (!id) {
            id = 'section';
          }
          while (seen.has(id) || document.getElementById(id)) {
            id = `${id}-x`;
          }
          heading.id = id;
        }
        seen.add(heading.id);

        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent || 'Section';
        link.dataset.tocLink = heading.id;
        link.addEventListener('click', () => {
          const section = heading.closest('.study-section');
          if (section && !section.open) {
            section.open = true;
          }
        });
        if (heading.tagName === 'H3') {
          link.style.paddingLeft = '1rem';
        }
        item.appendChild(link);
        tocList.appendChild(item);
      });
    }

    const tocLinks = Array.from(document.querySelectorAll('[data-toc-link]'));
    if (tocLinks.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            const id = entry.target.id;
            tocLinks.forEach((link) => {
              link.classList.toggle('active', link.dataset.tocLink === id);
            });
          });
        },
        {
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0.1,
        }
      );

      majorHeadings.forEach((heading) => observer.observe(heading));
    }

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      const section = target?.closest('.study-section');
      if (section && !section.open) {
        section.open = true;
      }
    }

    const progressBar = document.querySelector('[data-reading-progress]');
    if (progressBar) {
      const updateProgress = () => {
        const rect = article.getBoundingClientRect();
        const articleTop = window.scrollY + rect.top;
        const articleHeight = article.offsetHeight;
        const viewport = window.innerHeight;
        const amount = window.scrollY + viewport - articleTop;
        const ratio = Math.min(1, Math.max(0, amount / (articleHeight + viewport * 0.25)));
        progressBar.style.transform = `scaleX(${ratio})`;
      };

      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
    }
  }

  initTheme();
  initSlidesFilter();
  initStudyPageEnhancements();
  initTocAndProgress();
})();
