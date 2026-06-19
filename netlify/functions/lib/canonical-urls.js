// Canonical URL filter for IndexNow submissions.
// Ensures only canonical production URLs are submitted:
//   - must be https://careinmycity.com/...
//   - rejects Netlify preview / deploy-preview / branch URLs
//   - rejects legacy top-level state paths (e.g. /alabama/...) which now
//     301-redirect to canonical /state/... paths

const CANONICAL_ORIGIN = 'https://careinmycity.com';

const STATE_SLUGS = [
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada',
  'new-hampshire','new-jersey','new-mexico','new-york','north-carolina',
  'north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
  'south-carolina','south-dakota','tennessee','texas','utah','vermont',
  'virginia','washington','west-virginia','wisconsin','wyoming'
];

function isCanonicalUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch (e) {
    return false;
  }

  // Must be exactly the canonical https origin (no preview/branch hosts).
  if (u.protocol !== 'https:') return false;
  if (u.hostname !== 'careinmycity.com') return false;

  // Defensive: reject anything that looks like a Netlify preview host.
  if (/netlify\.app$/i.test(u.hostname)) return false;

  // Reject legacy top-level state paths (/alabama/..., /texas/..., etc.).
  // Canonical state pages live under /state/<slug>/...
  const first = u.pathname.split('/').filter(Boolean)[0];
  if (first && STATE_SLUGS.indexOf(first) !== -1) return false;

  return true;
}

// Filters an array of URLs down to canonical production URLs only.
// Returns { valid: [...], rejected: [...] }.
function filterCanonicalUrls(urls) {
  const valid = [];
  const rejected = [];
  const seen = new Set();
  (Array.isArray(urls) ? urls : []).forEach((raw) => {
    const url = typeof raw === 'string' ? raw.trim() : '';
    if (!url) return;
    if (isCanonicalUrl(url) && !seen.has(url)) {
      seen.add(url);
      valid.push(url);
    } else if (!isCanonicalUrl(url)) {
      rejected.push(url);
    }
  });
  return { valid, rejected };
}

module.exports = { CANONICAL_ORIGIN, STATE_SLUGS, isCanonicalUrl, filterCanonicalUrls };
