import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

// Proxy endpoint
app.get('/api/yaps', async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const response = await fetch(`https://api.kaito.ai/api/v1/yaps?username=${encodeURIComponent(username)}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Vite server
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Use Vite's middleware
app.use(vite.middlewares);

// Start server
const port = 5173;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});