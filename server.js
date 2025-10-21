import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend if needed

// Helper: create a Hyperbeam VM
async function createVM(apiKey, region = "us-east") {
  if (!apiKey) throw new Error("API key is required");

  try {
    console.log("📡 Creating VM in region:", region);

    const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ region }),
    });

    const text = await response.text();
    console.log("📝 Hyperbeam raw response:", text);

    if (!response.ok) {
      throw new Error(`Hyperbeam API error: ${text}`);
    }

    const data = JSON.parse(text);
    if (!data.embed_url) throw new Error("No embed_url returned from Hyperbeam");

    console.log("✅ VM created with embed_url:", data.embed_url);
    return data;
  } catch (err) {
    console.error("❌ Error creating VM:", err.message);
    throw err;
  }
}

// API route to create VM
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

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
