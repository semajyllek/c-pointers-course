# Learn C

A free, interactive C programming course that runs in the browser:

https://semajyllek.github.io/c-pointers-course/

17 lessons, from hello world through pointers, dynamic memory, structs, file I/O and the preprocessor, ending with a linked-list capstone. Every lesson has:

- **Runnable examples**: edit any code block and press Run (or Ctrl+Enter).
- **Auto-checked exercises**: your program's output is compared with the expected output. Hints and solutions are included.
- **Quizzes**: multiple choice and "predict the output", with instant explanations.
- **Memory visualizer**: step through code and watch the stack, the heap and the pointer arrows change.
- **Progress tracking**: saved in your browser's localStorage.

## How it works

It's a plain static site with no build step. Each lesson is an HTML file. `assets/course.js` builds the navigation and turns declarative markup into interactive components:

```html
<script type="text/c">…</script>                 <!-- runnable, editable example -->
<script type="text/c" data-static>…</script>     <!-- read-only highlighted code -->
<div class="exercise" data-id="…">…</div>        <!-- starter / expected / solution -->
<script type="application/json" class="quiz">    <!-- quiz questions -->
<div class="memviz">…</div>                      <!-- step-through memory diagram -->
```

See the comments at the top of `assets/course.js` for the full format, and `introduction.html` for an example lesson. The lesson order lives in the `MODULES` list in `assets/course.js`.

Code is compiled and run by the public [Compiler Explorer](https://godbolt.org) API (x86-64 gcc 15.2), so code you press Run on is sent to godbolt.org.

## Developing

```sh
python3 -m http.server 8000        # then open http://localhost:8000
python3 tools/check_lessons.py     # compile every example, verify every exercise solution
```

`tools/check_lessons.py` needs a local C compiler (`cc`, or set `CC`).
