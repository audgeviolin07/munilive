import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = 4000;

// CORS middleware to allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Root route ("/")
app.get('/', (req, res) => {
  res.send('Welcome to the Wolfram Proxy Server');
});

// Endpoint to proxy requests to Wolfram API
app.get('/wolfram', async (req, res) => {
  const apiKey = process.env.WOLFRAM_API_KEY;  // Get the API key from .env
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
