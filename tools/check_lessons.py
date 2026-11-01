#!/usr/bin/env python3
"""Compile every runnable example in the lessons and verify exercise solutions.

Usage:  python3 tools/check_lessons.py [lesson.html ...]

For each page it:
  * compiles every <script type="text/c"> example (not data-static ones)
  * compiles and runs each exercise solution, feeding data-stdin, and checks
    its stdout against the exercise's expected output
  * compiles each exercise starter (starters may be incomplete, so a starter
    failure is reported as a warning, not an error)
  * parses every quiz and memory-visualizer JSON block

Examples marked data-expect-error="compile" are expected NOT to compile, and
data-no-run examples are compiled but not executed (e.g. they read files or
intentionally crash).
"""
import html.parser
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CC = os.environ.get('CC', 'cc')
FLAGS = ['-std=c17', '-Wall', '-Wextra', '-Wno-unused-parameter']


def dedent(text):
    lines = text.replace('\t', '    ').split('\n')
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    indents = [len(l) - len(l.lstrip(' ')) for l in lines if l.strip()]
    n = min(indents) if indents else 0
    return '\n'.join(l[n:] for l in lines)


def normalize(s):
    return '\n'.join(l.rstrip() for l in s.replace('\r\n', '\n').split('\n')).rstrip('\n')


class Collector(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []          # dicts: kind, attrs, text, exercise
        self.stack = []           # open div classes for exercise/memviz tracking
        self.exercise = None
        self.cur = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'div':
            cls = (a.get('class') or '').split()
            if 'exercise' in cls:
                self.exercise = {'id': a.get('data-id'), 'stdin': a.get('data-stdin'), 'parts': {}}
                self.stack.append('exercise')
            elif 'memviz' in cls:
                self.stack.append('memviz')
            else:
                self.stack.append('div')
        elif tag == 'script':
            self.cur = {'attrs': a, 'text': ''}

    def handle_endtag(self, tag):
        if tag == 'div' and self.stack:
            kind = self.stack.pop()
            if kind == 'exercise':
                self.blocks.append({'kind': 'exercise', 'ex': self.exercise})
                self.exercise = None
        elif tag == 'script' and self.cur is not None:
            a, text = self.cur['attrs'], self.cur['text']
            self.cur = None
            t = a.get('type', '')
            cls = (a.get('class') or '').split()
            in_mv = 'memviz' in self.stack
            if self.exercise is not None and 'exercise' in self.stack:
                for part in ('starter', 'expected', 'solution'):
                    if part in cls:
                        self.exercise['parts'][part] = text
            elif t == 'text/c' and not in_mv:
                self.blocks.append({'kind': 'example', 'attrs': a, 'text': text})
            elif t == 'text/c' and in_mv:
                self.blocks.append({'kind': 'memviz-code', 'attrs': a, 'text': text})
            elif t == 'application/json':
                self.blocks.append({'kind': 'quiz' if 'quiz' in cls else 'memviz', 'text': text})

    def handle_data(self, data):
        if self.cur is not None:
            self.cur['text'] += data


def compile_src(src, tmp, name):
    path = os.path.join(tmp, name + '.c')
    exe = os.path.join(tmp, name)
    with open(path, 'w') as f:
        f.write(src)
    p = subprocess.run([CC, *FLAGS, path, '-o', exe, '-lm'], capture_output=True, text=True)
    return p.returncode == 0, p.stderr, exe


def run(exe, stdin, cwd):
    try:
        p = subprocess.run([exe], input=stdin or '', capture_output=True, text=True, timeout=5, cwd=cwd)
        return p.stdout, p.returncode
    except subprocess.TimeoutExpired:
        return None, 'timeout'


def check_file(path):
    errors, warnings = [], []
    c = Collector()
    with open(path, encoding='utf-8') as f:
        c.feed(f.read())
    name = os.path.basename(path)
    with tempfile.TemporaryDirectory() as tmp:
        for i, b in enumerate(c.blocks):
            if b['kind'] in ('quiz', 'memviz'):
                try:
                    data = json.loads(b['text'])
                    if b['kind'] == 'quiz':
                        for q in data:
                            if q.get('type') != 'output':
                                assert 0 <= q['answer'] < len(q['choices']), 'answer index out of range: ' + q['q'][:40]
                except Exception as e:  # noqa: BLE001
                    errors.append(f'{b["kind"]} JSON #{i}: {e}')
            elif b['kind'] in ('example', 'memviz-code'):
                a = b['attrs']
                if 'data-static' in a:
                    continue
                src = dedent(b['text'])
                ok, err, exe = compile_src(src, tmp, f'ex{i}')
                expect_err = a.get('data-expect-error') == 'compile'
                if expect_err:
                    if ok:
                        errors.append(f'example #{i} was expected to fail to compile but compiled')
                    continue
                if not ok:
                    errors.append(f'example #{i} ({b["kind"]}) failed to compile:\n{err}\n--- source ---\n{src}')
                    continue
                if err.strip():
                    warnings.append(f'example #{i} warnings:\n{err.strip()}')
                if b['kind'] == 'example' and 'data-no-run' not in a:
                    stdin = (a.get('data-stdin') or '').replace('\\n', '\n')
                    out, code = run(exe, stdin, tmp)
                    if out is None:
                        errors.append(f'example #{i} timed out')
            elif b['kind'] == 'exercise':
                ex = b['ex']
                parts = ex['parts']
                label = f'exercise "{ex["id"]}"'
                if not ex['id']:
                    errors.append('exercise without data-id')
                for need in ('starter', 'expected', 'solution'):
                    if need not in parts:
                        errors.append(f'{label} missing {need}')
                if 'solution' not in parts or 'expected' not in parts:
                    continue
                ok, err, exe = compile_src(dedent(parts['solution']), tmp, f'sol{i}')
                if not ok:
                    errors.append(f'{label} solution failed to compile:\n{err}')
                    continue
                if err.strip():
                    warnings.append(f'{label} solution warnings:\n{err.strip()}')
                stdin = (ex['stdin'] or '').replace('\\n', '\n')
                out, code = run(exe, stdin, tmp)
                expected = normalize(dedent(parts['expected']))
                if out is None:
                    errors.append(f'{label} solution timed out')
                elif normalize(out) != expected:
                    errors.append(f'{label} solution output mismatch\n  expected: {expected!r}\n  got:      {normalize(out)!r}')
                if 'starter' in parts:
                    ok, err, _ = compile_src(dedent(parts['starter']), tmp, f'st{i}')
                    if not ok:
                        warnings.append(f'{label} starter does not compile (ok if intentional)')
    n_ex = sum(1 for b in c.blocks if b['kind'] == 'exercise')
    n_code = sum(1 for b in c.blocks if b['kind'] == 'example')
    return name, n_code, n_ex, errors, warnings


def main():
    files = sys.argv[1:] or sorted(
        os.path.join(ROOT, f) for f in os.listdir(ROOT) if f.endswith('.html'))
    failed = False
    for f in files:
        name, n_code, n_ex, errors, warnings = check_file(f)
        status = 'FAIL' if errors else 'ok'
        print(f'[{status}] {name}: {n_code} examples, {n_ex} exercises')
        for w in warnings:
            print('  warn: ' + w.replace('\n', '\n        '))
        for e in errors:
            print('  ERROR: ' + e.replace('\n', '\n         '))
        failed = failed or bool(errors)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
