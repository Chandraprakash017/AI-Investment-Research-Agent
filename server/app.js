const express = require('express');
const cors = require('cors');
const researchRoutes = require('./src/routes/researchRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    }
  })
);

app.use(express.json());

app.use('/api/research', researchRoutes);

module.exports = app;
