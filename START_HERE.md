# START_HERE: Cold War hex strategy game (working title TBD)

Read this first every chat. It is the current state and overrides older docs (including claude/working-agreement.md where they disagree).

## LOCKED (decided 2026-10-25)
- Setting: late Cold War, hypothetical 1985 Central Front in West Germany. NATO vs Warsaw Pact. (2026-10-25)
- Scale: operational level. Hex map, units are battalions, Panzer General style. (2026-10-25)
- Play style: turn-based, solo vs computer opponent. (2026-10-25)
- Look: real 3D hex terrain with elevation, not a flat painted map. Beauty comes mainly from lighting, fog, shadows, colour grading and terrain depth. (2026-10-25)
- iPhone first: it must be playable and testable on the builder's iPhone from anywhere, via a private web link set up before features are built. This is the main lesson from CWG3. (2026-10-25)
- Must be postable on itch.io: only own work, CC0 or open-licensed assets, each logged in ASSET_CREDITS.md with source and licence. (2026-10-25)
- Source of truth: a GitHub repo. Keep a handoff note in the repo so work can continue if usage runs out. (2026-10-25)
- Budget: steady over a few weeks, about 90% of weekly usage, the rest kept for his job. Haiku for filing and git, Sonnet for building, Opus for look and rules. Tell him before switching. (2026-10-25)
- Public material never mentions the builder's profession. (2026-10-25)
- Other AIs (Grok, Gemini): allowed for art prompts, image generation and overflow brainstorming when Claude usage is low. They do not make decisions; their output goes into the repo and gets reviewed by Claude. Prompts for them must be self-contained and copy-paste ready. This relaxes the old "art only" rule. (2026-10-25)
- Structure: repo is the single source of truth (START_HERE.md, HANDOFF.md, one plan). Haiku acts as chief of staff (status, tasks, decision log, git, work orders). Sonnet builds. Opus only for look and rules calls. (2026-10-25)

## SUPERSEDED (kept for history)
- "Dawn at the Narrows", ancient era, one-battle diorama (2026-10-24). Dropped 2026-10-25.

## NOT YET (undecided)
- Game name (must be original).
- Tech stack (proposal: Three.js, a free 3D library for web pages; hosted free on GitHub Pages).
- Vehicle models: decide when we reach them. Default plan is simple stylized vehicles built in code, CC0 packs for scenery.
- Unit roster, rules, enemy AI, supply, escalation mechanic.
- Camera style and cinematic moments.
- Art palette and mood board.
- CWG3 files: not found here. Builder may drop in a zip or repo link for review.

## NEXT
Phase 1 plan: scope, tech, repo and iPhone link setup, usage estimate. Builder says yes before anything is built. Goal: a rough playable hex map with 3 unit types running on his iPhone within the first week.

## HANDOFF (any AI can pick up from here)
- Project: turn-based 3D hex wargame, 1985 West Germany, phone-first, web (Three.js).
- Current phase: Phase 1 plan written in PLAN.md, awaiting builder's yes. Repo created and connected (dakotamaverick01/coldwar-hex); test commit pushed 2026-10-25.
- Builder has never used GitHub or a terminal. Describe only what to click or look at; never say commit, push, branch, repo, or terminal without a plain-language definition first.
- Rules: plain English, define jargon, small playable steps, stop after each phase for a yes, one-line self-check with every change, original names, CC0/own assets only logged in ASSET_CREDITS.md, no mention of the builder's profession anywhere public.
- Next 3 tasks: (1) builder says yes to PLAN.md, (2) publish hello page on GitHub Pages (builder flips one Settings switch), (3) 3D hex map.

## Housekeeping
- Living docs max three: START_HERE.md, ASSET_CREDITS.md (create at first asset), one plan.
- claude/working-agreement.md is a draft from CWG3; archive once its useful rules are folded in.
