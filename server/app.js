const express = require('express');
const cors = require('cors');
const researchRoutes = require('./src/routes/researchRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/research', researchRoutes);

module.exports = app;
