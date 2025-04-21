// routes/analysis.js
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const Analysis = require('../models/Analysis');
const { analyzeTariffNews } = require('../services/claudeService');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// POST /api/analyze - Analyze text
router.post('/analyze', checkJwt, async (req, res) => {
  try {
    const { title, text } = req.body;
    const userId = req.auth.payload.sub;
    
    // Call Claude analysis service
    const result = await analyzeTariffNews(text);
    
    // Store in MongoDB
    const analysis = new Analysis({
      userId,
      title,
      inputText: text,
      analysis: result.analysis,
      timestamp: new Date()
    });
    
    await analysis.save();
    
    // Return the analysis results
    res.json({
      analysis: result.analysis,
      analysisId: analysis._id
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});


// GET /api/analyses - Get all analyses for the current user
router.get('/analyses', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const analyses = await Analysis.find({ userId })
      .sort({ timestamp: -1 })
      .select('title timestamp _id');
    
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// GET /api/analyses/:id - Get a specific analysis by ID
router.get('/analyses/:id', checkJwt, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Check if the analysis belongs to the current user
    if (analysis.userId !== req.auth.payload.sub) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

module.exports = router;