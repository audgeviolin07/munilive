const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 4000;

// CORS middleware to allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint to proxy requests to Wolfram API
app.get('/wolfram', async (req, res) => {
  const apiKey = 'YOUR_WOLFRAM_API_KEY';  // Replace with your Wolfram Alpha API key
  const query = '3D blood pressure vs pain level';
  const wolframUrl = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=image,plaintext&output=JSON&appid=${apiKey}`;

  try {
    const response = await fetch(wolframUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Wolfram data:', error);
    res.status(500).send('Error fetching Wolfram data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
