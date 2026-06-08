/**
 * Netlify Function: Carl Care Quiz Carl response
 *
 * Environment variable required:
 *   ANTHROPIC_API_KEY
 *
 * Optional:
 *   ANTHROPIC_MODEL
 *
 * Recommended model default is intentionally configurable.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

const SYSTEM_PROMPT = `
You are Carl, the CareInMyCity care guide.

Your role:
- Help families organize a care-related situation.
- Summarize what the user shared in warm, plain English.
- Suggest likely care paths to compare, with short rationale.
- Give one specific next step.
- Keep the response calm, practical, and human.

You must not:
- Provide medical advice, diagnosis, treatment recommendations, emergency triage, legal advice, insurance advice, financial advice, or benefits eligibility determinations.
- Claim a specific provider, facility, attorney, insurance product, or benefit is right for the user.
- Say the user qualifies for anything.
- Overstate certainty.
- Use fear-based language.

Safety:
- If the user describes immediate danger, serious medical emergency, abuse, self-harm, or someone being unsafe right now, tell them to contact emergency services or a qualified professional immediately, then provide a brief organizing next step.
- For medical questions, say to contact a doctor or qualified clinician.
- For legal questions, say to contact a qualified attorney.
- For SSDI/benefits questions, say to contact a qualified SSDI attorney, advocate, or benefits professional.
- For insurance/final expense questions, say to contact a licensed insurance professional.

Output format:
Return ONLY valid JSON. No markdown. No extra text.

JSON shape:
{
  "situation_summary": "1 short paragraph, warm and specific to what they wrote.",
  "suggested_paths": [
    { "path": "Home Care", "reason": "one-line rationale" }
  ],
  "next_step": "one specific next step they can take today or this week.",
  "questions_to_ask": [
    "question 1",
    "question 2",
    "question 3"
  ],
  "local_routing_note": "one sentence explaining how CareInMyCity can route them to local city/service pages once location is known.",
  "guardrail_note": "one sentence that Carl organizes the search but does not replace qualified medical/legal/insurance/benefits professionals."
}

Keep total response content under 250 words.
`;

const allowedOrigins = [
  "https://careinmycity.com",
  "https://www.careinmycity.com",
  "http://localhost:8888",
  "http://localhost:3000",
  "http://127.0.0.1:8888"
];

function corsHeaders(event) {
  const origin = event.headers.origin || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://careinmycity.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
}

function safeString(value, max = 800) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function normalizePayload(body) {
  const data = JSON.parse(body || "{}");
  const checked = Array.isArray(data.checked) ? data.checked.map(x => safeString(String(x), 120)).filter(Boolean).slice(0, 12) : [];
  return {
    whoNeedsHelp: safeString(data.whoNeedsHelp, 160),
    location: safeString(data.location, 160),
    whatChanged: safeString(data.whatChanged, 1000),
    urgency: safeString(data.urgency, 100),
    checked,
    pageContext: safeString(data.pageContext, 300)
  };
}

function validatePayload(payload) {
  const hasEnough = payload.whoNeedsHelp || payload.location || payload.whatChanged || payload.checked.length;
  if (!hasEnough) {
    return "Please share at least one detail about the situation before Carl builds a summary.";
  }
  return null;
}

function fallbackResponse(payload) {
  const checkedText = payload.checked.length ? payload.checked.join(", ") : "general care support";
  const paths = [];
  const lower = `${payload.whatChanged} ${checkedText}`.toLowerCase();

  if (/memory|stove|wand|confus|forget|medication/.test(lower)) {
    paths.push({ path: "Memory Care", reason: "Memory or safety concerns may mean the family should compare supervision, routines, and home-safety questions." });
  }
  if (/home|bath|dress|meal|transport|alone|daily/.test(lower)) {
    paths.push({ path: "Home Care", reason: "Help at home may support daily routines, companionship, transportation, and caregiver relief." });
  }
  if (/burnout|overwhelm|backup|sleep|exhaust/.test(lower)) {
    paths.push({ path: "Respite Care", reason: "Caregiver strain may mean short-term backup or scheduled relief should be explored." });
  }
  if (/poa|power|legal|medicaid|guardianship|attorney/.test(lower)) {
    paths.push({ path: "Elder Law", reason: "Legal or decision-making questions should be discussed with a qualified elder law attorney." });
  }
  if (/ssdi|disability|denial|appeal|work/.test(lower)) {
    paths.push({ path: "SSDI Help", reason: "Disability paperwork, appeals, or income disruption may call for an SSDI attorney, advocate, or benefits professional." });
  }
  if (/funeral|final|expense|insurance|burial/.test(lower)) {
    paths.push({ path: "Final Expense Support", reason: "Planning around funeral-related costs or coverage should be reviewed with a licensed insurance professional." });
  }
  if (!paths.length) {
    paths.push(
      { path: "Home Care", reason: "It may be helpful to compare practical support at home first." },
      { path: "Respite Care", reason: "If family caregivers are carrying the situation, backup support may be worth exploring." }
    );
  }

  return {
    situation_summary: `It sounds like your family is trying to organize a care decision around ${payload.whatChanged || checkedText}. That can feel heavy because it is not just a service search — it is about safety, timing, family roles, and what to do next.`,
    suggested_paths: paths.slice(0, 4),
    next_step: "Write down what changed, when it started, who needs to be involved, and the most urgent question you need answered this week.",
    questions_to_ask: [
      "What support is needed immediately versus later?",
      "Who in the family should be part of the next conversation?",
      "What professional should answer the medical, legal, benefits, or insurance questions?"
    ],
    local_routing_note: payload.location ? `CareInMyCity can use ${payload.location} to route this into local city/service pages.` : "Once a city and state are added, CareInMyCity can route this into local city/service pages.",
    guardrail_note: "Carl helps organize the search, but qualified professionals should answer medical, legal, benefits, insurance, or financial questions."
  };
}

exports.handler = async (event) => {
  const headers = corsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let payload;
  try {
    payload = normalizePayload(event.body);
  } catch (error) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON payload" }) };
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: validationError }) };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "fallback",
        response: fallbackResponse(payload)
      })
    };
  }

  const userPrompt = `
Care quiz input:
- Who needs help: ${payload.whoNeedsHelp || "Not specified"}
- Location: ${payload.location || "Not specified"}
- What changed recently: ${payload.whatChanged || "Not specified"}
- Urgency: ${payload.urgency || "Not specified"}
- Checked concerns: ${payload.checked.length ? payload.checked.join(", ") : "None"}
- Page context: ${payload.pageContext || "CareInMyCity Carl Care Quiz"}

Create Carl's response using the required JSON shape.
`;

  try {
    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 750,
        temperature: 0.35,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text();
      console.error("Anthropic error:", anthropicRes.status, errorText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          source: "fallback_after_api_error",
          response: fallbackResponse(payload)
        })
      };
    }

    const anthropicData = await anthropicRes.json();
    const textBlock = anthropicData.content && anthropicData.content.find(block => block.type === "text");
    const rawText = textBlock ? textBlock.text : "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error("Failed to parse Claude JSON:", rawText);
      parsed = fallbackResponse(payload);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "anthropic",
        response: parsed
      })
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: "fallback_after_exception",
        response: fallbackResponse(payload)
      })
    };
  }
};
