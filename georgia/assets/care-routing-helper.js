// CareInMyCity Carl routing helper
// Converts state/city/service slugs into existing local directory URLs.

window.CIMC_CarlRouting = {
  slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  buildLocalUrl(state, city, service) {
    const stateSlug = this.slugify(state);
    const citySlug = this.slugify(city);
    const serviceSlug = this.slugify(service);
    if (!stateSlug) return "/tools/carl-care-quiz.html";
    if (!citySlug) return `/${stateSlug}/`;
    if (!serviceSlug || serviceSlug === "care-roadmap") return `/${stateSlug}/${citySlug}/`;
    return `/${stateSlug}/${citySlug}/${serviceSlug}/`;
  },

  serviceFromConcern(text) {
    const value = String(text || "").toLowerCase();
    const rules = [
      [/memory|forget|stove|wandering|confusion|nighttime/, "memory-care"],
      [/caregiver|burnout|overwhelmed|backup|respite/, "respite-care"],
      [/home|bathing|dressing|meal|transportation|medication/, "home-care"],
      [/assisted|cannot live alone|community/, "assisted-living"],
      [/poa|power of attorney|guardianship|medicaid|elder law|legal/, "elder-law"],
      [/ssdi|disability|denial|appeal/, "ssdi"],
      [/funeral|burial|final expense|insurance/, "final-expense-support"]
    ];
    const hit = rules.find(([regex]) => regex.test(value));
    return hit ? hit[1] : "home-care";
  }
};
