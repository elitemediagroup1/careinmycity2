# CAREINMYCITY_BRAND_BRAIN.md

**CareInMyCity Source of Truth**
*The canonical reference for AI agents and team members. Read this before editing anything.*

> Inherits EMG_PLATFORM_BIBLE.md. When generating or editing CareInMyCity pages, this file is your single source of facts and constraints.

---

## 1. Core Facts About CareInMyCity

- CareInMyCity is an EMG (Elite Media Group) **local-intent senior/family care guidance platform**.
- It is **product brand**; Elite Media Group is the **owning company**.
- It is educational + AI-assisted; it is **not** a provider, broker, or professional advisor.
- Architecture: **State → City → Service** pages, plus tools, resources, and legal pages.
- Copyright form: `© 2026 Elite Media Group. All Rights Reserved.`

## 2. Approved Positioning

"CareInMyCity helps families confidently navigate senior care through educational resources, AI guidance (Carl), organizational tools (My Care Folder), and trusted public information — organized by location."

Positioning pillars: **Trust, Clarity, Local relevance, Family-first, AI-assisted.**

## 3. Product Ecosystem

1. **Carl** — conversational AI Care Guide.
2. **My Care Folder** — document/planning/collaboration tool.
3. **National coverage** — state, city, and service pages.
4. **Care tools** — interactive resources (quizzes, planners).
5. **Public resources** — curated government/nonprofit links.
6. **Trust layer** — About, author/founder attribution, disclaimers, schema.

## 4. Carl Overview

Carl is the AI Care Guide. He is conversational (not a quiz), warm, and practical. He helps users understand options, organize documents, locate resources, prepare questions, and navigate decisions. He never gives medical/legal/financial/insurance advice and escalates emergencies appropriately. Full spec: CAREINMYCITY_AI_CARL_BRAIN.md.

## 5. My Care Folder Overview

A tool for organization and planning: document storage, planning tools, caregiver collaboration, and preparation for care conversations and appointments. It is the tangible expression of CareInMyCity's promise to bring order to a chaotic moment.

## 6. Public Resource Philosophy

Surface **free, public, authoritative** resources first: government agencies (Medicare, Medicaid, VA, Area Agencies on Aging), and reputable nonprofits. Always cite the source. Never present public resources as proprietary, and never charge for access to them.

## 7. Service Taxonomy

Core CareInMyCity services:

- Home Care
- Assisted Living
- Memory Care
- Respite Care
- Elder Law
- SSDI (Social Security Disability)
- Final Expense Support

Additional services may be added via the Expansion Bible process. Every service must map to a real, useful page type.

## 8. Location Taxonomy

- **State** pages: `/<state>/` — overview + links to cities and services in that state.
- **City** pages: `/<state>/<city>/` — local overview + links to services in that city.
- **Service** pages: `/<state>/<city>/<service>/` — the local service detail page.
- Canonical scheme uses **flat lowercase state and city folders** (e.g. `/florida/orlando/home-care/`).
- **No `/state/` or `/states/` wrapper folder.** No nested state-in-state paths (e.g. `/florida/florida/` is a defect).

## 9. State / City / Service Page Rules

- Each page must be **real, reachable, internally linked, canonicalized, and in the sitemap** (only after it is real).
- Each must be **unique** — never a pure name-swap clone.
- Service pages follow the structure in CAREINMYCITY_EDITORIAL_BIBLE.md.
- City pages link to all available services in that city + parent state.
- State pages link to cities + statewide resources.

## 10. CTA Rules

- CTAs are **helpful, not pushy**: "Ask Carl", "Start My Care Folder", "See public resources", "Contact us".
- Primary contact CTA links to `/contact/`.
- No fake-urgency CTAs, no "act now", no manufactured scarcity.
- One clear primary CTA per page; secondary CTAs support, don't compete.

## 11. Disclaimer Rules

Every relevant page states CareInMyCity provides educational information and public resources only and does **not** provide medical, legal, financial, or insurance advice. Disclaimers are visible and never removed during edits.

## 12. Cross-Linking Rules

- Link up/across/down within the state→city→service hierarchy.
- Link service pages to related services.
- Cross-link to sibling EMG properties only when genuinely relevant (e.g., pets → PetsInMyCity; consumer/insurance/support → ConsumerSupportHelp).
- Descriptive anchor text; no orphan pages.

## 13. AdSense Rules

- AdSense only on substantive, useful pages — never thin/placeholder/error pages.
- Never alter the centralized AdSense loader during content edits.
- Maintain clean content-to-ad ratio; no deceptive placement.

## 14. Affiliate Rules

- Disclose clearly near the link.
- Only categories that genuinely help families.
- Never inside Carl's responses unless explicitly designed, labeled, and compliant.
- Affiliate content meets the same EEAT/editorial bar as everything else.

## 15. What to Preserve in Every Future Edit

- Disclaimers and author/founder attribution.
- Canonical URLs and internal linking.
- The calm, trustworthy, family-first voice.
- Schema (Organization, Person/author, Breadcrumb).
- The footer's professional multi-column structure and EMG copyright.
- Mobile responsiveness and accessibility.

## 16. What to Never Overwrite

- Protected engineering systems (see §17).
- Existing valid canonical tags.
- Required disclaimers and attribution.
- The sitemap's integrity (no phantom URLs).

## 17. Protected Engineering Systems (DO NOT MODIFY DURING CONTENT WORK)

These are off-limits for content/presentation edits. Changes require explicit, deliberate engineering authorization — never as a side effect:

- **Conversational Carl** (the AI guide system/UX)
- **assets/site.js**
- **netlify/functions/carl-care-quiz.js**
- **CareLocation** (location context system)
- **Google Places / location lookup**
- **search routing**
- **AdSense loader**
- **GA / analytics**
- **robots.txt**
- **sitemap.xml**
- **Netlify functions** (all)

> Presentation-layer exceptions (e.g., footer/About styling in assets/styles.css) must be explicitly authorized per task and must not touch behavior, scripts, or the systems above.

---

*If a requested edit would touch §17, stop and confirm it is an authorized engineering change — not content work.*
