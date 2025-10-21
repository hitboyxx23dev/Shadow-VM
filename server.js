import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Helper: create VM in specified or fallback region
async function createVM(region = "us-east") {
  try {
    console.log(`🛰️ Creating Hyperbeam VM in region: ${region}`);
    const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HYPERBEAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ region }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Hyperbeam API error: ${text}`);
    }

    const data = await response.json();
    if (!data.embed_url) throw new Error("Missing embed_url in Hyperbeam response");
    console.log(`✅ VM created: ${data.session_id}`);
    return data;
  } catch (err) {
    console.error("❌ createVM error:", err.message);
    throw err;
  }
}

// API: create VM (with optional region)
app.post("/api/create-vm", async (req, res) => {
  const { area } = req.body; // e.g. { "area": "eu-west" }
  const region = area || "us-east"; // fallback

  try {
    const vm = await createVM(region);
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
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
