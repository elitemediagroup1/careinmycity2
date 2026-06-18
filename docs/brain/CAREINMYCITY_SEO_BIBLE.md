# CAREINMYCITY_SEO_BIBLE.md

**Technical & Content SEO Rules for CareInMyCity**
*How pages are structured, marked up, indexed, and kept clean.*

> Inherits EMG_PLATFORM_BIBLE.md (esp. §17 Sitemap/Indexing). Sitemap and robots are protected systems — change them deliberately, never as a side effect.

---

## 1. URL Structure

- Lowercase, hyphenated, descriptive.
- Hierarchy: `/<state>/<city>/<service>/` with trailing slash.
- State: `/<state>/` · City: `/<state>/<city>/` · Service: `/<state>/<city>/<service>/`.
- **No** `/state/` or `/states/` wrapper folder. **No** nested state-in-state paths (e.g. `/florida/florida/` is a defect to exclude/fix).
- Tools/legal pages use clean top-level slugs (`/about/`, `/contact/`, `/privacy/`, `/terms/`, `/my-care-folder/`, `/services/<service>/`).

## 2. Canonical Standards

- Exactly **one** canonical URL per page; self-referencing canonical on every page.
- Trailing-slash consistency across the whole site.
- No duplicate URLs pointing at the same content; consolidate via canonical.

## 3. Title Standards

- Unique per page; ~50–60 chars.
- Pattern (service): `{Service} in {City}, {State} | CareInMyCity`.
- Pattern (city): `Senior Care in {City}, {State} | CareInMyCity`.
- Pattern (state): `Senior Care in {State} | CareInMyCity`.
- No keyword stuffing; human-readable first.

## 4. Meta Description Standards

- Unique per page; ~140–160 chars.
- Describe the help offered + local relevance; include a soft, non-salesy hook.
- No fear language, no false claims.

## 5. H1 / H2 Rules

- One `<h1>` per page, matching the page's core intent.
- `<h2>`s map to the required content sections (see Editorial Bible structures).
- Logical, nested heading order (no skipping levels for styling).

## 6. Schema Rules (General)

- Use valid JSON-LD.
- Keep schema accurate to on-page content (no schema for content that isn't there).
- Required across the site: Organization, Person (author), Breadcrumb; add LocalBusiness/Service and FAQ where genuinely applicable.

## 7. JSON-LD Rules

- One consolidated, valid JSON-LD block per page (or logically separated blocks).
- Validate with Google Rich Results Test before shipping batches.
- Never inject misleading or fake review/rating schema.

## 8. Author Schema (Person)

- `Person` for the author/founder, with name, role, and (where available) sameAs links.
- Consistent across pages; ties to the visible author attribution.

## 9. Person Schema

- Use for founder/author and any named expert.
- Establishes EEAT authoritativeness; keep names/roles consistent with on-page bios.

## 10. Organization Schema

- `Organization` for CareInMyCity, with logo, URL, and parent (Elite Media Group) where appropriate.
- Consistent NAP/brand details sitewide.

## 11. Breadcrumb Schema

- `BreadcrumbList` reflecting the state → city → service hierarchy.
- Visible breadcrumb UI should match the schema.

## 12. Sitemap Rules

- **Only real, public, valid, canonical URLs.**
- **Never** include: phantom pages, 404 routes, preview/branch URLs, localhost, internal/QA/NOTES/PLAN/REPORT/MANIFEST/STATUS files, malformed nested-state paths, or duplicate flat tool URLs.
- One entry per canonical URL; zero duplicates.
- Well-formed XML: one declaration, one `<urlset>`.
- Add new URLs **only after** the page is real, reachable, and linked.
- Sitemap.xml is a protected file — edits are deliberate and verified (count, dedupe, validity) before commit.

## 13. Robots Rules

- robots.txt is protected; change only when truly required.
- Don't block valid public pages; don't expose internal/QA paths in the sitemap.
- Keep robots and sitemap in agreement (don't list blocked URLs in the sitemap).

## 14. Internal Linking

- Up/across/down within state→city→service.
- Related-services links on every service page.
- No orphan pages; every public page reachable from nav + contextual links.
- Descriptive anchor text.

## 15. State / City / Service Linking

- State → its cities + statewide services.
- City → its services + parent state.
- Service → related services + parent city + parent state.
- Tools (Carl, My Care Folder) linked contextually from service/city pages.

## 16. Duplicate-Content Prevention

- No name-swap clones; each page needs genuinely local, unique content.
- Canonical tags consolidate any unavoidable near-duplicates.
- Vary intros, resources, and local entities per page.

## 17. Thin-Content Prevention

- Each page must fully answer its intent (see Editorial Bible structures).
- No placeholder/"coming soon" pages in the index or sitemap.
- Minimum useful substance before a page is eligible for indexing or AdSense.

## 18. AdSense Quality Considerations

- Ads only on substantive pages; never on thin/placeholder/error pages.
- Clean content-to-ad ratio; no deceptive placement.
- Indexing readiness and AdSense readiness move together.

## 19. Image Alt Text

- Descriptive, meaningful alt text on all content images.
- No keyword stuffing; describe the image's purpose.
- Decorative images use empty alt.

## 20. Indexation Workflow

1. Page is built, real, linked, canonicalized.
2. Add to sitemap (validated).
3. Submit/ping via IndexNow.
4. Confirm in Search Console / Bing.
5. Monitor coverage + fix errors.

## 21. Google Search Console Workflow

- Verify property; submit sitemap.xml.
- Monitor Coverage/Pages for errors, excluded, and valid counts.
- Use URL Inspection for new/changed pages; request indexing for priority pages.
- Track Performance to find pages needing improvement.

## 22. Bing Webmaster Tools Workflow

- Verify property; submit sitemap.xml.
- Monitor indexed counts and crawl issues.
- Use Bing's URL submission for priority pages.

## 23. IndexNow Workflow

- On publishing/updating real pages, submit their URLs via IndexNow for fast discovery.
- Only submit real, public, canonical URLs (never phantom/preview/internal).
- Batch submissions for expansion releases.

## 24. Page Expansion QA Checklist

- [ ] Real, reachable page (no 404)
- [ ] Unique, useful, non-thin content
- [ ] One H1; logical headings
- [ ] Unique title + meta description
- [ ] Self-referencing canonical
- [ ] Valid JSON-LD (Org/Person/Breadcrumb; Service/FAQ where apt)
- [ ] Internal links up/across/down (no orphan)
- [ ] Alt text on images
- [ ] Visible disclaimer + author attribution
- [ ] Added to sitemap (validated, deduped)
- [ ] Submitted via IndexNow / Search Console / Bing

---

> **The sitemap must only contain real, public, valid URLs. Never include phantom pages or routes that do not exist.**
