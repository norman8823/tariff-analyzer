// services/claudeService.js
const Anthropic = require('@anthropic-ai/sdk');

// Configure Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * Lists available Claude models
 * @returns {Promise<Array>} - Array of available model IDs
 */
const listAvailableModels = async () => {
  try {
    const models = await anthropic.models.list();
    console.log("Available Claude models:", models.data.map(m => m.id));
    return models.data.map(m => m.id);
  } catch (error) {
    console.error('Error listing Claude models:', error);
    return [];
  }
};

/**
 * Analyzes tariff news text using Claude API
 * @param {string} text - The news article text to analyze
 * @returns {Promise<{analysis: string}>}
 */
const analyzeTariffNews = async (text) => {
  // First, get available models
  let availableModels = [];
  try {
    availableModels = await listAvailableModels();
    console.log("Available models:", availableModels);
  } catch (error) {
    console.error("Error getting available models:", error);
  }

  // Choose a model from available models or use a fallback
  let modelToUse = "claude-3-7-sonnet-20250219"; // Updated default model
  
  // Try to find the most suitable model from available ones
  if (availableModels.includes("claude-3-7-sonnet-20250219")) {
    modelToUse = "claude-3-7-sonnet-20250219";
  } else if (availableModels.includes("claude-3-opus-20240229")) {
    modelToUse = "claude-3-opus-20240229";
  } else if (availableModels.includes("claude-3-5-sonnet-20240620")) {
    modelToUse = "claude-3-5-sonnet-20240620";
  } else if (availableModels.includes("claude-3-haiku-20240307")) {
    modelToUse = "claude-3-haiku-20240307";
  } else if (availableModels.length > 0) {
    // Use the first available model if none of our preferences are available
    modelToUse = availableModels[0];
  }

  console.log("Using model:", modelToUse);

  // Define the system message - this sets the overall behavior
  const systemMessage = `You are a financial analyst who specializes in turning complex tariff news into concise, insightful newsletter content with a conversational, slightly snarky tone. You never use bullet points or formal structured formats. You only analyze the specific tariff news provided and never hallucinate about interest rates or other topics not mentioned in the article.`;

  // The prompt instructions for the specific analysis task
  const promptInstructions = `You are a sharp-witted financial journalist writing for a prestigious newsletter read by sophisticated investors. 

Analyze the following information with these characteristics:

1. Use an accessible tone that explains complex financial concepts as if chatting with a smart friend over coffee
2. Incorporate dry wit and measured skepticism about market absurdities
3. Find the human stories and logical threads within financial developments
4. Use short paragraphs with a natural flow between ideas
5. Blend technical financial expertise with cultural references and everyday analogies
6. Occasionally use rhetorical questions to highlight irony or contradictions
7. End with a Key Takeaway: a sharp observation that ties everything together

Format: Ensure all text is left-justified only. Do not center any text or use other alignment formats.

Your analysis should feel sharp, witty, and insightful without being cynical. The tone should combine intellectual curiosity with a slightly bemused perspective on Wall Street's peculiarities. Your analysis should begin immediately with the financial content itself. Do not preface it with any introductory statements.

IMPORTANT: Write in a natural, conversational style - absolutely NO bullet points, NO section headers like "Part 1:", NO structured format with headings followed by lists.

News to analyze:
"""
${text}
"""`;

  try {
    // Call Claude API
    console.log(`Calling Claude API with model: ${modelToUse}`);
    const message = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 1000,
      system: systemMessage,
      messages: [
        {
          role: "user",
          content: promptInstructions
        }
      ]
    });

    console.log("Claude API response received successfully");
    return {
      analysis: message.content[0].text
    };
  } catch (error) {
    console.error('Claude API detailed error:', error);
    
    // If we couldn't get models or the model we selected still failed,
    // fall back to an error message
    if (availableModels.length === 0 || error.message.includes("not_found_error")) {
      console.log("Error Message");
      return {
        analysis: `# Analysis Failed 
        
We apologize, but we couldn't connect to our advanced analysis service at this time. Please try again later.


*This is an automatically generated message due to a service connection issue.*`
      };
    }
    
    throw new Error(`Failed to analyze text with Claude API: ${error.message}`);
  }
};

module.exports = {
  analyzeTariffNews,
  listAvailableModels
};