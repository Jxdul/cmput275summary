import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const summariesDir = path.join(root, 'summaries');
const examDir = path.join(root, 'examquestions');
const publicDir = path.join(root, 'public');
const publicSlidesDir = path.join(publicDir, 'slides');
const publicExamDir = path.join(publicDir, 'examquestions');

const lectures = [
  {
    id: '00_intro',
    title: 'Course Intro',
    slug: 'course-intro',
    track: 'orientation',
    trackLabel: 'Orientation',
    source: 'slides/00_intro.pdf',
    summary: 'Course logistics, grading, slip days, excused absences, and support workflow.',
    tags: ['policies', 'grading', 'slip days', 'forum'],
    prereq: 'None.',
  },
  {
    id: '01_shell',
    title: 'Shell and Bash Basics',
    slug: 'shell-bash-basics',
    track: 'shell-cli',
    trackLabel: 'Shell and CLI',
    source: 'slides/01_shell.pdf',
    summary: 'Operating systems, shell commands, paths, streams, redirection, pipes, permissions, SSH, and Bash scripts.',
    tags: ['bash', 'stdin', 'stdout', 'stderr', 'pipes', 'permissions'],
    prereq: 'Comfort using a terminal is helpful, but the lecture builds from first principles.',
  },
  {
    id: '02_c_pl',
    title: 'C Programming Foundations',
    slug: 'c-programming-foundations',
    track: 'c-core',
    trackLabel: 'C Core',
    source: 'slides/02_c_pl.pdf',
    summary: 'C as a compiled, statically typed language; number systems; basic syntax; functions; and memory layout.',
    tags: ['c', 'gcc', 'binary', 'types', 'functions', 'stack'],
    prereq: 'Basic programming experience from CMPUT 274 or equivalent.',
  },
  {
    id: '03_pointers',
    title: 'Pointers, Arrays, Input, and Strings',
    slug: 'pointers-arrays-strings',
    track: 'c-core',
    trackLabel: 'C Core',
    source: 'slides/03_pointers.pdf',
    summary: 'Pointers, address-of and dereference, scanf, robust input loops, array decay, pointer arithmetic, and C strings.',
    tags: ['pointers', 'arrays', 'scanf', 'strings', 'array decay'],
    prereq: 'C syntax, functions, basic memory model, and formatted I/O.',
  },
  {
    id: '04_dynamic_mem',
    title: 'Dynamic Memory Management',
    slug: 'dynamic-memory-management',
    track: 'data-memory',
    trackLabel: 'Data and Memory',
    source: 'slides/04_dynamic_mem.pdf',
    summary: 'Heap allocation, malloc/free, lifetimes, dangling pointers, leaks, growing arrays, and doubling capacity.',
    tags: ['malloc', 'free', 'heap', 'lifetime', 'doubling'],
    prereq: 'Pointers, arrays, scanf loops, and stack memory.',
  },
  {
    id: '05_cmd_line',
    title: 'Command Line Args and Multi-Dimensional Arrays',
    slug: 'command-line-args-and-2d-arrays',
    track: 'shell-cli',
    trackLabel: 'Shell and CLI',
    source: 'slides/05_cmd_line.pdf',
    summary: 'argc/argv, double pointers, strings from the OS, pointer-to-pointer 2D arrays, and flat 1D matrix storage.',
    tags: ['argc', 'argv', 'char**', '2d arrays', 'matrix'],
    prereq: 'Shell command-line arguments, C pointers, arrays, strings, malloc/free.',
  },
  {
    id: '06_mutation',
    title: 'Mutation and Double Pointers',
    slug: 'mutation-and-double-pointers',
    track: 'data-memory',
    trackLabel: 'Data and Memory',
    source: 'slides/06_mutation.pdf',
    summary: 'Returning extra values through pointer parameters, output parameters, and using double pointers to mutate caller-owned pointers.',
    tags: ['mutation', 'output parameter', 'double pointer', 'push'],
    prereq: 'Pointers, dynamic arrays, malloc/free, pass-by-value.',
  },
  {
    id: '07_structs',
    title: 'Structs and ADTs',
    slug: 'structs-and-adts',
    track: 'data-memory',
    trackLabel: 'Data and Memory',
    source: 'slides/07_structs.pdf',
    summary: 'C structs, member access, struct pointers, arrow operator, linked lists, ADT design, and encapsulation motivation.',
    tags: ['struct', 'adt', 'linked list', 'encapsulation'],
    prereq: 'Pointers, dynamic memory, mutation through pointers, arrays.',
  },
  {
    id: '08_sep_comp',
    title: 'Separate Compilation and Headers',
    slug: 'separate-compilation-and-headers',
    track: 'build',
    trackLabel: 'Build and Modularity',
    source: 'slides/08_sep_comp.pdf',
    summary: 'Declarations versus definitions, preprocessing, object files, linking, headers, incomplete types, and C encapsulation.',
    tags: ['headers', 'linker', 'preprocessor', 'object files', 'incomplete types'],
    prereq: 'C functions, structs, linked-list ADT implementation.',
  },
  {
    id: '09_cpp',
    title: 'Introduction to C++',
    slug: 'intro-to-cpp',
    track: 'cpp-core',
    trackLabel: 'C++ Core',
    source: 'slides/09_cpp.pdf',
    summary: 'Modern C++ style, g++, streams, stream state, manipulators, new/delete, function overloading, and operator overloading.',
    tags: ['c++', 'iostream', 'new', 'delete', 'overloading'],
    prereq: 'C compilation, C memory model, pointers, and basic ADT thinking.',
  },
  {
    id: '10_refs',
    title: 'References and Pass by Reference',
    slug: 'references-pass-by-reference',
    track: 'cpp-core',
    trackLabel: 'C++ Core',
    source: 'slides/10_refs.pdf',
    summary: 'References as aliases, reference rules, pass-by-reference, const references, returning references, and stream operators.',
    tags: ['references', 'const reference', 'operator overloading', 'istream', 'ostream'],
    prereq: 'C++ streams, pointers, mutation, and operator overloading basics.',
  },
  {
    id: '11_classes',
    title: 'Basic Classes',
    slug: 'basic-classes',
    track: 'cpp-oop',
    trackLabel: 'C++ OOP',
    source: 'slides/11_classes.pdf',
    summary: 'Classes, objects, methods, constructors, member initialization lists, access control, headers, getters/setters, and friends.',
    tags: ['classes', 'constructors', 'mil', 'private', 'friend'],
    prereq: 'C structs, ADTs, C++ references, streams, and separate compilation.',
  },
  {
    id: '13_big5',
    title: 'The Big 5',
    slug: 'the-big-5',
    track: 'cpp-oop',
    trackLabel: 'C++ OOP',
    source: 'slides/13_big5.pdf',
    summary: 'Destructors, copy constructors, copy assignment, move operations, copy elision, and the rule of five for resource-owning classes.',
    tags: ['destructor', 'copy constructor', 'copy assignment', 'move', 'raii'],
    prereq: 'C++ classes, heap allocation with new/delete, linked-list ADT, references.',
  },
];

const trackOrder = [
  ['orientation', 'Orientation', 'Policies and expectations before the technical material.'],
  ['shell-cli', 'Shell and CLI', 'Terminal workflow, program arguments, and data movement.'],
  ['c-core', 'C Core', 'C language mechanics, memory, input, arrays, and strings.'],
  ['data-memory', 'Data and Memory', 'Heap data, mutation patterns, structs, and ADTs.'],
  ['build', 'Build and Modularity', 'Compilation boundaries and reusable modules.'],
  ['cpp-core', 'C++ Core', 'Streams, references, allocation, and operator design.'],
  ['cpp-oop', 'C++ OOP', 'Classes and resource management.'],
];

const lectureCodeMap = {
  '00_intro': 'No lecture code for this administrative topic.',
  '01_shell': 'lecture_code/shell',
  '02_c_pl': 'lecture_code/cpl/smallExamples',
  '03_pointers': 'lecture_code/cpl/pointers, lecture_code/cpl/arrays, lecture_code/cpl/input',
  '04_dynamic_mem': 'lecture_code/cpl/dynamic',
  '05_cmd_line': 'lecture_code/cpl/multiDim',
  '06_mutation': 'lecture_code/cpl/mutation',
  '07_structs': 'lecture_code/cpl/aggregate, lecture_code/cpl/adt, lecture_code/cpl/trees',
  '08_sep_comp': 'lecture_code/cpl/sep_comp',
  '09_cpp': 'lecture_code/cpp/io, lecture_code/cpp/alloc, lecture_code/cpp/overload, lecture_code/cpp/stringsAndStreams',
  '10_refs': 'lecture_code/cpp/refs, lecture_code/cpp/overload/points',
  '11_classes': 'lecture_code/cpp/classes, lecture_code/cpp/oop',
  '13_big5': 'lecture_code/cpp/big5, lecture_code/cpp/raii',
};

function ensureDirs() {
  for (const dir of [summariesDir, examDir, publicDir, publicSlidesDir, publicExamDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let listStack = [];
  let inCode = false;
  let code = [];

  const closeParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const closeListsTo = (indent) => {
    while (listStack.length > indent) {
      html.push(`</${listStack.pop()}>`);
    }
  };

  const closeAllLists = () => closeListsTo(0);

  const listItemHtml = (text) => {
    const className = /:\s*$/.test(text) ? ' class="list-subheading"' : '';
    return `<li${className}>${inlineMarkdown(text)}</li>`;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    const codeFence = line.match(/^```(.*)$/);
    if (codeFence) {
      closeParagraph();
      closeAllLists();
      if (!inCode) {
        inCode = true;
        code = [];
      } else {
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        inCode = false;
        code = [];
      }
      continue;
    }

    if (inCode) {
      code.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      closeParagraph();
      closeAllLists();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeAllLists();
      const level = Math.min(heading[1].length, 3);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bullet) {
      closeParagraph();
      const indent = 1;
      while (listStack.length < indent) {
        html.push('<ul>');
        listStack.push('ul');
      }
      if (listStack[indent - 1] !== 'ul') {
        closeListsTo(indent - 1);
        html.push('<ul>');
        listStack.push('ul');
      }
      closeListsTo(indent);
      html.push(listItemHtml(bullet[2]));
      continue;
    }

    const ordered = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (ordered) {
      closeParagraph();
      const indent = 1;
      while (listStack.length < indent) {
        html.push('<ol>');
        listStack.push('ol');
      }
      if (listStack[indent - 1] !== 'ol') {
        closeListsTo(indent - 1);
        html.push('<ol>');
        listStack.push('ol');
      }
      closeListsTo(indent);
      html.push(listItemHtml(ordered[2]));
      continue;
    }

    closeAllLists();
    paragraph.push(line.trim());
  }

  closeParagraph();
  closeAllLists();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  }
  return html.join('\n');
}

function pageShell({ title, description, current = '', body, extraScripts = '' }) {
  const nav = [
    ['/', 'Home'],
    ['/slides/', 'Slides'],
    ['/exam-practice/', 'Exam Practice'],
    ['/code/', 'Code'],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | CMPUT 275 Summaries</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="reading-progress" data-reading-progress aria-hidden="true"></div>
  <header class="site-header">
    <div class="site-shell site-nav">
      <a class="brand" href="/">
        <span class="brand-mark" aria-hidden="true">275</span>
        <span>CMPUT 275 Summaries</span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        ${nav.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('\n        ')}
      </nav>
      <div class="nav-right">
        <div class="theme-toggle" role="group" aria-label="Theme preference">
          <button type="button" data-theme-option="auto" aria-pressed="false">Auto</button>
          <button type="button" data-theme-option="light" aria-pressed="false">Light</button>
          <button type="button" data-theme-option="dark" aria-pressed="false">Dark</button>
        </div>
      </div>
    </div>
  </header>
  <main class="page-main site-shell" id="main-content">
${body}
  </main>
  <script src="/site.js" defer></script>
${extraScripts}
</body>
</html>
`;
}

function renderLecturePage(lecture, index) {
  const summaryPath = path.join(summariesDir, `${lecture.id}.md`);
  const markdown = fs.readFileSync(summaryPath, 'utf8');
  const prev = lectures[index - 1];
  const next = lectures[index + 1];
  const codeRefs = lectureCodeMap[lecture.id] || 'lecture_code/';
  const body = `    <p class="breadcrumb"><a href="/slides/">Slides</a> / <span>${escapeHtml(lecture.title)}</span></p>
    <section class="study-layout">
      <header class="study-page-header">
        <p class="kicker">${escapeHtml(lecture.trackLabel)}</p>
        <h1>${escapeHtml(lecture.title)}</h1>
        <p>${escapeHtml(lecture.summary)}</p>
        <div class="meta-grid">
          <article class="meta-card">
            <h2>Lecture File</h2>
            <p>${escapeHtml(lecture.source)}</p>
          </article>
          <article class="meta-card">
            <h2>Prerequisites</h2>
            <p>${escapeHtml(lecture.prereq)}</p>
          </article>
          <article class="meta-card">
            <h2>Practice Deck</h2>
            <p><a href="/exam-practice/?deck=${escapeHtml(lecture.id)}">${escapeHtml(lecture.id)}.txt</a></p>
          </article>
          <article class="meta-card">
            <h2>Lecture Code</h2>
            <p><code>${escapeHtml(codeRefs)}</code></p>
          </article>
        </div>
        <div class="learning-flow" aria-label="How to study this lecture">
          <article>
            <strong>1. Read</strong>
            <span>Start with Big picture, then Deep study notes.</span>
          </article>
          <article>
            <strong>2. Trace</strong>
            <span>Open the listed lecture-code files and follow the memory or stream state.</span>
          </article>
          <article>
            <strong>3. Check</strong>
            <span>Use Pitfalls and Quick reference to catch common mistakes.</span>
          </article>
          <article>
            <strong>4. Practice</strong>
            <span>Finish with the matching exam-practice deck.</span>
          </article>
        </div>
        <div class="lecture-actions">
          ${prev ? `<a class="btn" href="/slides/${prev.slug}.html">Previous: ${escapeHtml(prev.id)}</a>` : '<a class="btn" href="/slides/">Slides Hub</a>'}
          <a class="btn primary" href="/exam-practice/?deck=${escapeHtml(lecture.id)}">Practice ${escapeHtml(lecture.id)}</a>
          ${next ? `<a class="btn" href="/slides/${next.slug}.html">Next: ${escapeHtml(next.id)}</a>` : '<a class="btn" href="/slides/">Back to Slides</a>'}
        </div>
      </header>
      <div class="study-content-wrap">
        <article class="study-article js-study-content">
${markdownToHtml(markdown)}
        </article>
        <nav class="toc" aria-label="On this page">
          <h2>On this page</h2>
          <ul data-toc-list></ul>
        </nav>
        <nav class="page-nav" aria-label="Lecture sequence">
          ${prev ? `<a href="/slides/${prev.slug}.html"><span>Previous</span>${escapeHtml(prev.title)}</a>` : '<a href="/slides/"><span>Previous</span>Slides Hub</a>'}
          <a href="/slides/?track=${lecture.track}"><span>Back to Track</span>${escapeHtml(lecture.trackLabel)}</a>
          ${next ? `<a href="/slides/${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : '<a href="/exam-practice/"><span>Next</span>Exam Practice</a>'}
        </nav>
        <p class="callout">Built from <code>summaries/${escapeHtml(lecture.id)}.md</code> and reviewed against <code>${escapeHtml(lecture.source)}</code> plus matching files in <code>lecture_code/</code>.</p>
      </div>
    </section>`;

  return pageShell({
    title: lecture.title,
    description: lecture.summary,
    current: '/slides/',
    body,
  });
}

function renderSlidesIndex() {
  const orderedCards = lectures.map((lecture, index) => `          <a class="slide-card lecture-card" href="/slides/${lecture.slug}.html" data-slide-card data-track="${lecture.track}" data-title="${escapeHtml(lecture.title.toLowerCase())}" data-tags="${escapeHtml(lecture.tags.join(' '))}">
            <span class="lecture-number">${escapeHtml(lecture.id.slice(0, 2))}</span>
            <h3>${escapeHtml(lecture.id)}: ${escapeHtml(lecture.title)}</h3>
            <p>${escapeHtml(lecture.summary)}</p>
            <div class="slide-meta"><span class="tag">${escapeHtml(lecture.trackLabel)}</span><span class="tag">${escapeHtml(lecture.source)}</span></div>
          </a>`).join('\n');

  const body = `    <section class="hero">
      <p class="kicker">Slides Hub</p>
      <h1>Lecture summaries from 00 upward.</h1>
      <p>Work top to bottom the first time. Each lecture page gives you a read, trace, check, and practice loop tied back to the lecture code.</p>
      <div class="slides-controls">
        <label class="sr-only" for="slides-search">Search lecture summaries</label>
        <input id="slides-search" class="search-input" type="search" placeholder="Search topics, terms, or file names..." data-search-input>
        <div class="filter-row" role="group" aria-label="Filter by track">
          <button type="button" class="filter-chip active" data-track-filter="all" aria-pressed="true">All Tracks</button>
${trackOrder.map(([track, label]) => `          <button type="button" class="filter-chip" data-track-filter="${track}" aria-pressed="false">${escapeHtml(label)}</button>`).join('\n')}
        </div>
        <p class="results-line" data-results-count>${lectures.length} lectures shown</p>
      </div>
    </section>
    <section class="section learning-panel" aria-labelledby="learn-method-heading">
      <h2 id="learn-method-heading">Use the same method for every lecture</h2>
      <div class="learning-flow">
        <article><strong>Read</strong><span>Build the concept from the summary before opening questions.</span></article>
        <article><strong>Trace</strong><span>Follow the related files in <code>lecture_code/</code> line by line.</span></article>
        <article><strong>Recall</strong><span>Close the summary and answer the embedded questions out loud.</span></article>
        <article><strong>Practice</strong><span>Use Exam Practice until missed cards become known.</span></article>
      </div>
    </section>
    <section class="track-grid section" aria-label="Lecture tracks">
      <article class="track-card" data-track-section>
        <div class="track-header">
          <h2 class="track-title">Lecture Order</h2>
          <p class="track-rationale">The slide decks appear in numeric order from 00 through 13.</p>
        </div>
        <div class="slide-grid">
${orderedCards}
        </div>
      </article>
    </section>
    <div class="empty-state" data-empty-state hidden>
      No lectures match the current filters. Try a broader keyword or switch to All Tracks.
    </div>`;

  return pageShell({
    title: 'Slides',
    description: 'CMPUT 275 lecture summaries organized by study track.',
    current: '/slides/',
    body: `    <div data-slides-hub>
${body}
    </div>`,
  });
}

function renderHome() {
  const body = `    <section class="hero">
      <p class="kicker">CMPUT 275</p>
      <h1>Learn the course from summaries, code traces, and practice.</h1>
      <p>Read each lecture in order, trace the matching lecture code, then drill the exam deck until the ideas are usable without the slides.</p>
      <div class="cta-row">
        <a class="btn primary" href="/slides/">Start Studying</a>
        <a class="btn" href="/exam-practice/">Open Exam Practice</a>
        <a class="btn" href="/code/">Find Lecture Code</a>
      </div>
      <div class="stats-grid" aria-label="Site statistics">
        <article class="stat-card"><strong>${lectures.length}</strong><span>Lecture summaries</span></article>
        <article class="stat-card"><strong>${trackOrder.length}</strong><span>Topic tracks</span></article>
        <article class="stat-card"><strong>13</strong><span>PDF decks covered</span></article>
        <article class="stat-card"><strong>1</strong><span>Course sequence</span></article>
      </div>
    </section>
    <section class="section learning-panel" aria-labelledby="method-heading">
      <h2 id="method-heading">Study Method</h2>
      <div class="learning-flow">
        <article><strong>1. Read the lecture page</strong><span>Use the Big picture first, then work through the detailed sections.</span></article>
        <article><strong>2. Trace the code</strong><span>Open the listed lecture-code files and predict values, pointers, or stream state.</span></article>
        <article><strong>3. Explain pitfalls</strong><span>If you cannot explain why a bug happens, reread that section before moving on.</span></article>
        <article><strong>4. Drill questions</strong><span>Use known/unknown marking in Exam Practice to focus review.</span></article>
      </div>
    </section>
    <section class="section" aria-labelledby="path-heading">
      <h2 id="path-heading">Recommended Study Path</h2>
      <p>Read in order the first time. Later, use the tracks to target weaker topics.</p>
      <div class="study-order">
        <strong>Full lecture order:</strong>
        <ol>
${lectures.map((lecture) => `          <li><a href="/slides/${lecture.slug}.html">${escapeHtml(lecture.id)}: ${escapeHtml(lecture.title)}</a></li>`).join('\n')}
        </ol>
      </div>
    </section>`;
  return pageShell({
    title: 'Home',
    description: 'Large CMPUT 275 summaries, code references, and exam practice.',
    current: '/',
    body,
  });
}

function renderExamPractice() {
  const deckCards = lectures.map((lecture) => `          <button type="button" class="path-card deck-card" data-deck-id="${lecture.id}" data-deck-file="${lecture.id}.txt" data-deck-name="${escapeHtml(lecture.title)}">
            <h3>${escapeHtml(lecture.id)}: ${escapeHtml(lecture.title)}</h3>
            <p>${escapeHtml(lecture.summary)}</p>
          </button>`).join('\n');

  const body = `    <section class="hero" data-exam-deck-selector>
      <p class="kicker">Exam Practice</p>
      <h1>Practice by slide deck.</h1>
      <p>Choose a deck after reading its lecture page. Mark missed cards as unknown, then repeat until the deck is mostly known.</p>
      <div class="section deck-picker">
        <h2 id="deck-heading">Choose a deck</h2>
        <div class="path-grid" role="group" aria-labelledby="deck-heading" data-deck-grid>
${deckCards}
        </div>
      </div>
    </section>
    <section class="section" data-exam-session hidden>
      <div class="exam-session-header">
        <p class="exam-session-title" data-exam-deck-name></p>
        <button type="button" class="btn exam-back-btn" data-exam-back>Choose another deck</button>
      </div>
      <div class="exam-progress" aria-live="polite" data-exam-progress></div>
      <div class="exam-one-question" data-exam-one-question>
        <p class="exam-question-index" data-exam-question-index aria-live="polite"></p>
        <div class="exam-card" data-exam-card aria-current="true" role="article">
          <div class="exam-question" data-exam-question-text></div>
          <div class="exam-answer" data-exam-answer hidden></div>
          <div class="exam-controls">
            <button type="button" class="exam-btn reveal" data-exam-reveal aria-expanded="false">Reveal answer</button>
            <button type="button" class="exam-btn mark known" data-exam-known>Known</button>
            <button type="button" class="exam-btn mark unknown" data-exam-unknown>Unknown</button>
            <button type="button" class="exam-btn" data-exam-shuffle>Shuffle</button>
          </div>
        </div>
      </div>
      <div class="exam-nav">
        <button type="button" class="exam-btn" data-exam-prev>Previous</button>
        <button type="button" class="exam-btn" data-exam-next>Next</button>
      </div>
    </section>
    <div class="section" data-exam-loading hidden><p>Loading questions...</p></div>
    <div class="section" data-exam-error hidden><p class="exam-error-message" data-exam-error-message></p></div>`;

  return pageShell({
    title: 'Exam Practice',
    description: 'Practice exam-style questions by slide deck.',
    current: '/exam-practice/',
    body: `<div data-exam-practice-page>\n${body}\n    </div>`,
    extraScripts: '  <script src="/exam-practice.js" defer></script>',
  });
}

function renderCodePage() {
  const groups = [
    ['Shell scripts and streams', 'lecture_code/shell', 'Arguments, redirection, pipes, stdout/stderr examples, and reusable Bash scripts.'],
    ['C fundamentals', 'lecture_code/cpl/smallExamples', 'Hello world, types, character/integer behavior, conditions, loops, and bitwise examples.'],
    ['Pointers, arrays, and input', 'lecture_code/cpl/pointers, lecture_code/cpl/arrays, lecture_code/cpl/input', 'Pointer aliasing, array decay, strings, scanf failure handling, and wc-style input processing.'],
    ['Dynamic memory and ADTs', 'lecture_code/cpl/dynamic, lecture_code/cpl/mutation, lecture_code/cpl/aggregate, lecture_code/cpl/sep_comp', 'Growing arrays, output parameters, structs, linked lists, headers, and incomplete types.'],
    ['C++ core and OOP', 'lecture_code/cpp', 'Streams, references, constructors, classes, operator overloads, and Big 5 resource ownership.'],
  ];

  const body = `    <section class="hero">
      <p class="kicker">Code References</p>
      <h1>Lecture code mapped to the summaries.</h1>
      <p>Use these folders while reading the summaries. The fastest way to learn the memory topics is to trace the lecture code beside the explanations.</p>
    </section>
    <section class="section" aria-labelledby="code-map-heading">
      <h2 id="code-map-heading">Code Map</h2>
      <div class="roadmap-grid">
${groups.map(([title, dir, desc]) => `        <article class="roadmap-card">
          <h3>${escapeHtml(title)}</h3>
          <p><code>${escapeHtml(dir)}</code></p>
          <p>${escapeHtml(desc)}</p>
        </article>`).join('\n')}
      </div>
    </section>
    <section class="section" aria-labelledby="lecture-code-heading">
      <h2 id="lecture-code-heading">Where to Start</h2>
      <p>Open a summary first, then use its lecture-code section to decide which source file to trace. The code is most useful when read with the matching PDF topic beside it.</p>
      <div class="path-grid">
${lectures.filter((lecture) => lecture.track !== 'orientation').map((lecture) => `        <a class="path-card" href="/slides/${lecture.slug}.html">
          <h3>${escapeHtml(lecture.title)}</h3>
          <p>${escapeHtml(lecture.summary)}</p>
        </a>`).join('\n')}
      </div>
    </section>`;

  return pageShell({
    title: 'Code',
    description: 'Lecture code map for CMPUT 275 summaries.',
    current: '/code/',
    body,
  });
}

function syncExamDecks() {
  const expectedDecks = new Set(lectures.map((lecture) => `${lecture.id}.txt`));
  for (const entry of fs.readdirSync(publicExamDir)) {
    if (entry.endsWith('.txt') && !expectedDecks.has(entry)) {
      fs.unlinkSync(path.join(publicExamDir, entry));
    }
  }

  for (const lecture of lectures) {
    const source = path.join(examDir, `${lecture.id}.txt`);
    const dest = path.join(publicExamDir, `${lecture.id}.txt`);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
    }
  }
}

function validateSourceContent() {
  const missingSummaries = lectures
    .map((lecture) => path.join(summariesDir, `${lecture.id}.md`))
    .filter((summaryPath) => !fs.existsSync(summaryPath));
  const missingExamDecks = lectures
    .map((lecture) => path.join(examDir, `${lecture.id}.txt`))
    .filter((deckPath) => !fs.existsSync(deckPath));

  if (missingSummaries.length || missingExamDecks.length) {
    const details = [
      ...missingSummaries.map((summaryPath) => `Missing summary: ${path.relative(root, summaryPath)}`),
      ...missingExamDecks.map((deckPath) => `Missing exam deck: ${path.relative(root, deckPath)}`),
    ].join('\n');
    throw new Error(`Cannot build study site with missing source content:\n${details}`);
  }
}

function build() {
  ensureDirs();
  validateSourceContent();
  for (const [index, lecture] of lectures.entries()) {
    fs.writeFileSync(path.join(publicSlidesDir, `${lecture.slug}.html`), renderLecturePage(lecture, index));
  }
  fs.writeFileSync(path.join(publicSlidesDir, 'index.html'), renderSlidesIndex());
  fs.writeFileSync(path.join(publicDir, 'index.html'), renderHome());
  fs.mkdirSync(path.join(publicDir, 'exam-practice'), { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'exam-practice', 'index.html'), renderExamPractice());
  fs.mkdirSync(path.join(publicDir, 'code'), { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'code', 'index.html'), renderCodePage());
  syncExamDecks();
}

build();
