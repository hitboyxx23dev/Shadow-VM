const path = require('path');
const express = require('express');
const axios = require('axios');
const app = express();

// ⚠️ Embed your API key here directly
// Example: const apiKey = "sk-your-secret-hyperbeam-key";
const apiKey = "sk_live_-XD9guvfeDWscPj8SuA8LJfsdfGg1-cVpJQMZZ4wmtY"; // Replace this with your actual API key

if (!apiKey || apiKey === "") {
  console.error("API Key is not set! Please insert your Hyperbeam API key directly into the code.");
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Get a cloud computer object. If no object exists, create it.
let computer;
app.get('/computer', async (req, res) => {
  try {
    if (computer) {
      res.send(computer);
      return;
    }

    const resp = await axios.post(
      'https://engine.hyperbeam.com/v0/vm',
      {},
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    computer = resp.data;
    res.send(computer);
  } catch (error) {
    console.error('Error fetching/creating computer:', error.message);
    res.status(500).send({ error: 'Failed to fetch or create computer instance.' });
  }
});

app.listen(8080, () => {
  console.log('Server started at http://localhost:8080');
});
