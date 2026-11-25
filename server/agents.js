
import Groq from "groq-sdk";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const agentRoles = [
  {
    name: "Budget Agent",
    focus: "Plan an economical trip with affordable transport, accommodation, food and attractions."
  },
  {
    name: "Adventure Agent",
    focus: "Prioritise outdoor activities and reasonably safe adventure experiences."
  },
  {
    name: "Scenic Agent",
    focus: "Prioritise nature, sightseeing, viewpoints and photography opportunities."
  },
  {
    name: "Comfort Agent",
    focus: "Prioritise comfortable travel, convenient locations, breaks and relaxed schedules."
  }
];

function extractJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned);
}

async function generateOneAgent(ai, agent, trip) {
  const prompt = `
You are the ${agent.name}, a travel planning specialist.

Your priority: ${agent.focus}

Plan a practical trip using:
Origin: ${trip.origin}
Destination: ${trip.destination}
Start date: ${trip.startDate}
End date: ${trip.endDate}
Budget per person INR: ${trip.budget}
Travellers: ${trip.travelers}
Interests: ${trip.interests}

Return ONLY valid JSON:
{
  "title": "Plan title",
  "summary": "Short explanation",
  "estimatedCostPerPerson": 12000,
  "costBreakdown": {
    "transport": 3000,
    "stay": 4000,
    "food": 2500,
    "activities": 1500,
    "other": 1000
  },
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "advantages": ["Advantage"],
  "tradeoffs": ["Trade-off"]
}

Use numeric INR estimates, not guaranteed prices.
Do not claim live availability or bookings.
Keep activities reasonably safe.
`;

  const completion = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a practical travel planner. Return valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.6,
    response_format: { type: "json_object" }
  });

  const plan = extractJson(
    completion.choices[0].message.content
  );

  const cost = Number(plan.estimatedCostPerPerson);

  if (!Number.isFinite(cost) || !Array.isArray(plan.days)) {
    throw new Error(`${agent.name} returned an invalid plan.`);
  }

  return {
    agent: agent.name,
    title: String(plan.title || `${agent.name} proposal`),
    summary: String(plan.summary || ""),
    estimatedCostPerPerson: cost,
    costBreakdown: plan.costBreakdown || {},
    days: plan.days,
    advantages: Array.isArray(plan.advantages) ? plan.advantages : [],
    tradeoffs: Array.isArray(plan.tradeoffs) ? plan.tradeoffs : []
  };
}

function scorePlan(plan, trip) {
  const budget = Number(trip.budget);
  const cost = Number(plan.estimatedCostPerPerson);

  const budgetFit = budget > 0
    ? Math.max(0, 100 - (Math.abs(cost - budget) / budget) * 100)
    : 0;

  const interestWords = String(trip.interests)
    .toLowerCase()
    .split(/[,; ]+/)
    .filter(word => word.length > 3);

  const planText = [
    plan.title,
    plan.summary,
    ...plan.days.flatMap(day => [day.title, ...(day.activities || [])])
  ].join(" ").toLowerCase();

  const matches = interestWords.filter(word =>
    planText.includes(word)
  ).length;

  const interestFit = interestWords.length
    ? Math.min(100, (matches / interestWords.length) * 100)
    : 50;

  const score = Math.round(
    budgetFit * 0.65 + interestFit * 0.35
  );

  return {
    ...plan,
    score,
    budgetFit: Math.round(budgetFit),
    interestFit: Math.round(interestFit)
  };
}

export async function createTravelPlans(trip) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to server/.env.");
  }

  const ai = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  // Generate proposals one at a time.
  const rawPlans = [];

  for (const agent of agentRoles) {
    const plan = await generateOneAgent(ai, agent, trip);
    rawPlans.push(plan);
  }

  const plans = rawPlans
    .map(plan => scorePlan(plan, trip))
    .sort((a, b) => b.score - a.score);

  return {
    plans,
    recommendation: plans[0],
    decisionExplanation:
      "Plans are ranked using 65% estimated budget fit and 35% interest matching. Costs are AI-generated estimates, not verified quotes."
  };
}
