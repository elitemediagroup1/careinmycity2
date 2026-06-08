# CareInMyCity Care Support Toolkit

This package creates Carl-centered support tools for CareInMyCity.

## What is included

- Landing page for Carl’s Care Support Toolkit
- 9 standalone tool pages:
  - Carl’s Care Quiz
  - Caregiver Burnout Checker
  - Home Safety Walkthrough
  - Family Care Summary Builder
  - Provider Call Prep Tool
  - Document Checklist
  - Hospital Discharge Helper
  - Memory Concern Tracker
  - First 72 Hours Plan
- Shared CSS
- CareInMyCity logo asset
- Carl image asset
- Manifest

## Important

These are static front-end prototypes with light JS summary behavior.

They are designed to be safe:
- They do not provide medical advice.
- They do not provide legal advice.
- They do not provide insurance advice.
- They do not provide benefits eligibility determinations.

Carl’s role is to organize the situation, suggest categories to compare, and prepare better questions.

## Suggested site paths

/tools/
/tools/carl-care-quiz.html
/tools/caregiver-burnout-checker.html
/tools/home-safety-walkthrough.html
/tools/family-care-summary.html
/tools/provider-call-prep.html
/tools/document-checklist.html
/tools/hospital-discharge-helper.html
/tools/memory-concern-tracker.html
/tools/first-72-hours.html

## Next phase

Wire these into:
- Ask Carl care support
- Care Profile storage
- My Care Folder
- Email/SMS reminders
- City/service routing


## Carl Care Quiz Upgrade

This version includes a Netlify function for Carl’s Care Quiz. Add `ANTHROPIC_API_KEY` in Netlify environment variables before expecting live Carl responses. The page has fallback logic if the function/API is unavailable.


## Brand/UX polish pass

- Increased Carl’s visual prominence.
- Replaced user-facing "Carl" terminology with Carl/Care Roadmap language.
- Added cleaned logo raster files because the supplied logo was not vector/SVG.


## Transparent logo fix

The previous raster logo still had a visible white canvas. This version creates and uses:

`/assets/careinmycity-logo-transparent.png`

Header and footer logo references have been updated to use the transparent asset. Footer logo CSS no longer places the logo on a white card.
