import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.static("public")); // Serve frontend
app.use(express.json());

// Helper function to create VM (tries multiple regions)
async function createVM() {
  const regions = ["us-east", "us-west", "eu-west", "ap-southeast"];
  let lastError = null;

  for (const region of regions) {
    try {
      console.log(`🔄 Trying region: ${region}`);
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
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log(`✅ VM created in ${region}`);
      return data;
    } catch (err) {
      console.error(`❌ Failed in ${region}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All regions failed to create a VM");
}

// Endpoint for frontend to request a VM
app.post("/create-vm", async (req, res) => {
  try {
    const vm = await createVM();
    res.json(vm);
  } catch (err) {
    console.error("Error creating VM:", err.message);
    res.status(500).json({ error: "Failed to create Hyperbeam VM" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
