CareInMyCity static site package

Files included:
- index.html
- florida/index.html
- search/index.html
- assets/styles.css
- assets/site.js
- assets/careinmycity-logo.png

Notes for Matt:
- The logo has been changed across the current site pages.
- The site uses shared CSS and JS from /assets.
- The homepage finder form routes to search/index.html with query parameters.
- The Florida page finder form routes to ../search/index.html with state, careType, and location parameters.
- The search page is a static prototype and can be connected to a CMS, database, or routing logic later.
- CareInMyCity should not be positioned as a medical provider, law firm, insurance carrier, or government agency.

Updated Boca Raton page:
- florida/boca-raton/index.html now includes a local-area context section
- shared CSS includes .local-area-section template styles
- logo sizing tightened for the wide CareInMyCity logo

Updated local intelligence:
- Boca Raton city page now includes an editorial local care context section
- Florida state page now includes a state-level care context section
- CSS includes reusable .local-intel-section and .state-intel-section patterns

Removed Boca Raton hero trust-row because the local intelligence section now handles that context more naturally.

Navigation update:
- Header nav simplified across homepage, Florida, Boca Raton, and Search pages
- Logo sizing tightened for wide logo
- Added responsive mobile menu button and JS behavior
- Added active nav state styling

Global navigation update:
- New nav: Home, About Us, States of Coverage dropdown, Services dropdown, Find Care CTA
- Added About Us page
- Added starter service guide pages under /services/
- Florida now lives under States of Coverage rather than as a permanent top-level nav item

Resource engine update:
- Added /assets/data/resources.json with first sample guide/provider resource records
- Search page now filters and displays resources from JSON
- Boca Raton page now includes a filtered resource section
- Florida page now includes a statewide filtered resource section
- site.js includes resource loading, filtering, result card rendering, and save button behavior

Resource engine reliability update:
- resources.json remains at /assets/data/resources.json
- site.js now includes an inline fallback resource dataset
- if fetch is blocked during local file preview, resources still render
- public-facing resource section copy no longer mentions shared data files

Carl update:
- Added Carl, your Care Companion, as a site-wide floating helper
- Added homepage Carl feature section
- Carl routes users toward care categories and local resources based on chips or free-text input
- Carl includes compliance disclaimer and avoids medical/legal/financial/insurance advice
- Cleaned resource data to show guide cards only until real provider listings are added

Footer logo treatment softened: reduced white outline and slightly reduced footer logo size.

Footer/Carl correction:
- Footer logo now sits on a clean white plate for readability
- Removed shadow-outline experiment
- Fixed Carl launcher positioning and avatar clipping
- Added explicit .carl-launcher-label class for mobile-safe behavior


SAFE_REBUILD_NOTES

This package was rebuilt from the last stable CareInMyCity version, not from the broken 50-state package.

Fixed approach:
- Preserved the stable homepage, Carl, footer, resources, styles, and core structure
- Added all 50 state pages safely as standalone pages
- Added /states/ national coverage index
- Added homepage coverage map without rewriting the whole homepage
- Added safe dropdown population via JS
- Added state search forms
- Added guide resources for all states
- Updated sitemap and robots

Known direction:
- This is a safe national state-level foundation.
- Next step should be top city pages, not another global rewrite.


CITY_LAYER_ROLLOUT_NOTES

Added:
- City pages under /state/city/ for the main cities listed on every state page
- Updated state page city cards to point to actual city pages
- Preserved existing custom pages, including /florida/boca-raton/
- Added city-page SEO metadata, FAQ schema, resource sections, category cards, search form, and local context
- Tightened the homepage guidance box so it reads like visitor-facing copy, not an internal template note
- Updated sitemap with city URLs

City page URL pattern:
- /florida/boca-raton/
- /new-york/staten-island/
- /new-jersey/hoboken/
- /texas/houston/

Next recommended layer:
- city + service pages, for example /florida/boca-raton/home-care/


CITY_LAYER_PATCH_NOTES

Fixed:
- Replaced old dropdown markup across the full site.
- Added final dropdown JS patch so States of Coverage populates all states and opens reliably.
- Updated city page visible headings to include City, State abbreviation.
  Example: Helpful Great Falls, MT care resources.
- Made state-page city pills clickable links to actual city pages.
- Re-confirmed state-page city cards point to /state/city/ pages.
- Updated sitemap.

Reason:
- City-only headings can duplicate across states and are weaker for search.
- Decorative city pills looked clickable but were not. They now link.


SEO/AEO TIGHTENING PASS

Completed:
- Re-applied canonical tags across all HTML pages.
- Re-applied Open Graph tags across all HTML pages.
- Re-applied Twitter card tags across all HTML pages.
- Added Organization schema across all pages.
- Added WebSite schema across all pages.
- Added BreadcrumbList schema across all pages.
- Added FAQPage schema across all pages.
- Added ItemList schema for state, city, and states index pages.
- Updated city H1s and key section headers to include City, ST.
- Refreshed sitemap.xml.
- Refreshed robots.txt.
- Added QA report: SEO_AEO_TIGHTENING_QA.json.

QA summary:
- HTML pages: 460
- Sitemap URLs: 460
- Canonical tags: 460
- OG title tags: 460
- Twitter card tags: 460
- JSON-LD blocks: 2291
- State pages detected: 50
- City pages detected: 400
- City H1 state checks: 400
- City H1 missing state count: 0

Next monetization/sticky layer:
- Provider listing profiles
- Featured placement slots
- Carl lead capture flows
- Saved resources
- Email/text follow-up
- Buyer routing by care category and geo


NAV_SEARCH_FIX_NOTES

Fixed:
- Rebuilt header markup across all HTML pages.
- Added final capture-phase nav handler to prevent old handlers from closing dropdowns immediately.
- States dropdown now populates all 50 states by region.
- Added mobile menu open state.
- Patched state, city, and homepage map search forms.
- No SEO/AEO schema changes were removed.

This package is based on careinmycity_seo_aeo_tightened.zip.


CARE_RESOURCE_GUIDES_UPDATE

Changed:
- Renamed nav concept from Services to Care Resources.
- Rewrote dropdown copy to explain each resource category in plain English.
- Rebuilt each guide page as a FAQ/explainer resource, not a service sales page.
- Added sections:
  - What is it?
  - When do families usually look for it?
  - What can it include?
  - Questions to ask before choosing an option
  - What should families be careful about?
  - Related resources
  - Find local resources
- Added FAQ schema for each resource guide.
- Updated sitemap.

Resource guide pages:
- /services/home-care/
- /services/memory-care/
- /services/assisted-living/
- /services/respite-care/
- /services/elder-law/
- /services/final-expense/


CAREINMYCITY MONETIZATION/STICKY BUILD

Built:
- City + service intent pages for every city and care category.
- URL pattern:
  /florida/boca-raton/home-care/
  /new-york/staten-island/memory-care/
  /new-jersey/hoboken/elder-law/
  /texas/houston/final-expense-support/

Created:
- 2400 city + service pages.
- 2400 provider placement slot records.
- Provider slot data file: /assets/data/provider_slots.json
- Lead capture schema file: /assets/data/lead_capture_schema.json

Added to city + service pages:
- Explainer content
- Questions to ask
- Local provider/resource placement cards
- Featured placement available card
- Verified profile slot
- Sponsored resource slot
- Care request / lead capture form
- FAQ schema
- Breadcrumb schema
- ItemList schema

Added to city pages:
- Monetization preview section explaining where provider profiles and featured placements live.
- Category cards now point to city + service pages instead of generic search pages.

Lead capture:
- Prototype forms store payloads in browser localStorage under careinmycity_leads.
- Payloads are also logged to console.
- Production routing can connect to HubSpot, Airtable, Google Sheets, Twilio, or buyer-specific ping/post.

QA:
- HTML pages: 2860
- Sitemap URLs: 2860
- City + service pages created: 2400
- Provider slots: 2400


CUSTOMER_FACING_PATCH_NOTES

Fixed:
- Removed internal-facing “High-intent local page” headline from city + service pages.
- Replaced it with customer-facing copy: “Start with what your family needs most.”
- Restored homepage from the stronger prior homepage version where available.
- Ensured homepage has a state coverage map/navigation section.
- Preserved monetization pages, provider slots, lead capture schema, and city + service page structure.

QA:
- HTML pages: 2860
- Sitemap URLs: 2860
- High-intent label remaining: 0
- Homepage has coverage map: True
