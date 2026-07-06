const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

router.post('/', researchController.startResearch);

module.exports = router;
