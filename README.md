# TripVerse X — full-stack starter

A student-friendly AI travel-planning prototype with:
- Four specialist AI planning roles (Budget, Adventure, Scenic, Comfort)
- A deterministic Decision Agent that scores and ranks their plans
- A rule-based what-if budget simulator
- Example hotel cards and external hotel-search links
- A local trip dashboard using browser localStorage

## Requirements
- Node.js 20+ (Node.js 22 LTS recommended)
- A Google Gemini API key from https://aistudio.google.com/apikey
- VS Code or another editor

## 1. Open the project
Extract the ZIP. Open the `tripverse-x` folder in VS Code.

## 2. Configure the backend
Open a terminal:

```bash
cd server
npm install
```

Copy `.env.example` to `.env`, then paste your Gemini API key into `GEMINI_API_KEY`.

Never put the API key in `client/` and never commit `.env`.

## 3. Start the backend
In the `server` terminal:

```bash
npm run dev
```

Expected message:
`TripVerse X API running at http://localhost:5000`

Test the health endpoint by opening http://localhost:5000/api/health.

## 4. Configure and start the frontend
Open a SECOND terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL Vite prints (normally http://localhost:5173).

## 5. Try the demo
Use a destination such as Manali, set a budget, choose interests, and press **Generate plans**.
Select one of the four proposals, open the simulation, change the budget, and confirm the trip.
The hotel cards are clearly marked as examples. Their buttons open an external Google Hotels search; they do not book a room or verify availability.

## Project files
- `server/server.js`: Express API and input validation
- `server/agents.js`: four Gemini role prompts and Decision Agent scoring
- `client/src/App.jsx`: React pages and interactions
- `client/src/App.css`: responsive styling
- `.env.example`: environment-variable template

## Important prototype limitations
1. Hotel prices and hotel names in this demo are illustrative sample data, not live inventory.
2. The external link opens a search page. It does not reserve or pay for a hotel.
3. Trip costs from the AI are estimates, not verified quotes.
4. The Decision Agent currently uses a transparent score based on budget fit and interest matching. It is not a separate LLM.
5. The simulation gives a rule-based preview. It does not claim to recalculate live transport, weather, or inventory.
6. For a public deployment, configure CORS for your real frontend domain, add rate limiting and authentication, validate API usage, and use a secure database.

## Troubleshooting
- `GEMINI_API_KEY is missing`: check that `server/.env` exists and contains the key.
- `404 model not found`: check the model name and available models for your API key in Google's current Gemini documentation. The default in this project is `gemini-2.5-flash`.
- `429`: you have reached an API quota/rate limit. Wait or check your Google AI Studio quota.
- Frontend cannot connect: make sure the backend is running on port 5000.
- Port already in use: change `PORT` in `server/.env` and update `VITE_API_BASE_URL` in `client/.env`.

## Useful docs
- Gemini API: https://ai.google.dev/gemini-api/docs
- Google Gen AI SDK for JavaScript: https://github.com/googleapis/js-genai
- React: https://react.dev/learn
- Vite: https://vite.dev/guide/
- Express: https://expressjs.com/
