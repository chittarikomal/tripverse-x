import "dotenv/config";
import express from "express";
import cors from "cors";
import { createTravelPlans } from "./agents.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "TripVerse X API" });
});

app.post("/api/plan", async (req, res) => {
  try {
    const { origin, destination, startDate, endDate, budget, travelers, interests } = req.body || {};

    if (![origin, destination, startDate, endDate, interests].every(
      value => typeof value === "string" && value.trim()
    )) {
      return res.status(400).json({ error: "Please complete all text fields." });
    }

    const numericBudget = Number(budget);
    const numericTravelers = Number(travelers);

    if (!Number.isFinite(numericBudget) || numericBudget < 1) {
      return res.status(400).json({ error: "Budget must be a positive number." });
    }
    if (!Number.isInteger(numericTravelers) || numericTravelers < 1 || numericTravelers > 20) {
      return res.status(400).json({ error: "Travellers must be a whole number from 1 to 20." });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: "End date must be on or after start date." });
    }

    const result = await createTravelPlans({
      origin: origin.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: numericBudget,
      travelers: numericTravelers,
      interests: interests.trim()
    });

    res.json(result);
  } catch (error) {
    console.error("POST /api/plan failed:", error);
    res.status(500).json({
      error: error.message || "Could not generate plans. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`TripVerse X API running at http://localhost:${PORT}`);
});
