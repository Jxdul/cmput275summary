(function () {
  const THEME_KEY = 'cmput275-theme-mode';
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
  initTocAndProgress();
})();
