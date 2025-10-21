import fetch from "node-fetch";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Supported regions
const regions = ["us-east", "us-west", "eu-west", "ap-southeast"];

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    console.log("=== Shadow VM Launcher ===");

    // Prompt for API key
    const apiKey = (await question("Enter your Hyperbeam API key (sk_live_...): ")).trim();
    if (!apiKey) throw new Error("API key is required.");

    // Show region options
    console.log("Select a region:");
    regions.forEach((r, i) => console.log(`${i + 1}. ${r}`));
    let regionIndex = parseInt(await question("Enter number (default 1): ")) || 1;
    if (regionIndex < 1 || regionIndex > regions.length) regionIndex = 1;
    const region = regions[regionIndex - 1];

    console.log(`Creating VM in region: ${region} ...`);

    // Create VM
    const resp = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ region }),
    });

    const text = await resp.text();

    if (!resp.ok) {
      throw new Error(`Hyperbeam API error: ${text}`);
    }

    const data = JSON.parse(text);
    if (!data.embed_url) throw new Error("No embed_url returned from Hyperbeam");

    console.log("\n✅ VM created successfully!");
    console.log(`Session ID: ${data.session_id}`);
    console.log(`Embed URL: ${data.embed_url}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    rl.close();
  }
}

main();
