const express = require('express');
const cors = require('cors');
const researchRoutes = require('./src/routes/researchRoutes');

const app = express();

const normalizeOrigin = (value) =>
  value ? value.trim().replace(/\/+$/, '') : '';

const allowedOrigins = [
  'http://localhost:5173',
  normalizeOrigin(process.env.CLIENT_URL)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error('[CORS] Blocked origin:', origin);
      console.error('[CORS] Allowed origins:', allowedOrigins);

      return callback(new Error('Not allowed by CORS'));
    }
  })
);

app.use(express.json());

app.use('/api/research', researchRoutes);

module.exports = app;
