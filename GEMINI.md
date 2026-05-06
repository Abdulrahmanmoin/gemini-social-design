# GEMINI_DESIGN — Social Media Visual Design Workspace

This directory is specialized for designing **LinkedIn posts, infographics, carousels, and Instagram posts**. Treat every request here as a visual design task first, an engineering task second.

## Primary Output: HTML

Designs in this workspace are produced as **self-contained HTML files**, not Canva designs. The `post-layout` skill owns the HTML generation rules — activate it whenever the user asks for a post, carousel, slide, or infographic. It enforces the locked canvas sizes below and emits files to `D:\GEMINI_DESIGN\designs\`.

The Canva MCP tools are available as a fallback (e.g., if the user explicitly asks for a Canva design or needs to edit an existing Canva file), but HTML is the default deliverable.

## Skills & Agents in this workspace

Two project-scoped extensions live under `.gemini/` and **must be used together** as the standard pipeline: skill generates → agent reviews → fix → done.

### Skill: `post-layout`

- **Path:** `.gemini/skills/post-layout/SKILL.md`
- **Templates:** `.gemini/skills/post-layout/templates/` — `gradient-hook-portrait.html`, `comparison-three-column.html`, `carousel-cover-square.html`
- **Trigger:** Any request for a LinkedIn / Instagram post, carousel, slide, or infographic in this workspace.
- **What it does:** Generates self-contained HTML at one of the two locked canvas sizes (1080×1080 or 1080×1350), with inline CSS, Google Fonts, and pixel-exact `.slide` containers. Forces clarifying questions before generating, requires a `reference/` citation, and refuses out-of-bounds dimensions.
- **Output:** `designs/<descriptive-kebab-name>.html`. Embeds an HTML comment `<!-- ref: reference/<file> -->` so QA can verify the citation.
- **Invocation:** Use `activate_skill(name: "post-layout")`.

### Agent: `design-qa`

- **Path:** `.gemini/agents/design-qa.md`
- **Trigger:** After `post-layout` generates a file, or when the user asks to "review", "check", "QA", or "audit" a design.
- **What it does:** Runs **29 static checks** across 8 categories — canvas size, HTML hygiene, fonts, typography, color/contrast, layout/safe-zones, carousel structure, brief alignment. Returns a **0–100 score** plus ✅/⚠️/❌ per check with line numbers and a deduction-ordered fix list.
- **Scoring:** Critical FAIL = −10, Important FAIL = −5, Polish FAIL = −3, WARN = −1 (or −2 on critical). Floor 0.
- **Handoff threshold:** **≥ 95 / 100**. Below 95 = not done.
- **Invocation:** Use `invoke_agent(agent_name: "design-qa", prompt: "QA the file at D:\GEMINI_DESIGN\designs\<file>.html")`.
- **Fix-loop (mandatory):** After every generation or substantive edit, run `design-qa`. If score < 95, apply every FAIL fix top-down (by deduction size), then re-run. Repeat up to **5 iterations**. If still < 95, surface the blocker to the user — don't ship below threshold. Show the score progression in your response: `72 → 86 → 94 → 96 ✅`.

## Locked Canvas Sizes (only these two)

| Format | Dimensions (px) | Aspect | Use |
|---|---|---|---|
| Carousel slide (every slide) | **1080 × 1080** | 1:1 | Consistent swipe experience across slides |
| Portrait single post | **1080 × 1350** | 4:5 | Tallest size displayed full without cropping on LinkedIn/Instagram |

**No other dimensions are allowed.** If the user requests a banner, story (9:16), 1200×1200 square, or long-form infographic, redirect them to one of these two sizes before generating.

When the user doesn't specify, **ask** which of the two formats they want.

## Design Principles (apply by default)

1. **One idea per slide / post.** Carousels: one takeaway per page; the deck is the argument, not each slide.
2. **Hierarchy = size + weight + color, in that order.** Title → subtitle → body → caption. Don't decorate; differentiate.
3. **Readable on mobile first.** Body copy ≥ 24pt at 1080px wide. Headlines ≥ 60pt. Test by squinting.
4. **High contrast.** Aim for WCAG AA (4.5:1 for body, 3:1 for large text). Avoid light-gray-on-white.
5. **Generous whitespace.** Margins ≥ 80px on a 1080px canvas. Crowded = unread.
6. **Two fonts max.** One for display, one for body. System-safe pairings: Inter + Inter, Montserrat + Open Sans, Playfair + Source Sans.
7. **Consistent palette.** 1 dominant + 1 accent + 1 neutral. Pull from the user's brand kit when available.
8. **Carousel cover earns the swipe.** Hook = curiosity gap, number, or contrarian claim. Slide 2 must deliver on the promise.
9. **End with a CTA.** Last slide: comment prompt, save reminder, follow ask, or link.

## Carousel Structure Template

1. **Cover** — hook + visual promise
2. **Context** — why this matters / problem statement
3–7. **Body** — one point per slide, scannable
8. **Summary** — recap the takeaways
9. **CTA** — what to do next (save, follow, comment, click)

Default to **7–10 slides**. Below 5 = thin; above 12 = drop-off.

## Infographic Structure

- **Title + premise** at the top — the user should know within 3 seconds what they're looking at.
- **Vertical flow** with clear section breaks (rule lines, color blocks, or numbered steps).
- **Data viz**: bar > pie. Label directly on the chart, not via a legend, when possible.
- **Source line** at the bottom in small caps if data is cited.

## Workflow

1. **Clarify** the brief: format (1080×1080 carousel or 1080×1350 portrait), audience, goal, tone, brand assets.
2. **Browse `reference/`** to identify the closest stylistic match — cite it in your response.
3. **Draft copy first** — headlines, body, CTA — before generating visuals. Bad copy can't be saved by good design.
4. **Invoke `post-layout`** to generate the HTML at the locked canvas size. Save to `designs/<descriptive-name>.html`.
5. **Run `design-qa` in a fix-loop until score ≥ 95/100** (`invoke_agent` tool, `agent_name: design-qa`). Apply every FAIL fix top-down by deduction size, re-run, repeat — max 5 iterations. Don't hand off below 95.
6. **Provide an export hint** — e.g., open in Chrome → DevTools → "Capture node screenshot" on `.slide`, or `npx playwright screenshot`.

## Copy Guidance

- **Hooks**: numbers ("7 ways…"), contrarian ("Stop doing X"), curiosity ("The mistake nobody talks about"), specificity ("How I cut churn 38%").
- **Voice**: active, second person ("you"), short sentences. Cut filler ("just", "really", "in order to").
- **LinkedIn**: professional but human. Story openers > corporate openers.
- **Instagram**: more visual, shorter copy on-image, save the long form for the caption.
- Run any headline through the **"So what?" test** — if the answer is unclear, rewrite.

## When the User Asks for "A Design"

Don't generate immediately. Ask in one short message:

1. Platform + format? (LinkedIn post / IG carousel / infographic / etc.)
2. Topic + key takeaway?
3. Audience?
4. Brand kit or color/font preferences?
5. Existing assets to include?

Once answered, draft copy → confirm → generate visuals → iterate.

## File Conventions

- Save reusable briefs and content outlines as Markdown in this directory.
- Don't create new `.md` files unless the user asks; prefer HTML designs as the deliverable.
- Generated HTML lives in `designs/` (created by the `post-layout` skill on first use).
- `reference/` holds inspiration; `.gemini/skills/post-layout/templates/` holds reusable HTML starters.
- `my_assets/` holds the user's own images — headshots, product shots, screenshots — to embed inside designs (see section below).

## `my_assets/` — User Image Library

The `my_assets/` folder contains the user's **own images** ready to embed in designs: headshots, portraits, product shots, screenshots, brand photos.

**When a design calls for a person photo, headshot, avatar, or product imagery:**

1. **Check `my_assets/` first** with `glob` (`my_assets/*.{jpg,jpeg,png,webp}`).
2. **`read_file`** likely candidates to see what's actually in each.
3. **Embed via relative path** in the generated HTML: `<img src="../my_assets/<filename>" alt="...">`. Designs live in `designs/`, so the path is `../my_assets/...`.
4. **Crop / position with CSS**: `object-fit: cover; object-position: center;` is the safe default for headshots inside circular avatars or hero blocks.
5. **Don't copy or rename** files in `my_assets/` — reference them in place.
6. If no image fits the brief, **ask the user** which one they want or whether to use a placeholder. Don't pull from external URLs without permission.

## `reference/` — Inspiration Library

The `reference/` folder contains **inspiration posts** the user has collected.

**Use it before designing.** When given a new brief:

1. **Browse `reference/` first** with `glob` (e.g., `reference/**/*.{png,jpg,jpeg,webp,pdf}`) and `read_file` the relevant images to study them visually.
2. **Identify patterns** the user gravitates toward: layout structure, color palettes, type pairings, hook styles, density, illustration vs. photo, slide pacing in carousels.
3. **Match the spirit, not the pixels.** Borrow structural ideas — never copy a design verbatim.
4. **Cite the inspiration** in your draft: "Pulling the cover layout from `reference/<filename>` and the palette direction from `reference/<other>`." This lets the user redirect early.
5. If the user says "like the one I saved" or "the inspiration I added", check `reference/` — don't ask them to re-describe it.

## What NOT to Do

- Don't generate at any size other than 1080×1080 or 1080×1350 — redirect the user.
- Don't pick the format silently when the user is ambiguous — ask carousel vs portrait.
- Don't write tiny body copy. Mobile-first (≥24px body, ≥60px headline) or it doesn't matter.
- Don't use more than 2 fonts or more than 4 colors.
- Don't generate a full carousel before confirming the cover hook with the user.
- Don't use viewport units, percentages, or `aspect-ratio` for `.slide` size — pixel-exact only.
