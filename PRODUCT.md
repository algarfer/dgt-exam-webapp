# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript, bundled with Rspack 2, styled with Tailwind CSS v4, routed with React Router 8
in data mode. Bun is the only JavaScript runtime, locally and in CI. Deployed as a static site to
GitHub Pages at `https://dgt.algarferx.dev/` on a `v*` tag.

## Users

Anyone preparing the Spanish DGT theory exam for a driving licence, on a phone or on a desktop. Both
sizes carry equal weight: the question view has to work one-handed in portrait and still hold up on a
wide screen, and a first-time visitor who arrives with no explanation has to understand what the app
offers without being taught.

## Product Purpose

`revista.dgt.es` publishes a test every few months as an isolated page with the answers printed at
the bottom. This app turns that archive into practice that compounds.

The centre of the product is the backlog of questions the user got wrong. A mistake made anywhere —
study mode, a scored exam, endless practice — enters a pool that survives across every exam and
every manifest, and a question only leaves the pool once it is answered correctly. Scored exam
simulation and an endless question stream exist, but they are the supporting cast; drilling your own
mistakes is the reason to come back.

Success means a user can sit down with no plan, work through the questions they personally keep
failing, and watch that pool shrink.

## Positioning

Progress is tracked per question, by identity rather than by position, across an open set of
manifests. A neighbouring quiz app ties progress to its own fixed content; here the content is a URL
the user supplies, and the wrong-answer pool spans all of them at once.

## Operating Context

- Short sessions, frequently interrupted, often on mobile data. The user may open one question and
  leave.
- The exam corpus lives in a sibling project, `algarfer/dgt-exam-scraper`, published as static JSON
  plus images on `raw.githubusercontent.com`. The app reads it; it never writes to it.
- A user can point the app at any other manifest URL that follows the same two schemas.
- There is nowhere to log in and nothing is synced, so the browser is the only copy of a user's
  progress.

## Capabilities and Constraints

- **No backend, ever.** Static hosting, no login, no server, no analytics. Every piece of state
  lives in `localStorage` and must be exportable to a file and importable again, because clearing
  site data is the only real way to lose it.
- **Question content is untouchable.** Questions, answers and images are scraped DGT material,
  rendered verbatim. The app never rewords, abbreviates, truncates or reorders the *content* of a
  question, and never invents an explanation for an answer.
- **Spanish only.** Interface and content are Spanish, written natively rather than translated.
  There is no i18n layer and no language switcher.
- **Must survive a bad connection.** Manifests and exams are fetched lazily and are never persisted,
  so the UI has to stay usable while a fetch is in flight and say plainly which of the four failure
  modes happened: blocked request, missing file, not JSON, or not a valid manifest. The
  wrong-answer backlog stores a snapshot of each question and therefore works fully offline.
- Exams carry up to 30 questions, so the real DGT rules are applied proportionally rather than
  literally: the error budget is `max(1, floor(questions * 3 / 30))`. There is no time limit; the
  stopwatch counts up and elapsed time is never a failure condition.
- Questions and answers are shuffled on every run. Identity is
  `manifestUrl|examNumber|question.number` and the correct answer is tracked by its original index,
  never by a shuffled position.

## Brand Commitments

The name shown to users is "DGT Tests". MIT licensed, authored by algarfer. No logo, wordmark or
palette has been established; any mark must be authored as SVG.

## Evidence on Hand

Measured against the real corpus at `algarfer/dgt-exam-scraper`, commit of 2026-11-08:

- Nothing may assume three answers.
- Every question in the current corpus has an image, but `image` is optional in the schema, so the
  layout must handle its absence without collapsing.
- **No question in the corpus uses the optional `feedback` field.** An explanation panel must render
  nothing at all when it is absent. Future work must not fabricate explanations to fill it.
- Exactly one answer per question is marked correct.
- Test fixtures of real data live at `tests/fixtures/`. The two JSON Schemas are fetched from the
  scraper repo into `src/data/schemas/`.

There are no users yet, no usage data, no testimonials, no press and no benchmarks. None may be
invented.

## Product Principles

1. **The backlog is the product.** Every mode feeds it, and shrinking it is the main loop. A feature
   that does not help the user attack their own mistakes is a side feature.
2. **Render the content, never rewrite it.** The DGT's words are the material; the app's job is
   presentation, pacing and feedback around them.
3. **Identity over position.** Shuffling is constant, so nothing user-facing or persisted may depend
   on where a question or answer happened to land.
4. **Nothing silently lost.** The browser holds the only copy of a user's progress, so a failed
   write is surfaced, not swallowed, and export exists so the user can keep their own copy.
5. **Honest about the network.** Data arrives lazily. The interface stays usable while it loads and
   says specifically what went wrong when it does not arrive.

## Accessibility & Inclusion

- Mobile-first and usable one-handed in portrait, without losing quality on a wide screen.
- Dark and light mode, following the system preference until the user chooses otherwise.
- Keyboard shortcuts exist for answering and submitting, but every one of those actions is also
  reachable from a visible control. Shortcuts are an accelerant, never the only route.
- Answer keybinds are bound to a question's real answer count, so the 2-answer question never
  offers a third.
