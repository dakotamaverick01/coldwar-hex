# Handoff tasks (made 2026-10-25 by Claude Opus)

Small, self-contained jobs that a cheaper AI can do while the builder's main usage resets.
DESIGN_SESSION_PROMPT.md: paste into Grok or Gemini to work through design questions (units, orders of battle, stats, combat, command, enemy, campaign, interface). It ends each topic with a DECISION RECORD to bring back to Claude.
Each task file has everything the AI needs. Do them in order: H1, H2, H3. The art prompts (ART_PROMPTS.md) can be done any time, in Grok or Gemini.

## How to run a Haiku task (from the iPhone)
1. Open the Claude app, start a new Claude Code session on the repo dakotamaverick01/coldwar-hex.
2. Switch the model to Haiku (type /model and pick Haiku).
3. Paste this one line, changing only the task name if you are on H2 or H3:
   Read handoff/H1_hex_math.md and do exactly what it says. Report back in plain English.
4. When it reports back, open the check link or read the check result it gives you.

## Rules for every task (the AI must follow these)
- Work on the branch named in the task, never on main. Never force-push.
- Do not edit mission-bridge.html, look-test.html or anything in tools/build_bridge_page_* or tools/world_*.
- Do not change any LOCKED decision in START_HERE.md.
- If something fails twice, stop and report what happened instead of trying more fixes.
- Finish with: what was done, the branch name, and one line telling the builder how to check it.
