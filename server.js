// server.js - Main Express server file - Modified for Enhanced Version

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

**Constraint:** Base all summaries and analysis strictly on the provided text. Do not invent information or provide external financial advice. The Sentiment Outlook is illustrative of potential market reaction based solely on this news snippet.

News Text:
"""
${text}
"""`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

// 4. News API integration (Enhanced version)
app.post('/api/fetch-news', checkJwt, async (req, res) => {
  try {
    const { keywords, fromDate, toDate } = req.body;
    const userId = req.auth.payload.sub;
    
    // Call to News API
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`;
    
    const newsResponse = await fetch(newsApiUrl);
    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news');
    }
    
    const newsData = await newsResponse.json();
    
    // Extract relevant article info and filter for tariff-related content
    const articles = newsData.articles
      .filter(article => {
        // Only include articles likely to be about tariffs
        const content = (article.title + ' ' + article.description).toLowerCase();
        return content.includes('tariff') || 
               content.includes('trade') || 
               content.includes('import tax') ||
               content.includes('export tax') ||
               content.includes('trade war') ||
               content.includes('trade policy') ||
               content.includes('trade dispute');
      })
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        content: article.content // Note: News API typically provides truncated content
      }));
    
    res.json({ articles });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});