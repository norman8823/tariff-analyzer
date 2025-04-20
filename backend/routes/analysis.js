// routes/analysis.js - MVP
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const Analysis = require('../models/Analysis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// Configure Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/analyze - Analyze text
router.post('/analyze', checkJwt, async (req, res) => {
  try {
    const { title, text } = req.body;
    const userId = req.auth.payload.sub;
    
    // Construct prompt for Gemini
    const prompt = `You are an expert Financial Analyst Assistant specializing in trade policy impacts. Analyze the following news text regarding tariffs.

**Part 1: Summarize the Tariff News**
Extract and summarize the key information under these headings:
*   **Tariff Action(s):** [Specific tariffs mentioned, rates, status like proposed/implemented]
*   **Countries/Regions Involved:** [List countries/blocs imposing or targeted by tariffs]
*   **Affected Industries/Products:** [List specific sectors or goods mentioned]
*   **Stated Economic Impacts/Consequences:** [Summarize any effects mentioned in the text, e.g., price increases, retaliation, supply chain disruption]

**Part 2: Investment Sentiment Outlook (Illustrative)**
Based *only* on the impacts and information presented *in this text*, analyze the potential short-term investment sentiment outlook for the primary Industries/Products identified above.
*   **Overall Sentiment:** [Classify as: Positive, Negative, Neutral, or Mixed/Uncertain]
*   **Justification:** [Provide a brief (1-2 sentence) explanation for the sentiment classification, referencing specific points from the text. Example: 'Negative sentiment due to potential for increased input costs and retaliatory tariffs mentioned.']
*   **Affected Sectors Mentioned:** [Re-list the key sectors identified]

**Constraint:** Base all summaries and analysis strictly on the provided text. Do not invent information or provide external financial advice. The Sentiment Outlook is illustrative of potential market reaction based solely on this news snippet.

News Text:
"""
${text}
"""`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();
    
    // Split the response into tariff summary and sentiment outlook
    // This is a simple split - you may need more sophisticated parsing
    const parts = analysisText.split('**Part 2:');
    const tariffSummary = parts[0] || 'Analysis failed';
    const sentimentOutlook = parts.length > 1 ? '**Part 2:' + parts[1] : 'Analysis failed';
    
    // Store in MongoDB
    const analysis = new Analysis({
      userId,
      title,
      inputText: text,
      tariffSummary,
      sentimentOutlook,
      timestamp: new Date()
    });
    
    await analysis.save();
    
    // Return the analysis results
    res.json({
      tariffSummary,
      sentimentOutlook,
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