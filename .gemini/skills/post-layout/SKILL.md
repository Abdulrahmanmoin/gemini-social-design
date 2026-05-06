---
name: post-layout
description: Generate HTML-format LinkedIn / Instagram posts, carousels, and infographics at locked canvas sizes (1080×1080 or 1080×1350). Produces self-contained HTML files ready to screenshot or render to PNG.
---

# post-layout

Produce **HTML-format** social media designs at one of two locked canvas sizes. No other dimensions are allowed.

## Locked Canvas Sizes

| Use case | Dimensions | Aspect |
|---|---|---|
| Carousel slide (every slide) | **1080 × 1080 px** | 1:1 |
| Portrait single post / tall carousel | **1080 × 1350 px** | 4:5 |

If the user asks for any other size, **stop and redirect** to one of these two.

## Required Clarifying Questions

Before generating, confirm:
1. Format (1080×1080 or 1080×1350)
2. Topic + key takeaway
3. Slide count (if carousel)
4. Audience + tone
5. Color/font preferences (or pull from `reference/`)
6. Existing assets (logo, headshot, etc.)

## Workflow

1. `glob` `D:\GEMINI_DESIGN\reference\**/*` and `read_file` to study patterns.
2. Cite stylistic match from `reference/`.
3. Draft copy first.
4. Generate HTML (pixel-exact `.slide`).
5. Save to `D:\GEMINI_DESIGN\designs/`.
6. **Invoke `design-qa` agent** until score ≥ 95.

## HTML Hard Rules

- Width: 1080px. Height: 1080px or 1350px.
- `overflow: hidden` on `.slide`.
- `box-sizing: border-box`.
- Inline `<style>` only.
- Body copy ≥ 24px, Headlines ≥ 60px.
- Inner padding ≥ 80px.

## User Assets

- `glob` `D:\GEMINI_DESIGN\my_assets\**/*` to find images.
- Use relative path from `designs/`: `../my_assets/<filename>`.

## QA Fix-Loop (mandatory · target ≥ 95/100)

After generating HTML:
1. `invoke_agent(agent_name: "design-qa", prompt: "QA D:\GEMINI_DESIGN\designs\<file>.html")`
2. If score < 95, apply fixes and re-run (max 5 iterations).
