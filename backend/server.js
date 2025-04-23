// server.js (run separately using `node server.js`)
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());


const candidates = Array.from({ length: 123 }).map((_, i) => ({
    id: i + 1,
    name: `Candidate ${i + 1}`,
    email: `candidate${i + 1}@example.com`,
    position: ["Frontend Dev", "Backend Dev", "Designer"][i % 3],
    status: ["Applied", "Interview", "Rejected", "Selected"][i % 4]
  }));
  
  app.get("/api/candidates", (req, res) => {
    const page = parseInt(req.query.page || "1", 10);
    const size = parseInt(req.query.size || "10", 10);
    const start = (page - 1) * size;
    const paginatedItems = candidates.slice(start, start + size);
    res.json({ items: paginatedItems, total: candidates.length });
  });

app.get("/api/countries", (req, res) => {
    res.json([
      { code: "IN", description: "India" },
      { code: "US", description: "United States" },
      { code: "AU", description: "Australia" }
    ]);
  });
  
app.get("/api/states", (req, res) => {
    res.json([
        { code: "MH", description: "Maharashtra", countryCode: "IN" },
        { code: "KA", description: "Karnataka", countryCode: "IN" },
        { code: "NY", description: "New York", countryCode: "US" },
        { code: "CA", description: "California", countryCode: "US" },
        { code: "NSW", description: "New South Wales", countryCode: "AU" },
        { code: "VIC", description: "Victoria", countryCode: "AU" }
    ]);
});

app.post("/api/inventory", (req, res) => {
  console.log("CREATE Inventory:", req.body);
  res.json({ success: true, id: Math.floor(Math.random() * 1000) });
});

app.put("/api/inventory/:id", (req, res) => {
  console.log("UPDATE Inventory:", req.params.id, req.body);
  res.json({ success: true });
});

app.delete("/api/inventory/:id", (req, res) => {
  console.log("DELETE Inventory:", req.params.id);
  res.json({ success: true });
});


// Mock remote validator
app.get("/api/validate/email", (req, res) => {
  const { value } = req.query;
  if (value === "admin@example.com") {
    res.json({ valid: false, message: "Email already taken" });
  } else {
    res.json({ valid: true });
  }
});

// Mock item lookup
app.get("/api/items/lookup", (req, res) => {
  res.json([
    { code: "ITM001", description: "Screwdriver" },
    { code: "ITM002", description: "Hammer" },
    { code: "ITM003", description: "Wrench" }
  ]);
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Mock API running at http://localhost:${PORT}`));
