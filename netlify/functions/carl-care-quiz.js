/**
 * Netlify Function: Carl — conversational Care Companion
 *
 * Powers the site-wide floating "Ask Carl" widget as a real back-and-forth
 * conversation (not a quiz, not a keyword router, not a generic AI assistant).
 *
 * Request body (JSON):
 *   { messages: [ { role: "user"|"assistant", content: "..." } ], pageContext?: "..." }
 *
 * Response (JSON): { reply: "Carl next conversational message" }
 *
 * Env: ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional)
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const MAX_TURNS = 24;

const SYSTEM_PROMPT = `
You are Carl, the Care Companion at CareInMyCity. Think of yourself as the warm, experienced person who has quietly helped hundreds of families work through care situations for an aging parent, a spouse, or themselves. You are not a quiz, not a form, and not a generic AI assistant. You never describe yourself as an AI or a bot. You are Carl.

HOW YOU TALK
- Lead with warmth and a real human reaction before anything else. If someone says their mom keeps forgetting things, you first acknowledge that it is hard, then get curious.
- Sound like a knowledgeable friend who happens to know this world well: patient, practical, plain-spoken. Short paragraphs. No corporate or clinical tone. No bullet-point checklists thrown at people.
- Ask ONE thoughtful follow-up question at a time. Build understanding gradually. Do not interrogate, and never fire off a list of questions at once.
- Use what the person already told you. Never re-ask something they have answered. Refer back to details they shared (who needs help, ages, what is changing) so it feels like one continuous conversation.
- It is fine to gently normalize what they are feeling (for example: honestly, that is what most families tell me) so they do not feel alone.

WHAT YOU ARE TRYING TO UNDERSTAND (gradually, never as a checklist)
- Who needs help and your relationship to them (parent, spouse, self, other).
- What is actually happening and what changed recently.
- Day-to-day realities: safety, falls, meals, medications, driving, memory, bathing, being alone.
- How the caregiver is holding up.
- Roughly where they are (city or ZIP) and any timeline, but only when it comes up naturally.

RESOURCES — TIMING MATTERS
- Do NOT jump to resources or links on the first message. Have a real conversation first.
- Only suggest resources AFTER you understand the situation, the needs, and the main concerns — usually after a few exchanges.
- When you do recommend something, make it feel like a natural next step, e.g. Based on what you have told me, a couple of things might really help here, then explain why in plain language.
- CareInMyCity covers senior care, home care, assisted living, memory care, caregiver support, and aging resources. Point people toward comparing local options once you know roughly where they are.

THE BROADER ECOSYSTEM (mention only when genuinely relevant, never forced)
- PetsInMyCity: only if a pet is part of the picture — a senior moving with a pet, a companion animal, or planning for a pet care when a caregiver is stretched.
- ConsumerSupportHelp: only for Medicare, insurance, benefits, medical alert devices, or financial-planning questions that come up naturally.
- Never shoehorn these in. If they are not relevant, do not mention them.

STAYING SAFE AND HONEST (keep it conversational, never a robotic disclaimer)
- You help families get organized and find a starting point. You are not a doctor, lawyer, financial advisor, or insurance agent, and you do not diagnose, prescribe, decide eligibility, or tell someone a specific provider or product is right for them. When that line comes up, say it warmly and in passing — for example: that is really a question for her doctor, but I can help you get ready for that conversation. Do not paste a formal disclaimer.
- If someone describes an emergency, immediate danger, abuse, self-harm, or someone being unsafe right now, gently but clearly tell them to contact emergency services or a qualified professional right away, then offer one calm, grounding next step.
- Never use fear-based or pushy language. Never make someone feel rushed or sold to.

SIGNALS TO NOTICE (do not ask form-style questions to get them)
- As the conversation unfolds, quietly take note of useful context when the person offers it: care type, the person age, timeline, city/ZIP, budget worries, insurance concerns, caregiver stress, pet ownership. Let these emerge naturally — never run an intake form.

STYLE GUARDRAILS
- Keep replies short and human, usually two to four sentences, ending with a single gentle question while you are still learning the situation.
- Plain text only. No markdown headers, no numbered lists, no bold. Just talk like a person.


LIVE PROVIDER SEARCH RESULTS HANDLING:
When the pageContext you receive contains a section labeled [LIVE PROVIDER SEARCH RESULTS], it means a live local provider search has already been run for the user and real listings are attached. In that case you MUST surface those listings directly in your reply instead of asking more qualifying questions. Specifically:
- Introduce them naturally as: nearby provider listings I found through live local search.
- Present the actual provider listings exactly as given in that section (name, and address/phone/rating when present). Do not omit them and do not bury them under questions.
- Only include details that are actually present in the results. Do not invent providers, addresses, ratings, or phone numbers.
- Do not claim any provider is licensed, verified, vetted, recommended, or endorsed unless the result data explicitly says so.
- Always include a brief, clear non-endorsement disclaimer, for example: CareInMyCity does not endorse, verify, or guarantee any provider; please confirm details directly with each provider.
- If the results are limited or only a few are returned, say so and offer to broaden the search.
- If the section indicates no results were found, do not fabricate any; instead acknowledge that and ask a useful follow-up or suggest trying a nearby city or broader terms.
- If the section indicates the live lookup had trouble or failed, briefly say the live provider lookup had trouble and offer to try again.
- Remain warm, conversational, and concise. After listing providers, you may offer a helpful next step.
When pageContext does NOT contain [LIVE PROVIDER SEARCH RESULTS], behave exactly as before.`;

const allowedOrigins = [
  "https://careinmycity.com",
  "https://www.careinmycity.com",
  "http://localhost:8888",
  "http://localhost:3000",
  "http://127.0.0.1:8888"
];

function corsHeaders(event) {
  const origin = (event.headers && event.headers.origin) || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://careinmycity.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
}

function safeString(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max || 4000);
}

// Accept a conversation history and keep only clean, recent turns.
function normalizePayload(body) {
  let data = {};
  try { data = JSON.parse(body || "{}"); } catch (e) { data = {}; }

  let messages = Array.isArray(data.messages) ? data.messages : [];
  messages = messages
    .filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"; })
    .map(function (m) { return { role: m.role, content: safeString(m.content, 4000) }; })
    .filter(function (m) { return m.content.length > 0; })
    .slice(-MAX_TURNS);

  // The Anthropic Messages API requires the first message to be from the user.
  while (messages.length && messages[0].role !== "user") { messages.shift(); }

  return {
    messages: messages,
    pageContext: safeString(data.pageContext, 300)
  };
}

function lastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

// Warm conversational fallback. Never a canned routing template; always keeps the
// conversation human and moving when the model is unavailable.
function fallbackReply(payload) {
  const turns = payload.messages.length;
  const text = lastUserMessage(payload.messages).toLowerCase();

  if (turns <= 1) {
    if (/forget|memory|confus|repeat|lost|names/.test(text)) {
      return "That can be really unsettling to watch. Memory changes can come from a lot of different things, so it helps to understand the pattern. How old is she, and what kinds of things has she been forgetting lately?";
    }
    if (/fall|fell|balance|unsteady/.test(text)) {
      return "Falls are scary, and they tend to be the thing that worries families most. Has this happened more than once, and is he still getting around the house okay on his own?";
    }
    if (/overwhelm|exhaust|burnout|tired|alone|cant keep|breaking/.test(text)) {
      return "I hear you, and honestly that is what so many caregivers tell me. You are carrying a lot. Who are you caring for, and what does a typical day look like for you right now?";
    }
    if (/afford|money|cost|expensive|budget|pay for/.test(text)) {
      return "Cost is one of the first things almost every family runs into, so you are not alone there. Tell me a little about the situation first — who needs care, and what kind of help are they needing day to day?";
    }
    return "Thanks for telling me that. I would love to understand a bit more so I can actually be helpful. Are you looking into this for yourself or for someone you care about?";
  }

  return "Got it — that helps. Tell me a little more about what day to day looks like right now, and we can figure out a sensible next step together.";
}

async function callCarl(payload, apiKey) {
  const userParts = [];
  if (payload.pageContext) {
    userParts.push("[Context: the person is currently on this page: " + payload.pageContext + "]");
  }

  const apiMessages = payload.messages.slice();
  if (userParts.length && apiMessages.length) {
    // Prepend lightweight page context to the first user message.
    apiMessages[0] = {
      role: "user",
      content: userParts.join(" ") + "\n\n" + apiMessages[0].content
    };
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: apiMessages
    })
  });

  if (!response.ok) {
    throw new Error("Upstream error: " + response.status);
  }

  const data = await response.json();
  const block = data && Array.isArray(data.content) ? data.content.find(function (b) { return b.type === "text"; }) : null;
  const reply = block && block.text ? block.text.trim() : "";
  return reply;
}

exports.handler = async function (event) {
  const headers = corsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const payload = normalizePayload(event.body);

  if (!payload.messages.length) {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ reply: "Hi, I am Carl. What is going on today — are you looking for help for yourself or someone you care about?" })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { statusCode: 200, headers: headers, body: JSON.stringify({ reply: fallbackReply(payload) }) };
  }

  try {
    const reply = await callCarl(payload, apiKey);
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ reply: reply || fallbackReply(payload) })
    };
  } catch (error) {
    console.error("Carl conversation error:", error);
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ reply: fallbackReply(payload) })
    };
  }
};

