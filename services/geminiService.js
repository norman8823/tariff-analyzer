// services/geminiService.js - MVP
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes tariff news text using Gemini API
 * @param {string} text - The news article text to analyze
 * @returns {Promise<{tariffSummary: string, sentimentOutlook: string}>}
 */
const analyzeTariffNews = async (text) => {
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

  try {
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();
    
    // Split the response into tariff summary and sentiment outlook
    const parts = analysisText.split('**Part 2:');
    const tariffSummary = parts[0] || 'Analysis failed';
    const sentimentOutlook = parts.length > 1 ? '**Part 2:' + parts[1] : 'Analysis failed';
    
    return {
      tariffSummary,
      sentimentOutlook
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze text with Gemini API');
  }
};

module.exports = {
  analyzeTariffNews
};