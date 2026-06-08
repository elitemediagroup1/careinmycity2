# CareInMyCity Carl Tools Live Integration Patch

This package is intended to move the Carl tools from prototype to live-site integration.

## What this includes

This package contains the full transparent-logo Carl Care Quiz tools package plus integration snippets for the existing CareInMyCity site.

## Deploy these folders/files

Upload these to the site root:

- `/tools/`
- `/assets/styles.css`
- `/assets/carl-care-guide.png`
- `/assets/careinmycity-logo-transparent.png`
- `/assets/careinmycity-logo-transparent.webp`
- `/assets/carl-integration.css`
- `/assets/care-routing-helper.js`
- `/assets/care-routing-map.json`
- `/netlify/functions/carl-care-quiz.js`
- `netlify.toml`
- `package.json`

## Required Netlify environment variable

Set this in Netlify:

`ANTHROPIC_API_KEY`

Optional:

`ANTHROPIC_MODEL`

## Live site integration steps

### 1. Point the Ask Carl widget to the Carl Care Quiz

Current bottom-right Ask Carl widget should link to:

`/tools/carl-care-quiz.html`

Use:

`/integration-snippets/ask-carl-widget-update.html`

### 2. Add Care Resources to navigation

Add a nav item/dropdown under the existing nav:

`/integration-snippets/nav-care-resources-dropdown.html`

Suggested label:

`Care Resources`

Primary destination:

`/tools/`

### 3. Add Carl bridge section to homepage

Place this after the existing “Three calmer ways to begin” section:

`/integration-snippets/homepage-carl-bridge-section.html`

Also load:

`/assets/carl-integration.css`

### 4. Add contextual CTAs during the next page bulk pass

Use these snippets depending on page type:

- `/integration-snippets/state-page-carl-cta.html`
- `/integration-snippets/city-hub-carl-cta.html`
- `/integration-snippets/service-memory-care-carl-cta.html`
- `/integration-snippets/service-elder-law-carl-cta.html`
- `/integration-snippets/service-provider-call-prep-carl-cta.html`

## Recommended implementation order

1. Upload tools and Netlify function.
2. Add `ANTHROPIC_API_KEY`.
3. Change Ask Carl widget href to `/tools/carl-care-quiz.html`.
4. Add Care Resources nav item.
5. Add homepage Carl bridge section.
6. Add contextual CTAs during next state/city/service page export.

## Product logic

The live site already does:

- emotional framing
- local geography routing
- state/city/service SEO

Carl adds:

- care situation capture
- Care Profile starter
- personalized Care Roadmap
- shareable summary
- tool-based return behavior

The loop becomes:

SEO page → Carl → Care Roadmap → local city/service page → saved profile/share/return.


## Developer note

User-facing copy has been cleaned so the site does not say “LLM” to families. 
Technical implementation still uses a Netlify server-side function for Carl’s personalized Care Quiz response.
