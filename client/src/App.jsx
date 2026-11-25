import { useMemo, useState } from "react";
import {
  Plane, MapPin, Bot, Hotel, LayoutDashboard, Sparkles,
  CheckCircle2, ExternalLink, RefreshCw, Wallet, Mountain,
  Camera, Heart, ArrowRight, LoaderCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const sampleHotels = [
  { name: "Mountain View Stay", area: "Example location near the town centre", price: 2500, facilities: "Wi-Fi · Restaurant · Viewpoint access" },
  { name: "Comfort Valley Hotel", area: "Example location near local transport", price: 3200, facilities: "Wi-Fi · Breakfast · Parking" },
  { name: "Nature Nest Retreat", area: "Example scenic-area listing", price: 4000, facilities: "Garden · Restaurant · Scenic views" }
];

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function App() {
  const [page, setPage] = useState("home");
  const [trip, setTrip] = useState({
    origin: "Bengaluru",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "20000",
    travelers: "2",
    interests: "nature, photography, sightseeing"
  });
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [simulationBudget, setSimulationBudget] = useState(20000);
  const [savedTrip, setSavedTrip] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tripverse-x-trip") || "null"); }
    catch { return null; }
  });

  const navItems = [
    ["home", "Home", Plane],
    ["planner", "AI trip planner", MapPin],
    ["agents", "Multi-agent room", Bot],
    ["simulation", "Simulation lab", Sparkles],
    ["hotels", "Hotel discovery", Hotel],
    ["dashboard", "My trips", LayoutDashboard]
  ];

  const simulation = useMemo(() => {
    const original = Number(trip.budget || 0);
    const difference = simulationBudget - original;
    if (simulationBudget < original * 0.75) {
      return {
        label: "Budget-conscious scenario",
        text: "Reduce paid activities, compare economical stays, prioritise nearby attractions and review transport choices."
      };
    }
    if (simulationBudget > original * 1.25) {
      return {
        label: "Comfort and experience scenario",
        text: "Consider a more convenient stay, add selected experiences and allow more flexibility in the daily schedule."
      };
    }
    return {
      label: "Balanced scenario",
      text: "Keep the main itinerary, balance paid and free activities, and retain a comfortable amount of downtime."
    };
  }, [simulationBudget, trip.budget]);

  function updateTrip(field, value) {
    setTrip(previous => ({ ...previous, [field]: value }));
  }

  async function generatePlans(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPlans([]);
    setSelected(null);

    try {
      const response = await fetch(`${API_BASE}/api/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create plans.");

      setPlans(data.plans || []);
      setSelected(data.recommendation || data.plans?.[0] || null);
      setSimulationBudget(Number(trip.budget));
      setPage("agents");
    } catch (err) {
      setError(`${err.message} Check that the backend is running and the API key is configured.`);
    } finally {
      setLoading(false);
    }
  }

  function confirmTrip() {
    if (!selected) {
      setError("Select a travel plan before confirming.");
      return;
    }
    const record = {
      ...trip,
      budget: Number(trip.budget),
      travelers: Number(trip.travelers),
      selectedPlan: selected,
      confirmedAt: new Date().toLocaleString(),
      bookingStatus: "Not booked"
    };
    localStorage.setItem("tripverse-x-trip", JSON.stringify(record));
    setSavedTrip(record);
    setPage("hotels");
    setError("");
  }

  function openHotelSearch(hotel) {
    const query = `${hotel.name} ${savedTrip?.destination || trip.destination}`;
    const url = `https://www.google.com/travel/hotels?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function updateBookingStatus(status) {
    if (!savedTrip) return;
    const updated = { ...savedTrip, bookingStatus: status };
    localStorage.setItem("tripverse-x-trip", JSON.stringify(updated));
    setSavedTrip(updated);
  }

  function startNewTrip() {
    setPlans([]);
    setSelected(null);
    setError("");
    setPage("planner");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>TripVerse <b>X</b></span></div>
        <p className="sidebar-caption">AI TRAVEL INTELLIGENCE</p>
        <nav>
          {navItems.map(([id, label, Icon]) => (
            <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-dot" /> Prototype environment
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <span>Plan smarter. Travel better.</span>
          <span className="topbar-pill"><span className="online-dot" /> AI planner ready</span>
        </header>

        {page === "home" && (
          <section className="hero page-pad">
            <div className="eyebrow"><Sparkles size={15}/> MULTI-AGENT TRAVEL PLANNING</div>
            <h1>Explore possibilities.<br/><span>Simulate experiences.</span><br/>Choose your journey.</h1>
            <p className="hero-copy">Four specialist AI perspectives help you create, compare and refine a travel plan that matches your budget and interests.</p>
            <button className="button button-primary" onClick={startNewTrip}>Start planning <ArrowRight size={17}/></button>
            <div className="feature-grid">
              <div className="feature-card"><Bot/><h3>Four AI agents</h3><p>Budget, Adventure, Scenic and Comfort perspectives.</p></div>
              <div className="feature-card"><RefreshCw/><h3>What-if simulation</h3><p>Explore how a budget change could affect your trip.</p></div>
              <div className="feature-card"><Hotel/><h3>Hotel discovery</h3><p>Continue to an external hotel search after confirming a plan.</p></div>
            </div>
          </section>
        )}

        {page === "planner" && (
          <section className="content page-pad">
            <div className="section-kicker">YOUR JOURNEY STARTS HERE</div>
            <h1>Plan your next journey</h1>
            <p className="muted">Share a few details. Your specialist agents will create different proposals.</p>
            <form className="panel form-grid" onSubmit={generatePlans}>
              <label>Starting location<input value={trip.origin} onChange={e => updateTrip("origin", e.target.value)} required placeholder="e.g. Bengaluru"/></label>
              <label>Destination<input value={trip.destination} onChange={e => updateTrip("destination", e.target.value)} required placeholder="e.g. Manali"/></label>
              <label>Start date<input type="date" value={trip.startDate} onChange={e => updateTrip("startDate", e.target.value)} required/></label>
              <label>End date<input type="date" value={trip.endDate} min={trip.startDate || undefined} onChange={e => updateTrip("endDate", e.target.value)} required/></label>
              <label>Budget per person (INR)<input type="number" min="1" value={trip.budget} onChange={e => updateTrip("budget", e.target.value)} required/></label>
              <label>Number of travellers<input type="number" min="1" max="20" value={trip.travelers} onChange={e => updateTrip("travelers", e.target.value)} required/></label>
              <label className="full-width">Interests<input value={trip.interests} onChange={e => updateTrip("interests", e.target.value)} placeholder="Nature, food, photography..." required/></label>
              {error && <div className="error-box full-width">{error}</div>}
              <button className="button button-primary full-width" disabled={loading}>
                {loading ? <><LoaderCircle className="spin" size={17}/> Agents are preparing plans...</> : <>Generate travel plans <Sparkles size={17}/></>}
              </button>
              <p className="form-note full-width">AI-generated costs are estimates. This prototype does not verify live fares, hotel availability or bookings.</p>
            </form>
          </section>
        )}

        {page === "agents" && (
          <section className="content page-pad">
            <div className="section-kicker">SPECIALIST PROPOSALS</div>
            <h1>Multi-Agent Room</h1>
            <p className="muted">Each agent receives the same trip details but follows a different planning priority.</p>
            {plans.length === 0 ? <EmptyState text="Generate a trip first to see agent proposals." action={() => setPage("planner")}/> : (
              <>
                <div className="agent-grid">
                  {plans.map(plan => (
                    <article className={`panel agent-card ${selected?.agent === plan.agent ? "chosen" : ""}`} key={plan.agent}>
                      <div className="agent-top"><span className="agent-icon"><Bot size={20}/></span><span className="score-pill">Score {plan.score}/100</span></div>
                      <p className="agent-name">{plan.agent}</p>
                      <h2>{plan.title}</h2>
                      <p className="muted">{plan.summary}</p>
                      <div className="cost-line">{money(plan.estimatedCostPerPerson)} <small>/ person (estimate)</small></div>
                      <div className="mini-metrics"><span>Budget fit <b>{plan.budgetFit}%</b></span><span>Interest fit <b>{plan.interestFit}%</b></span></div>
                      <button className={selected?.agent === plan.agent ? "button button-selected" : "button button-secondary"} onClick={() => setSelected(plan)}>
                        {selected?.agent === plan.agent ? "Selected plan" : "Select this plan"}
                      </button>
                    </article>
                  ))}
                </div>
                {selected && (
                  <div className="panel selected-panel">
                    <div><CheckCircle2 className="success-icon"/><h2>Selected: {selected.agent}</h2><p className="muted">{selected.summary}</p></div>
                    <div className="button-row">
                      <button className="button button-secondary" onClick={() => setPage("simulation")}>Open simulation</button>
                      <button className="button button-primary" onClick={confirmTrip}>Confirm this trip <ArrowRight size={16}/></button>
                    </div>
                    <p className="form-note">{selected.days?.length || 0} itinerary day(s) · Estimated per-person cost: {money(selected.estimatedCostPerPerson)}</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {page === "simulation" && (
          <section className="content page-pad">
            <div className="section-kicker">EXPLORE ALTERNATIVE FUTURES</div>
            <h1>Travel Simulation Lab</h1>
            <p className="muted">Change the budget to see a planning strategy preview. This is a rule-based demonstration, not a live repricing engine.</p>
            {!selected ? <EmptyState text="Generate and select a plan before using the simulator." action={() => setPage("planner")}/> : (
              <div className="panel simulation-panel">
                <div className="sim-heading"><div><span className="section-kicker">BUDGET WHAT-IF</span><h2>{money(simulationBudget)} <small>per person</small></h2></div><Wallet size={30}/></div>
                <input className="budget-slider" type="range" min="5000" max="60000" step="1000" value={simulationBudget} onChange={e => setSimulationBudget(Number(e.target.value))}/>
                <div className="slider-labels"><span>₹5,000</span><span>₹60,000</span></div>
                <div className="scenario-box"><span className="scenario-tag">{simulation.label}</span><p>{simulation.text}</p></div>
                <div className="comparison-row"><span>Original budget</span><b>{money(trip.budget)}</b></div>
                <div className="comparison-row"><span>New simulation budget</span><b>{money(simulationBudget)}</b></div>
                <div className="comparison-row"><span>Budget difference</span><b>{simulationBudget - Number(trip.budget) >= 0 ? "+" : "−"}{money(Math.abs(simulationBudget - Number(trip.budget)))}</b></div>
                <h3 className="subheading">Selected itinerary preview</h3>
                {selected.days?.map(day => <div className="day-row" key={day.day}><b>Day {day.day}: {day.title}</b><p>{(day.activities || []).join(" · ")}</p></div>)}
                <div className="button-row">
                  <button className="button button-secondary" onClick={() => setPage("agents")}>Back to proposals</button>
                  <button className="button button-primary" onClick={confirmTrip}>Confirm selected trip</button>
                </div>
              </div>
            )}
          </section>
        )}

        {page === "hotels" && (
          <section className="content page-pad">
            <div className="section-kicker">AFTER TRIP CONFIRMATION</div>
            <h1>Hotel discovery</h1>
            <p className="muted">These sample cards demonstrate the hand-off to an external booking search.</p>
            {!savedTrip ? <EmptyState text="Confirm a trip before viewing hotel suggestions." action={() => setPage("planner")}/> : (
              <>
                <div className="confirmed-banner"><CheckCircle2/><div><b>Trip plan saved</b><span>{savedTrip.destination} · {savedTrip.startDate} to {savedTrip.endDate}</span></div></div>
                <div className="hotel-grid">
                  {sampleHotels.map(hotel => (
                    <article className="panel hotel-card" key={hotel.name}>
                      <div className="hotel-art"><Hotel size={34}/></div>
                      <span className="sample-label">SAMPLE LISTING · NOT LIVE</span>
                      <h2>{hotel.name}</h2><p className="muted">{hotel.area}</p><p className="muted">{hotel.facilities}</p>
                      <div className="cost-line">{money(hotel.price)} <small>/ night · illustrative</small></div>
                      <button className="button button-primary" onClick={() => openHotelSearch(hotel)}>Search booking options <ExternalLink size={15}/></button>
                    </article>
                  ))}
                </div>
                <div className="panel booking-status-panel">
                  <h3>Update your booking status</h3>
                  <p className="muted">The external site handles the reservation. Return here and update this status yourself.</p>
                  <select value={savedTrip.bookingStatus || "Not booked"} onChange={e => updateBookingStatus(e.target.value)}>
                    <option>Not booked</option><option>Booked</option>
                  </select>
                </div>
              </>
            )}
          </section>
        )}

        {page === "dashboard" && (
          <section className="content page-pad">
            <div className="section-kicker">YOUR TRAVEL SPACE</div><h1>My Trips</h1>
            {!savedTrip ? <EmptyState text="No saved trip yet. Start planning to create your first trip." action={startNewTrip}/> : (
              <div className="panel dashboard-card">
                <div className="dashboard-top"><span className="confirmed-chip"><CheckCircle2 size={14}/> Plan confirmed</span><span className="muted">Saved {savedTrip.confirmedAt}</span></div>
                <h2>{savedTrip.origin} <ArrowRight size={18}/> {savedTrip.destination}</h2>
                <div className="dashboard-details">
                  <div><small>DATES</small><b>{savedTrip.startDate} – {savedTrip.endDate}</b></div>
                  <div><small>TRAVELLERS</small><b>{savedTrip.travelers}</b></div>
                  <div><small>BUDGET / PERSON</small><b>{money(savedTrip.budget)}</b></div>
                  <div><small>HOTEL STATUS</small><b>{savedTrip.bookingStatus || "Not booked"}</b></div>
                </div>
                <h3>{savedTrip.selectedPlan?.title}</h3>
                <p className="muted">{savedTrip.selectedPlan?.summary}</p>
                <div className="button-row"><button className="button button-secondary" onClick={() => setPage("hotels")}>View hotels</button><button className="button button-primary" onClick={startNewTrip}>Plan another trip</button></div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function EmptyState({ text, action }) {
  return <div className="panel empty-state"><MapPin size={27}/><p>{text}</p><button className="button button-primary" onClick={action}>Continue</button></div>;
}

export default App;
