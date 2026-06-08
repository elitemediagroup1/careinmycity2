# Carl Care Quiz — Carl-Wired Drop-In

This package upgrades only the Care Quiz into an Carl-backed Carl response.

## What changed

- Replaced `/tools/carl-care-quiz.html`
- Added Netlify function:
  - `/netlify/functions/carl-care-quiz.js`
- Added:
  - `netlify.toml`
  - `package.json`
  - `README_Carl_CARE_QUIZ_FOR_MATT.md`

## How it works

The frontend sends these fields to the Netlify function:

- whoNeedsHelp
- location
- whatChanged
- urgency
- checked concerns

The Netlify function calls Anthropic server-side and returns a JSON response:

- situation_summary
- suggested_paths
- next_step
- questions_to_ask
- local_routing_note
- guardrail_note

The frontend renders Carl’s Care Roadmap.

## Required environment variable

In Netlify:

`ANTHROPIC_API_KEY`

Optional:

`ANTHROPIC_MODEL`

Default in the function:

`claude-sonnet-4-5`

## Why server-side

Do not expose the Carl response function key in browser JavaScript. The key must live in Netlify environment variables.

## Fallback behavior

If the API key is missing, the API call fails, or local dev is not running Netlify functions, the page falls back to local routing logic so the tool still works.

## Guardrails

Carl is prompted to:

- organize the care situation
- summarize what the user shared
- suggest care paths to compare
- provide questions to ask
- give one next step

Carl is prompted not to provide:

- medical advice
- diagnosis
- treatment recommendations
- legal advice
- insurance advice
- financial advice
- benefits eligibility determinations

## Next phase

Once this is deployed and working, upgrade next:

1. Family Care Summary Builder
2. Provider Call Prep Tool
3. Care Profile persistence beyond localStorage
4. City/service URL routing based on normalized location
5. Reminder system


## Polish pass applied

Charlie flagged three UX/brand issues, now fixed:

- Carl was too small visually. Carl is now larger in the tool/homepage panels and widget.
- The CareInMyCity logo was not a vector asset. This package now includes cleaned raster logo exports:
  - `/assets/careinmycity-logo-clean.png`
  - `/assets/careinmycity-logo-clean.webp`
- User-facing CTA language no longer says "Carl." Buttons now use family-friendly language like:
  - "Start Carl’s Care Quiz"
  - "Build My Care Roadmap"

If Matt has the true vector/SVG logo, he should replace the raster logo with:
`/assets/careinmycity-logo.svg`
and update header/footer image paths.


## Transparent logo fix

The previous raster logo still had a visible white canvas. This version creates and uses:

`/assets/careinmycity-logo-transparent.png`

Header and footer logo references have been updated to use the transparent asset. Footer logo CSS no longer places the logo on a white card.


## Developer note

User-facing copy has been cleaned so the site does not say “LLM” to families. 
Technical implementation still uses a Netlify server-side function for Carl’s personalized Care Quiz response.
