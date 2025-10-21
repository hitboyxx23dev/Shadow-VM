import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend

// Create VM helper with dynamic region and API key
async function createVM(apiKey, region = "us-east") {
  if (!apiKey) throw new Error("API key is required");

  try {
    const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ region }),
    });

    const text = await response.text();

    if (!response.ok) throw new Error(`Hyperbeam API error: ${text}`);

    const data = JSON.parse(text);
    if (!data.embed_url) throw new Error("No embed_url returned from Hyperbeam");

    return data;
  } catch (err) {
    console.error("Error creating VM:", err.message);
    throw err;
  }
}

// API: create VM
app.post("/api/create-vm", async (req, res) => {
  const { apiKey, area } = req.body;
  const region = area || "us-east";

  try {
    const vm = await createVM(apiKey, region);
    res.json(vm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
