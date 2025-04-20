// server.js - Main Express server file - Enhanced Version
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Auth0 configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB schema for analysis results
const analysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Analysis'
  },
  inputText: {
    type: String,
    required: true
  },
  tariffSummary: {
    type: String,
    required: true
  },
  sentimentOutlook: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Configure Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.use('/api', newsRoutes);  // News API routes

// 1. Analyze text route
app.post('/api/analyze', checkJwt, async (req, res) => {
  try {
    const { title, text } = req.body;
    const userId = req.auth.payload.sub;
    
    // Construct prompt for Gemini
    const prompt = `You are an expert Financial Analyst Assistant specializing in trade policy impacts. Analyze the following news text regarding tariffs.

**Part 1: Summarize the Tariff News**
Extract and summarize the key information using concise bullet points under these headings:
*   **Tariff Action(s):** [Specific tariffs mentioned, rates, status like proposed/implemented]
*   **Countries/Regions Involved:** [List countries/blocs imposing or targeted by tariffs]
*   **Affected Industries/Products:** [List specific sectors or goods mentioned]
*   **Stated Economic Impacts/Consequences:** [Summarize any effects mentioned in the text, e.g., price increases, retaliation, supply chain disruption]

**Part 2: Investment Sentiment Outlook (Illustrative)**
Based *only* on the impacts and information presented *in this text*, analyze the potential short-term investment sentiment outlook for the primary Industries/Products identified above.
*   **Overall Sentiment:** [Classify as: Positive, Negative, Neutral, or Mixed/Uncertain]
*   **Justification:** [Provide a brief (1-2 sentence) explanation for the sentiment classification, referencing specific points from the text. Example: 'Negative sentiment due to potential for increased input costs and retaliatory tariffs mentioned.']
*   **Affected Sectors Mentioned:** [Re-list the key sectors identified]

News Text:
"""
${text}
"""`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();
    
    // Parse the analysis text to extract sections
    const tariffSummary = analysisText.split('**Part 2:')[0].trim();
    const sentimentOutlook = analysisText.split('**Part 2:')[1].trim();
    
    // Save to MongoDB
    const analysis = new Analysis({
      userId,
      title: title || 'Untitled Analysis',
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

// 2. Get user's previous analyses
app.get('/api/analyses', checkJwt, async (req, res) => {
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

// 3. Get a specific analysis by ID
app.get('/api/analyses/:id', checkJwt, async (req, res) => {
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

// Add a MongoDB connection test endpoint
app.get('/api/test-mongo', async (req, res) => {
  try {
    // Check if we can connect to MongoDB
    if (mongoose.connection.readyState === 1) {
      res.json({ 
        status: 'connected', 
        message: 'MongoDB connection is working',
        database: mongoose.connection.name
      });
    } else {
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      res.json({ 
        status: 'not fully connected', 
        message: `MongoDB connection state: ${states[mongoose.connection.readyState]}`,
        readyState: mongoose.connection.readyState 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
