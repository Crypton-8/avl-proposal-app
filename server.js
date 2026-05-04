import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.default.config();
}

console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.slice(0, 10));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));
    res.json(data);

  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});