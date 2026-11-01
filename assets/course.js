// Learn C — shared course runtime.
// Every page includes this one script. It builds the layout (header, sidebar,
// prev/next), loads syntax highlighting, and turns declarative markup into
// interactive components:
//
//   <script type="text/c">...</script>                 runnable, editable example
//   <script type="text/c" data-static>...</script>     highlighted, read-only code
//   <div class="exercise" data-id="...">               auto-checked coding exercise
//   <script type="application/json" class="quiz">      quiz (multiple choice + predict-the-output)
//   <div class="memviz">                               step-through memory diagram
//
// Code goes inside <script> tags so authors never have to HTML-escape < > &.
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Course outline — the single source of truth for navigation and progress.
  // ---------------------------------------------------------------------------
  const PARTS = [
    { id: 'foundations', title: 'Foundations' },
    { id: 'memory', title: 'Pointers & Memory' },
    { id: 'beyond', title: 'Building Real Programs' },
  ];

  const MODULES = [
    { id: 'getting-started', file: 'getting-started.html', part: 'foundations', title: 'Getting Started', blurb: 'Your first program, how compilation works, and printf.' },
    { id: 'variables-and-types', file: 'variables-and-types.html', part: 'foundations', title: 'Variables & Types', blurb: 'int, char, double, sizeof, format specifiers and reading input.' },
    { id: 'operators', file: 'operators.html', part: 'foundations', title: 'Operators & Expressions', blurb: 'Arithmetic, integer division, comparisons, logic, casts and bits.' },
    { id: 'control-flow', file: 'control-flow.html', part: 'foundations', title: 'Control Flow', blurb: 'if/else, switch, while, for, do-while, break and continue.' },
    { id: 'functions', file: 'functions.html', part: 'foundations', title: 'Functions', blurb: 'Prototypes, parameters, return values, scope and recursion.' },
    { id: 'arrays', file: 'arrays.html', part: 'foundations', title: 'Arrays', blurb: 'Fixed-size collections, loops over arrays, 2D arrays.' },
    { id: 'strings', file: 'strings.html', part: 'foundations', title: 'Strings', blurb: 'char arrays, the null terminator and <string.h>.' },
    { id: 'introduction', file: 'introduction.html', part: 'memory', title: 'Pointer Basics', blurb: 'Addresses, & and *, and what a pointer really is.' },
    { id: 'pointer-arithmetic', file: 'pointer-arithmetic.html', part: 'memory', title: 'Pointer Arithmetic', blurb: 'Why p + 1 moves by sizeof(*p) bytes.' },
    { id: 'pointers-and-arrays', file: 'pointers-and-arrays.html', part: 'memory', title: 'Pointers & Arrays', blurb: 'Array decay, a[i] == *(a + i), and where they differ.' },
    { id: 'pointers-and-functions', file: 'pointers-and-functions.html', part: 'memory', title: 'Pointers & Functions', blurb: 'Pass-by-pointer, output parameters, and dangling pointers.' },
    { id: 'dynamic-memory-allocation', file: 'dynamic-memory-allocation.html', part: 'memory', title: 'Dynamic Memory', blurb: 'malloc, calloc, realloc, free — and how leaks happen.' },
    { id: 'structs', file: 'structs.html', part: 'beyond', title: 'Structs, Enums & Unions', blurb: 'Grouping data, typedef, -> and memory layout.' },
    { id: 'advanced-pointers', file: 'advanced-pointers.html', part: 'beyond', title: 'Advanced Pointers', blurb: 'Pointers to pointers, function pointers, void * and const.' },
    { id: 'file-io', file: 'file-io.html', part: 'beyond', title: 'File I/O', blurb: 'fopen, fprintf, fgets, fread and error handling.' },
    { id: 'preprocessor', file: 'preprocessor.html', part: 'beyond', title: 'Preprocessor & Multi-file', blurb: '#define, macros, header files and include guards.' },
    { id: 'linked-list-project', file: 'linked-list-project.html', part: 'beyond', title: 'Capstone: Linked List', blurb: 'Build a dynamic linked list using everything you know.' },
  ];

  const COMPILER_ID = 'cg152'; // x86-64 gcc 15.2 on Compiler Explorer
  const COMPILE_URL = 'https://godbolt.org/api/compiler/' + COMPILER_ID + '/compile';
  const COMPILER_FLAGS = '-std=c17 -O0 -Wall -Wextra -Wno-unused-parameter -fdiagnostics-color=never -lm';
  const PASS_THRESHOLD = 80;

  // ---------------------------------------------------------------------------
  // Storage (always optional — private windows may block it)
  // ---------------------------------------------------------------------------
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('learnc.' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('learnc.' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
    remove(key) {
      try { localStorage.removeItem('learnc.' + key); } catch (e) { /* ignore */ }
    },
  };

  function getProgress() { return store.get('progress', {}); }
  function lessonProgress(id) {
    const all = getProgress();
    return all[id] || { quiz: null, ex: {}, done: false };
  }
  function saveLessonProgress(id, data) {
    const all = getProgress();
    all[id] = data;
    store.set('progress', all);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    (children || []).forEach((c) => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Strip the leading newline and common indentation from code inside a <script>.
  function dedent(text) {
    const lines = text.replace(/\t/g, '    ').split('\n');
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    const indent = lines.filter((l) => l.trim()).reduce((min, l) => Math.min(min, l.match(/^ */)[0].length), Infinity);
    return lines.map((l) => l.slice(indent === Infinity ? 0 : indent)).join('\n');
  }

  function highlight(code) {
    if (window.Prism && Prism.languages && Prism.languages.c) {
      return Prism.highlight(code, Prism.languages.c, 'c');
    }
    return escapeHtml(code);
  }

  function normalizeOutput(s) {
    return String(s).replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = resolve; // highlighting is a nice-to-have
      document.head.appendChild(s);
    });
  }

  const currentFile = (location.pathname.split('/').pop() || 'index.html');
  const currentModule = MODULES.find((m) => m.file === currentFile) || null;

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme(store.get('theme', null));

  function currentThemeIsDark() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // ---------------------------------------------------------------------------
  // Layout: header, sidebar, prev/next, footer
  // ---------------------------------------------------------------------------
  function buildLayout() {
    const main = document.querySelector('main');
    if (!main) return;

    const themeBtn = el('button', {
      class: 'icon-btn', type: 'button', 'aria-label': 'Toggle dark mode', title: 'Toggle dark mode',
      onclick: () => {
        const next = currentThemeIsDark() ? 'light' : 'dark';
        applyTheme(next);
        store.set('theme', next);
      },
    }, [el('span', { class: 'theme-icon', 'aria-hidden': 'true' })]);

    const menuBtn = el('button', {
      class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'Open course outline', 'aria-expanded': 'false',
      onclick: () => {
        const open = document.body.classList.toggle('nav-open');
        menuBtn.setAttribute('aria-expanded', String(open));
      },
    }, [el('span', { class: 'menu-icon', 'aria-hidden': 'true' })]);

    const header = el('header', { class: 'site-header' }, [
      menuBtn,
      el('a', { class: 'brand', href: 'index.html' }, [
        el('span', { class: 'brand-mark', 'aria-hidden': 'true', text: 'C' }),
        el('span', { class: 'brand-name', text: 'Learn C' }),
      ]),
      el('nav', { class: 'header-links' }, [
        el('a', { href: 'index.html', class: currentFile === 'index.html' ? 'active' : null, text: 'Course' }),
        el('a', { href: 'playground.html', class: currentFile === 'playground.html' ? 'active' : null, text: 'Playground' }),
      ]),
      themeBtn,
    ]);

    const sidebar = el('aside', { class: 'sidebar', 'aria-label': 'Course outline' }, [buildOutline()]);
    const scrim = el('div', { class: 'scrim', onclick: () => { document.body.classList.remove('nav-open'); menuBtn.setAttribute('aria-expanded', 'false'); } });

    const shell = el('div', { class: 'shell' + (currentModule || currentFile === 'playground.html' ? '' : ' shell-wide') });
    main.parentNode.insertBefore(shell, main);
    if (currentModule || currentFile === 'playground.html') shell.appendChild(sidebar);
    shell.appendChild(main);
    main.classList.add('content');

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(scrim);

    if (currentModule) {
      main.classList.add('lesson');
      decorateLesson(main);
    }

    main.appendChild(el('footer', { class: 'site-footer' }, [
      el('p', { html: 'Learn C &middot; by James Kelly &middot; Code runs on <a href="https://godbolt.org" target="_blank" rel="noopener">Compiler Explorer</a>' }),
    ]));
  }

  function buildOutline() {
    const progress = getProgress();
    const wrap = el('div', { class: 'outline' });
    PARTS.forEach((part) => {
      wrap.appendChild(el('p', { class: 'outline-part', text: part.title }));
      const list = el('ol', { class: 'outline-list' });
      MODULES.filter((m) => m.part === part.id).forEach((m) => {
        const n = MODULES.indexOf(m) + 1;
        const done = progress[m.id] && progress[m.id].done;
        list.appendChild(el('li', null, [
          el('a', {
            href: m.file,
            class: (m === currentModule ? 'active ' : '') + (done ? 'done' : ''),
            'aria-current': m === currentModule ? 'page' : null,
          }, [
            el('span', { class: 'outline-num', 'aria-hidden': 'true', text: done ? '✓' : String(n) }),
            el('span', { class: 'outline-title', text: m.title }),
            done ? el('span', { class: 'sr-only', text: ' (completed)' }) : null,
          ]),
        ]));
      });
      wrap.appendChild(list);
    });
    return wrap;
  }

  function refreshOutline() {
    document.querySelectorAll('.sidebar').forEach((s) => { s.innerHTML = ''; s.appendChild(buildOutline()); });
  }

  function decorateLesson(main) {
    const idx = MODULES.indexOf(currentModule);
    const part = PARTS.find((p) => p.id === currentModule.part);
    const h1 = main.querySelector('h1');
    const eyebrow = el('p', { class: 'eyebrow', text: 'Lesson ' + (idx + 1) + ' of ' + MODULES.length + ' · ' + part.title });
    if (h1) h1.parentNode.insertBefore(eyebrow, h1);
    else main.insertBefore(eyebrow, main.firstChild);
    store.set('last', currentModule.id);

    // Completion card + prev/next
    const prev = MODULES[idx - 1];
    const next = MODULES[idx + 1];
    const completeBox = el('section', { class: 'complete-box', 'aria-live': 'polite' });
    main.appendChild(completeBox);
    renderCompleteBox(completeBox);

    main.appendChild(el('nav', { class: 'pager', 'aria-label': 'Lesson navigation' }, [
      prev ? el('a', { class: 'pager-prev', href: prev.file }, [el('span', { class: 'pager-label', text: '← Previous' }), el('span', { class: 'pager-title', text: prev.title })]) : el('span'),
      next ? el('a', { class: 'pager-next', href: next.file }, [el('span', { class: 'pager-label', text: 'Next →' }), el('span', { class: 'pager-title', text: next.title })]) : el('a', { class: 'pager-next', href: 'index.html' }, [el('span', { class: 'pager-label', text: 'Finished!' }), el('span', { class: 'pager-title', text: 'Back to the course' })]),
    ]));
  }

  function lessonRequirements() {
    const exercises = Array.from(document.querySelectorAll('.exercise')).map((e) => e.dataset.id);
    const hasQuiz = !!document.querySelector('.quiz-block');
    return { exercises, hasQuiz };
  }

  function renderCompleteBox(box) {
    if (!currentModule) return;
    const p = lessonProgress(currentModule.id);
    const req = lessonRequirements();
    const exDone = req.exercises.filter((id) => p.ex && p.ex[id]).length;
    const quizOk = !req.hasQuiz || (p.quiz !== null && p.quiz >= PASS_THRESHOLD);
    box.innerHTML = '';
    const items = [];
    if (req.exercises.length) items.push(el('li', { class: exDone === req.exercises.length ? 'ok' : '' , text: 'Exercises passed: ' + exDone + ' / ' + req.exercises.length }));
    if (req.hasQuiz) items.push(el('li', { class: quizOk ? 'ok' : '', text: 'Quiz: ' + (p.quiz === null ? 'not taken' : p.quiz + '%') + ' (need ' + PASS_THRESHOLD + '%)' }));
    box.appendChild(el('h2', { text: p.done ? 'Lesson complete ✓' : 'Finish this lesson' }));
    box.appendChild(el('ul', { class: 'checklist' }, items));
    box.appendChild(el('button', {
      class: 'btn ' + (p.done ? 'btn-ghost' : 'btn-primary'), type: 'button',
      text: p.done ? 'Mark as not complete' : 'Mark lesson complete',
      onclick: () => {
        const cur = lessonProgress(currentModule.id);
        cur.done = !cur.done;
        saveLessonProgress(currentModule.id, cur);
        renderCompleteBox(box);
        refreshOutline();
      },
    }));
  }

  // Called whenever an exercise passes or a quiz finishes.
  function recordProgress(update) {
    if (!currentModule) return;
    const p = lessonProgress(currentModule.id);
    p.ex = p.ex || {};
    if (update.exercise) p.ex[update.exercise] = true;
    if (typeof update.quiz === 'number') p.quiz = Math.max(p.quiz || 0, update.quiz);
    const req = lessonRequirements();
    const allEx = req.exercises.every((id) => p.ex[id]);
    const quizOk = !req.hasQuiz || (p.quiz !== null && p.quiz >= PASS_THRESHOLD);
    const newlyDone = !p.done && allEx && quizOk;
    if (newlyDone) p.done = true;
    saveLessonProgress(currentModule.id, p);
    const box = document.querySelector('.complete-box');
    if (box) renderCompleteBox(box);
    refreshOutline();
    if (newlyDone) toast('Lesson complete! 🎉');
  }

  function toast(message) {
    const t = el('div', { class: 'toast', role: 'status', text: message });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  // ---------------------------------------------------------------------------
  // Code editor (textarea layered over a highlighted <pre>)
  // ---------------------------------------------------------------------------
  function createEditor(initial, opts) {
    opts = opts || {};
    const pre = el('pre', { class: 'editor-hl', 'aria-hidden': 'true' });
    const code = el('code', { class: 'language-c' });
    pre.appendChild(code);
    const ta = el('textarea', {
      class: 'editor-input', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off',
      'aria-label': opts.label || 'C code editor',
    });
    ta.value = initial;
    const wrap = el('div', { class: 'editor' }, [pre, ta]);

    function sync() {
      // A trailing newline needs a placeholder char or the <pre> collapses it.
      code.innerHTML = highlight(ta.value) + (ta.value.endsWith('\n') ? ' ' : '');
    }
    let escaped = false;
    ta.addEventListener('input', () => { sync(); if (opts.onChange) opts.onChange(ta.value); });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { escaped = true; return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (opts.onRun) opts.onRun();
        return;
      }
      if (e.key === 'Tab' && !escaped && !e.shiftKey) {
        e.preventDefault();
        insertText(ta, '    ');
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        const before = ta.value.slice(0, ta.selectionStart);
        const line = before.slice(before.lastIndexOf('\n') + 1);
        let indent = line.match(/^\s*/)[0];
        if (/\{\s*$/.test(line)) indent += '    ';
        e.preventDefault();
        insertText(ta, '\n' + indent);
        return;
      }
      if (e.key === '}') {
        // De-indent a closing brace typed on an otherwise blank line.
        const before = ta.value.slice(0, ta.selectionStart);
        const line = before.slice(before.lastIndexOf('\n') + 1);
        if (/^ {4,}$/.test(line) && ta.selectionStart === ta.selectionEnd) {
          e.preventDefault();
          ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart);
          insertText(ta, '}');
        }
      }
      escaped = false;
    });
    sync();

    return {
      node: wrap,
      textarea: ta,
      get value() { return ta.value; },
      set value(v) { ta.value = v; sync(); },
      refresh: sync,
    };
  }

  function insertText(ta, text) {
    ta.focus();
    // execCommand keeps the browser's undo stack intact where supported.
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  }

  // ---------------------------------------------------------------------------
  // Running code via Compiler Explorer
  // ---------------------------------------------------------------------------
  let inFlight = 0;

  async function compileAndRun(source, stdin) {
    const body = {
      source: source,
      options: {
        userArguments: COMPILER_FLAGS,
        executeParameters: { args: [], stdin: stdin || '' },
        compilerOptions: { executorRequest: true, skipAsm: true },
        filters: { execute: true },
        tools: [],
        libraries: [],
      },
      lang: 'c',
      allowStoreCodeDebug: false,
    };
    const res = await fetch(COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Compiler service returned HTTP ' + res.status);
    const data = await res.json();
    const join = (arr) => (arr || []).map((x) => x.text).join('\n');
    const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
    const build = data.buildResult || {};
    return {
      compiled: build.code === undefined ? !!data.didExecute : build.code === 0,
      ran: !!data.didExecute,
      compileOutput: strip(join(build.stderr) + (build.stdout && build.stdout.length ? '\n' + join(build.stdout) : '')).trim(),
      stdout: strip(join(data.stdout)),
      stderr: strip(join(data.stderr)),
      exitCode: data.code,
      timedOut: !!data.timedOut,
      truncated: !!data.truncated,
    };
  }

  function renderResult(outEl, result) {
    outEl.innerHTML = '';
    outEl.hidden = false;
    const add = (label, text, cls) => {
      outEl.appendChild(el('div', { class: 'out-label ' + (cls || ''), text: label }));
      outEl.appendChild(el('pre', { class: 'out-text ' + (cls || ''), text: text }));
    };
    if (!result.compiled) {
      add('Compile error', result.compileOutput || 'The program failed to compile.', 'err');
      return;
    }
    if (result.compileOutput) add('Compiler warnings', result.compileOutput, 'warn');
    if (!result.ran) {
      add('Not run', 'The program compiled but could not be executed.', 'err');
      return;
    }
    add('Output', result.stdout === '' ? '(no output)' : result.stdout, result.stdout === '' ? 'muted' : '');
    if (result.stderr) add('stderr', result.stderr, 'err');
    const status = result.timedOut ? 'Timed out — is there an infinite loop?' : 'Exited with code ' + result.exitCode;
    outEl.appendChild(el('div', { class: 'out-status' + (result.exitCode === 0 && !result.timedOut ? '' : ' bad'), text: status }));
  }

  function renderError(outEl, err) {
    outEl.innerHTML = '';
    outEl.hidden = false;
    outEl.appendChild(el('div', { class: 'out-label err', text: 'Could not run' }));
    outEl.appendChild(el('pre', {
      class: 'out-text err',
      text: (err && err.message ? err.message + '\n\n' : '') +
        'The online compiler could not be reached. Check your connection and try again,\n' +
        'or compile locally:  gcc program.c -o program && ./program',
    }));
  }

  // A runner = editor + toolbar + optional stdin + output panel.
  function createRunner(initial, opts) {
    opts = opts || {};
    const outEl = el('div', { class: 'runner-output', 'aria-live': 'polite', hidden: true });
    let stdinBox = null;
    const runBtn = el('button', { class: 'btn btn-run', type: 'button' }, [el('span', { 'aria-hidden': 'true', text: '▶ ' }), 'Run']);
    const editor = createEditor(initial, { onRun: () => run(), onChange: opts.onChange, label: opts.label });

    async function run() {
      if (runBtn.disabled) return;
      runBtn.disabled = true;
      runBtn.classList.add('busy');
      inFlight++;
      outEl.hidden = false;
      outEl.innerHTML = '<div class="out-status running">Compiling and running…</div>';
      try {
        const result = await compileAndRun(editor.value, stdinBox ? stdinBox.value : '');
        renderResult(outEl, result);
        if (opts.onResult) opts.onResult(result, outEl);
      } catch (err) {
        renderError(outEl, err);
      } finally {
        inFlight--;
        runBtn.disabled = false;
        runBtn.classList.remove('busy');
      }
    }
    runBtn.addEventListener('click', run);

    const toolbar = el('div', { class: 'runner-toolbar' }, [runBtn]);
    (opts.extraButtons || []).forEach((b) => toolbar.appendChild(b));
    const resetBtn = el('button', {
      class: 'btn btn-ghost btn-sm', type: 'button', text: 'Reset',
      onclick: () => { editor.value = opts.resetTo !== undefined ? opts.resetTo : initial; if (opts.onChange) opts.onChange(editor.value); },
    });
    toolbar.appendChild(resetBtn);
    toolbar.appendChild(el('span', { class: 'kbd-hint', html: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run' }));

    const node = el('div', { class: 'runner' }, [editor.node, toolbar]);
    if (opts.stdin !== undefined) {
      stdinBox = el('textarea', { class: 'stdin-input', rows: '2', spellcheck: 'false', 'aria-label': 'Program input (stdin)' });
      stdinBox.value = opts.stdin;
      node.appendChild(el('label', { class: 'stdin-label' }, [el('span', { text: 'Input (stdin)' }), stdinBox]));
    }
    node.appendChild(outEl);
    return { node, editor, run, outEl };
  }

  function initCodeBlocks(root) {
    root.querySelectorAll('script[type="text/c"]').forEach((s) => {
      if (s.closest('.exercise') || s.closest('.memviz') || s.closest('#playground')) return;
      const code = dedent(s.textContent);
      if (s.hasAttribute('data-static')) {
        const pre = el('pre', { class: 'code-static' + (s.dataset.title ? ' has-title' : '') });
        const c = el('code', { class: 'language-c', html: highlight(code) });
        pre.appendChild(c);
        const block = s.dataset.title ? el('figure', { class: 'code-figure' }, [el('figcaption', { text: s.dataset.title }), pre]) : pre;
        s.replaceWith(block);
        return;
      }
      const runner = createRunner(code, { stdin: s.dataset.stdin !== undefined ? s.dataset.stdin.replace(/\\n/g, '\n') : undefined });
      if (s.dataset.title) runner.node.insertBefore(el('div', { class: 'runner-title', text: s.dataset.title }), runner.node.firstChild);
      s.replaceWith(runner.node);
    });
    // Plain <pre><code> blocks (e.g. shell commands) get highlighted if marked as C.
    root.querySelectorAll('pre > code.language-c').forEach((c) => {
      if (c.closest('.editor') || c.closest('.code-static')) return;
      c.innerHTML = highlight(dedent(c.textContent));
    });
  }

  // ---------------------------------------------------------------------------
  // Exercises
  // ---------------------------------------------------------------------------
  function initExercises(root) {
    root.querySelectorAll('.exercise').forEach((ex) => {
      const id = ex.dataset.id;
      const starterEl = ex.querySelector('script.starter');
      const expectedEl = ex.querySelector('script.expected');
      const solutionEl = ex.querySelector('script.solution');
      const starter = starterEl ? dedent(starterEl.textContent) : '';
      const expected = expectedEl ? normalizeOutput(dedent(expectedEl.textContent)) : null;
      const solution = solutionEl ? dedent(solutionEl.textContent) : null;
      const stdin = ex.dataset.stdin !== undefined ? ex.dataset.stdin.replace(/\\n/g, '\n') : undefined;
      [starterEl, expectedEl, solutionEl].forEach((n) => n && n.remove());

      const draftKey = 'draft.' + (currentModule ? currentModule.id : currentFile) + '.' + id;
      const draft = store.get(draftKey, null);
      const status = el('div', { class: 'ex-status', 'aria-live': 'polite' });
      const already = currentModule && lessonProgress(currentModule.id).ex && lessonProgress(currentModule.id).ex[id];
      if (already) { ex.classList.add('passed'); }

      const solutionBtn = solution ? el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Show solution' }) : null;
      const runner = createRunner(draft !== null ? draft : starter, {
        stdin: stdin,
        resetTo: starter,
        label: 'Exercise code editor',
        extraButtons: solutionBtn ? [solutionBtn] : [],
        onChange: (v) => { if (v === starter) store.remove(draftKey); else store.set(draftKey, v); },
        onResult: (result) => {
          if (expected === null) return;
          status.innerHTML = '';
          if (!result.compiled || !result.ran) {
            status.className = 'ex-status fail';
            status.textContent = 'Fix the errors above, then run again.';
            return;
          }
          const got = normalizeOutput(result.stdout);
          if (got === expected) {
            status.className = 'ex-status pass';
            status.textContent = '✓ Correct! Your output matches.';
            ex.classList.add('passed');
            recordProgress({ exercise: id });
          } else {
            status.className = 'ex-status fail';
            status.appendChild(el('p', { text: '✗ Not quite — your output doesn\'t match the expected output yet.' }));
            status.appendChild(el('div', { class: 'diff' }, [
              el('div', null, [el('div', { class: 'out-label', text: 'Expected' }), el('pre', { class: 'out-text', text: expected })]),
              el('div', null, [el('div', { class: 'out-label', text: 'Yours' }), el('pre', { class: 'out-text', text: got || '(no output)' })]),
            ]));
          }
        },
      });
      if (solutionBtn) {
        solutionBtn.addEventListener('click', () => {
          const shown = ex.querySelector('.solution-view');
          if (shown) { shown.remove(); solutionBtn.textContent = 'Show solution'; return; }
          const view = el('div', { class: 'solution-view' }, [
            el('div', { class: 'out-label', text: 'One possible solution' }),
            el('pre', { class: 'code-static' }, [el('code', { class: 'language-c', html: highlight(solution) })]),
            el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Copy into editor', onclick: () => { runner.editor.value = solution; store.set(draftKey, solution); } }),
          ]);
          runner.node.after(view);
          solutionBtn.textContent = 'Hide solution';
        });
      }

      // Hints: <details class="hint"> stays as authored. Insert the runner before the first hint/after prompt.
      const header = el('div', { class: 'ex-header' }, [
        el('span', { class: 'ex-badge', text: 'Exercise' }),
        already ? el('span', { class: 'ex-done', text: '✓ Passed' }) : null,
      ]);
      ex.insertBefore(header, ex.firstChild);
      const hint = ex.querySelector('details');
      if (hint) ex.insertBefore(runner.node, hint); else ex.appendChild(runner.node);
      if (expected !== null) {
        const exp = el('details', { class: 'expected-view' }, [el('summary', { text: 'Expected output' }), el('pre', { class: 'out-text', text: expected })]);
        runner.node.before(exp);
      }
      ex.appendChild(status);
    });
  }

  // ---------------------------------------------------------------------------
  // Quizzes
  //   [{ "q": "...", "code": "optional C", "choices": [...], "answer": 0, "explain": "..." },
  //    { "q": "...", "code": "...", "type": "output", "answer": "6", "explain": "..." }]
  // Question text, choices and explanations may contain inline HTML such as <code>.
  // ---------------------------------------------------------------------------
  function initQuizzes(root) {
    root.querySelectorAll('script.quiz').forEach((s) => {
      let questions;
      try { questions = JSON.parse(s.textContent); } catch (e) {
        s.replaceWith(el('p', { class: 'callout warn', text: 'Quiz failed to load: ' + e.message }));
        return;
      }
      const block = el('section', { class: 'quiz-block' });
      const answers = new Array(questions.length).fill(null); // true / false once answered
      const scoreEl = el('div', { class: 'quiz-score', 'aria-live': 'polite' });

      function updateScore() {
        const answered = answers.filter((a) => a !== null).length;
        const correct = answers.filter((a) => a === true).length;
        scoreEl.innerHTML = '';
        if (answered < questions.length) {
          scoreEl.textContent = answered + ' of ' + questions.length + ' answered';
          return;
        }
        const pct = Math.round((correct / questions.length) * 100);
        scoreEl.appendChild(el('strong', { text: 'Score: ' + correct + ' / ' + questions.length + ' (' + pct + '%)' }));
        scoreEl.appendChild(document.createTextNode(pct >= PASS_THRESHOLD ? ' — nicely done!' : ' — review the explanations and try again.'));
        scoreEl.appendChild(el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Retry quiz', onclick: render }));
        recordProgress({ quiz: pct });
      }

      function render() {
        answers.fill(null);
        block.innerHTML = '';
        block.appendChild(el('h2', { text: s.dataset.title || 'Check your understanding' }));
        questions.forEach((q, i) => block.appendChild(renderQuestion(q, i)));
        block.appendChild(scoreEl);
        updateScore();
      }

      function renderQuestion(q, i) {
        const card = el('div', { class: 'quiz-q' });
        card.appendChild(el('p', { class: 'quiz-prompt', html: '<span class="quiz-n">' + (i + 1) + '</span> ' + q.q }));
        if (q.code) card.appendChild(el('pre', { class: 'code-static' }, [el('code', { class: 'language-c', html: highlight(dedent(q.code)) })]));
        const feedback = el('div', { class: 'quiz-feedback', 'aria-live': 'polite' });

        function reveal(correct, correctText) {
          answers[i] = correct;
          card.classList.add(correct ? 'right' : 'wrong');
          feedback.innerHTML = '<strong>' + (correct ? 'Correct.' : 'Not quite.') + '</strong> ' +
            (!correct && correctText ? 'Answer: <code>' + escapeHtml(correctText) + '</code>. ' : '') + (q.explain || '');
          updateScore();
        }

        if (q.type === 'output') {
          const input = el('input', { class: 'quiz-input', type: 'text', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Predicted output for question ' + (i + 1), placeholder: 'What does it print?' });
          const btn = el('button', { class: 'btn btn-sm', type: 'button', text: 'Check' });
          const check = () => {
            if (answers[i] !== null || !input.value.trim()) return;
            const norm = (x) => String(x).trim().replace(/\s+/g, ' ');
            const accepted = [q.answer].concat(q.accept || []).map(norm);
            const ok = accepted.includes(norm(input.value));
            input.disabled = true; btn.disabled = true;
            reveal(ok, q.answer);
          };
          btn.addEventListener('click', check);
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
          card.appendChild(el('div', { class: 'quiz-output-row' }, [input, btn]));
        } else {
          const list = el('div', { class: 'quiz-choices', role: 'group', 'aria-label': 'Choices for question ' + (i + 1) });
          q.choices.forEach((choice, ci) => {
            const b = el('button', { class: 'quiz-choice', type: 'button', html: choice });
            b.addEventListener('click', () => {
              if (answers[i] !== null) return;
              list.querySelectorAll('button').forEach((x, xi) => {
                x.disabled = true;
                if (xi === q.answer) x.classList.add('is-answer');
              });
              if (ci !== q.answer) b.classList.add('is-wrong');
              reveal(ci === q.answer, null);
            });
            list.appendChild(b);
          });
          card.appendChild(list);
        }
        card.appendChild(feedback);
        return card;
      }

      s.replaceWith(block);
      render();
    });
  }

  // ---------------------------------------------------------------------------
  // Memory visualizer
  //   <div class="memviz">
  //     <script type="text/c">...code...</script>
  //     <script type="application/json">{ "steps": [ ... ] }</script>
  //   </div>
  // Step: { line, note, stack: [{ fn, vars: [Var] }], heap: [{ label, freed, cells: [Cell] }] }
  // Var:  { name, type, addr, value, ptr }  or  { name, type, cells: [Cell] }  (an array)
  // Cell: { addr, value, ptr, label }
  // "ptr" names the address the value points to; an arrow is drawn to the
  // element with that address. value "?" renders as uninitialised garbage.
  // ---------------------------------------------------------------------------
  let markerSeq = 0;

  function initMemviz(root) {
    root.querySelectorAll('.memviz').forEach((box) => {
      const codeEl = box.querySelector('script[type="text/c"]');
      const dataEl = box.querySelector('script[type="application/json"]');
      if (!codeEl || !dataEl) return;
      const code = dedent(codeEl.textContent);
      let data;
      try { data = JSON.parse(dataEl.textContent); } catch (e) {
        box.textContent = 'Memory diagram failed to load: ' + e.message;
        return;
      }
      box.innerHTML = '';
      const steps = data.steps;
      let index = 0;
      let prevValues = {};

      const highlighted = highlight(code).split('\n');
      const codePane = el('pre', { class: 'mv-code' });
      const lineEls = highlighted.map((h, i) => {
        const line = el('span', { class: 'mv-line', html: '<span class="mv-ln">' + (i + 1) + '</span>' + (h || ' ') });
        codePane.appendChild(line);
        return line;
      });
      // Prism spans can straddle lines (e.g. block comments); this is fine for our short examples.

      const memPane = el('div', { class: 'mv-mem' });
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'mv-arrows');
      svg.setAttribute('aria-hidden', 'true');
      const markerId = 'mv-arrow-' + (++markerSeq);
      svg.innerHTML = '<defs><marker id="' + markerId + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mv-arrowhead"/></marker></defs>';
      const memWrap = el('div', { class: 'mv-mem-wrap' }, [memPane]);
      memWrap.appendChild(svg);

      const note = el('p', { class: 'mv-note', 'aria-live': 'polite' });
      const counter = el('span', { class: 'mv-counter' });
      const prevBtn = el('button', { class: 'btn btn-sm', type: 'button', text: '◀ Back', onclick: () => go(index - 1) });
      const nextBtn = el('button', { class: 'btn btn-sm btn-primary', type: 'button', text: 'Step ▶', onclick: () => go(index + 1) });
      const resetBtn = el('button', { class: 'btn btn-sm btn-ghost', type: 'button', text: 'Restart', onclick: () => go(0) });

      box.appendChild(el('div', { class: 'mv-head' }, [
        el('span', { class: 'mv-badge', text: 'Memory visualizer' }),
        el('span', { class: 'mv-help', text: 'Step through the code and watch memory change' }),
      ]));
      box.appendChild(el('div', { class: 'mv-body' }, [codePane, memWrap]));
      box.appendChild(note);
      box.appendChild(el('div', { class: 'mv-controls' }, [prevBtn, nextBtn, resetBtn, counter]));
      box.tabIndex = 0;
      box.addEventListener('keydown', (e) => {
        if (e.target !== box) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      });

      function cellNode(c, extraClass, label) {
        const changed = c.addr && prevValues[c.addr] !== undefined && prevValues[c.addr] !== String(c.value);
        const isGarbage = c.value === '?' || c.value === undefined;
        const valueText = isGarbage ? '?' : String(c.value);
        return el('div', {
          class: 'mv-cell ' + (extraClass || '') + (changed ? ' changed' : '') + (isGarbage ? ' garbage' : '') + (c.ptr ? ' is-ptr' : ''),
          'data-addr': c.addr || null,
          'data-ptr': c.ptr && c.ptr !== 'NULL' ? c.ptr : null,
        }, [
          label ? el('span', { class: 'mv-cell-label', text: label }) : null,
          el('span', { class: 'mv-val', text: valueText, title: isGarbage ? 'Uninitialised — could be anything' : null }),
          c.addr ? el('span', { class: 'mv-addr', text: c.addr }) : null,
        ]);
      }

      function varRow(v) {
        if (v.cells) {
          const cells = el('div', { class: 'mv-array' }, v.cells.map((c, i) => cellNode(c, '', c.label !== undefined ? c.label : '[' + i + ']')));
          return el('div', { class: 'mv-var' }, [
            el('div', { class: 'mv-name' }, [el('code', { text: v.name }), el('span', { class: 'mv-type', text: v.type || '' })]),
            cells,
          ]);
        }
        return el('div', { class: 'mv-var' }, [
          el('div', { class: 'mv-name' }, [el('code', { text: v.name }), el('span', { class: 'mv-type', text: v.type || '' })]),
          cellNode(v),
        ]);
      }

      function render() {
        const step = steps[index];
        lineEls.forEach((l, i) => l.classList.toggle('current', i + 1 === step.line));
        if (step.line && lineEls[step.line - 1]) {
          const l = lineEls[step.line - 1];
          const top = l.offsetTop - codePane.clientHeight / 2 + l.offsetHeight / 2;
          codePane.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        memPane.innerHTML = '';
        const stackCol = el('div', { class: 'mv-region' }, [el('div', { class: 'mv-region-title', text: 'Stack' })]);
        (step.stack || []).slice().reverse().forEach((f, fi) => {
          stackCol.appendChild(el('div', { class: 'mv-frame' + (fi === 0 ? ' top' : '') }, [
            el('div', { class: 'mv-frame-title', text: f.fn + '()' }),
          ].concat((f.vars || []).length ? f.vars.map(varRow) : [el('div', { class: 'mv-empty', text: 'no variables yet' })])));
        });
        if (!(step.stack || []).length) stackCol.appendChild(el('div', { class: 'mv-empty', text: 'empty' }));
        memPane.appendChild(stackCol);

        if (data.heap !== false) {
          const heapCol = el('div', { class: 'mv-region' }, [el('div', { class: 'mv-region-title', text: 'Heap' })]);
          (step.heap || []).forEach((h) => {
            heapCol.appendChild(el('div', { class: 'mv-block' + (h.freed ? ' freed' : '') }, [
              el('div', { class: 'mv-frame-title', text: (h.label || 'malloc block') + (h.freed ? ' — freed' : '') }),
              el('div', { class: 'mv-array' }, h.cells.map((c, i) => cellNode(c, '', c.label !== undefined ? c.label : (h.cells.length > 1 ? '[' + i + ']' : '')))),
            ]));
          });
          if (!(step.heap || []).length) heapCol.appendChild(el('div', { class: 'mv-empty', text: 'nothing allocated' }));
          memPane.appendChild(heapCol);
        }
        if (step.output !== undefined) {
          memPane.appendChild(el('div', { class: 'mv-region mv-stdout' }, [el('div', { class: 'mv-region-title', text: 'Output' }), el('pre', { text: step.output || ' ' })]));
        }

        note.innerHTML = step.note || '';
        counter.textContent = 'Step ' + (index + 1) + ' / ' + steps.length;
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === steps.length - 1;
        requestAnimationFrame(drawArrows);

        // remember values so the next step can flash what changed
        prevValues = {};
        memPane.querySelectorAll('.mv-cell[data-addr]').forEach((c) => {
          prevValues[c.dataset.addr] = c.querySelector('.mv-val').textContent;
        });
      }

      function drawArrows() {
        svg.querySelectorAll('path.mv-arrow').forEach((p) => p.remove());
        const base = memWrap.getBoundingClientRect();
        svg.setAttribute('width', memWrap.scrollWidth);
        svg.setAttribute('height', memWrap.scrollHeight);
        memPane.querySelectorAll('.mv-cell[data-ptr]').forEach((src) => {
          const target = memPane.querySelector('.mv-cell[data-addr="' + src.dataset.ptr + '"]');
          if (!target) return;
          const a = src.querySelector('.mv-val').getBoundingClientRect();
          // Point at a whole heap block when the target is its first cell (e.g. a list node).
          const block = target.closest('.mv-block');
          const b = (block && block.querySelector('.mv-cell') === target ? block : target).getBoundingClientRect();
          const sx = a.right - base.left + 4;
          const sy = a.top + a.height / 2 - base.top;
          let tx, ty, c1x, c2x;
          ty = b.top + b.height / 2 - base.top;
          if (b.left - base.left > sx + 10) {
            tx = b.left - base.left - 2; c1x = sx + 40; c2x = tx - 40;
          } else {
            tx = b.right - base.left + 2;
            const bulge = Math.max(sx, tx) + 36 + Math.min(60, Math.abs(ty - sy) / 4);
            c1x = bulge; c2x = bulge;
          }
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('class', 'mv-arrow');
          path.setAttribute('d', 'M' + sx + ',' + sy + ' C' + c1x + ',' + sy + ' ' + c2x + ',' + ty + ' ' + tx + ',' + ty);
          path.setAttribute('marker-end', 'url(#' + markerId + ')');
          svg.appendChild(path);
        });
      }

      function go(i) {
        index = Math.max(0, Math.min(steps.length - 1, i));
        render();
      }

      window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
      render();
    });
  }

  // ---------------------------------------------------------------------------
  // Home page: module cards with progress
  // ---------------------------------------------------------------------------
  function initHome() {
    const grid = document.getElementById('module-grid');
    if (!grid) return;
    const progress = getProgress();
    const doneCount = MODULES.filter((m) => progress[m.id] && progress[m.id].done).length;

    const bar = document.getElementById('overall-progress');
    if (bar) {
      const pct = Math.round((doneCount / MODULES.length) * 100);
      bar.innerHTML = '';
      bar.appendChild(el('div', { class: 'progress-label', text: doneCount + ' of ' + MODULES.length + ' lessons complete' }));
      bar.appendChild(el('div', { class: 'progress-track', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct) }, [
        el('div', { class: 'progress-fill', style: 'width:' + pct + '%' }),
      ]));
    }

    const cta = document.getElementById('continue-btn');
    if (cta) {
      const last = store.get('last', null);
      const firstUndone = MODULES.find((m) => !(progress[m.id] && progress[m.id].done));
      const target = MODULES.find((m) => m.id === last) || firstUndone || MODULES[0];
      cta.href = target.file;
      cta.textContent = (last || doneCount) ? 'Continue: ' + target.title + ' →' : 'Start the course →';
    }

    PARTS.forEach((part) => {
      grid.appendChild(el('h2', { class: 'part-title', text: part.title }));
      const list = el('ol', { class: 'cards' });
      MODULES.filter((m) => m.part === part.id).forEach((m) => {
        const p = progress[m.id];
        const n = MODULES.indexOf(m) + 1;
        list.appendChild(el('li', null, [
          el('a', { class: 'card' + (p && p.done ? ' done' : ''), href: m.file }, [
            el('span', { class: 'card-num', text: p && p.done ? '✓' : String(n).padStart(2, '0') }),
            el('span', { class: 'card-body' }, [
              el('span', { class: 'card-title', text: m.title }),
              el('span', { class: 'card-blurb', text: m.blurb }),
            ]),
          ]),
        ]));
      });
      grid.appendChild(list);
    });

    const resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (resetBtn.dataset.confirm !== '1') {
          resetBtn.dataset.confirm = '1';
          resetBtn.textContent = 'Click again to erase all progress';
          return;
        }
        store.remove('progress');
        store.remove('last');
        try {
          Object.keys(localStorage).filter((k) => k.startsWith('learnc.draft.')).forEach((k) => localStorage.removeItem(k));
        } catch (e) { /* ignore */ }
        location.reload();
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Playground
  // ---------------------------------------------------------------------------
  function initPlayground() {
    const host = document.getElementById('playground');
    if (!host) return;
    const starter = dedent(host.querySelector('script[type="text/c"]').textContent);
    const saved = store.get('playground', null);
    const runner = createRunner(saved !== null ? saved : starter, {
      stdin: '', resetTo: starter, label: 'Playground code editor',
      onChange: (v) => store.set('playground', v),
    });
    host.innerHTML = '';
    host.appendChild(runner.node);
    runner.node.classList.add('runner-large');
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  window.Prism = window.Prism || { manual: true };
  window.Prism.manual = true;

  function boot() {
    buildLayout();
    initHome();
    initCodeBlocks(document);
    initExercises(document);
    initQuizzes(document);
    initMemviz(document);
    initPlayground();
    if (currentModule) {
      const box = document.querySelector('.complete-box');
      if (box) renderCompleteBox(box);
    }
  }

  const PRISM = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/';
  function start() {
    loadScript(PRISM + 'prism.min.js')
      .then(() => (window.Prism && Prism.languages ? loadScript(PRISM + 'components/prism-c.min.js') : null))
      .then(boot);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.LearnC = { MODULES, PARTS, compileAndRun };
})();
