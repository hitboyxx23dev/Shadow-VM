import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import open from "open"; // optional: auto-open embed_url in browser

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend if needed

// Helper: create VM
async function createVM(apiKey, region = "us-east") {
  if (!apiKey) throw new Error("API key is required");

  const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ region }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Hyperbeam API error: ${text}`);
  }

  const data = JSON.parse(text);
  if (!data.embed_url) throw new Error("No embed_url returned from Hyperbeam");

  return data;
}

// API route to create VM
app.post("/api/create-vm", async (req, res) => {
  const { apiKey, area } = req.body;
  const region = area || "us-east";

  try {
    const vm = await createVM(apiKey, region);

    // Optionally, automatically open in browser (VPS only if GUI exists)
    // await open(vm.embed_url);

    res.json(vm);
  } catch (err) {
    console.error("Error creating VM:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
