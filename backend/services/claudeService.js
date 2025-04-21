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
  let modelToUse = "claude-3-opus-20240229"; // Default fallback
  
  // Try to find the most suitable model from available ones
  if (availableModels.includes("claude-3-opus-20240229")) {
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

  // Construct prompt for Claude
  const prompt = `You are a sharp-witted financial journalist writing for a prestigious newsletter read by sophisticated investors. 

Write a concise, insightful analysis of the following news text about tariffs. Your writing style should be professional but conversational, with a touch of measured snark where appropriate.

Format your response as a news article with:
1. A catchy headline at the top (use markdown # for the headline)
2. 4-5 flowing paragraphs that highlight key tariff implications
3. Bold text for important facts or developments (use markdown **bold text**)
4. A "Takeaway:" paragraph at the end with a slightly snarky conclusion about the broader implications
5. A brief disclaimer at the end in italics

Here's an example of the style I want:

# Tariff Policy Fears Trigger Capital Flight

**U.S. tariff uncertainty is causing significant capital flight** as wealthy individuals shift assets to Swiss financial institutions, seeking shelter from potential economic turbulence. This exodus signals growing skepticism about U.S. economic stability amidst muddled trade policy.

**Even Germany is eyeing gold repatriation** - never a good sign when your allies start calling in their precious metal reserves. This defensive posturing reflects deeper concerns about the ripple effects of U.S. trade decisions beyond immediate tariff targets.

**Financial institutions face the immediate fallout** as capital relocates to perceived safe havens. While no specific industries are directly mentioned as tariff targets, the uncertainty is creating collateral damage through declining investor confidence.

**The dollar is showing signs of weakness** as this exodus continues, with potential downstream effects for multiple sectors including tourism and research funding. The absence of clear policy direction is proving more damaging than actual tariffs.

**Takeaway:** What we're witnessing isn't just typical market nervousness but a vote of no confidence in U.S. economic leadership. The irony? These defensive financial maneuvers could create the very economic conditions policymakers are supposedly trying to prevent with tariff threats. Turns out uncertainty is the only thing that's been successfully imported.

*This analysis is based on news information only and does not constitute financial advice.*

News Text:
"""
${text}
"""

IMPORTANT: Write in a natural, conversational style - absolutely NO bullet points, NO section headers like "Part 1:", NO structured format with headings followed by lists.`;

  try {
    // Call Claude API
    console.log(`Calling Claude API with model: ${modelToUse}`);
    const message = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 1000,
      system: "You are a financial analyst who specializes in turning complex tariff news into concise, insightful newsletter content with a conversational, slightly snarky tone. You never use bullet points or formal structured formats.",
      messages: [
        {
          role: "user",
          content: prompt
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
    // fall back to a simple analysis without Claude
    if (availableModels.length === 0 || error.message.includes("not_found_error")) {
      console.log("Falling back to local analysis");
      return {
        analysis: `# Analysis Failed - Fallback Content
        
We apologize, but we couldn't connect to our advanced analysis service at this time. Here's a simple summary instead:

The article you selected discusses tariff implications that could affect various sectors of the economy. For a full analysis, please try again later or read the original article for more details.

*This is an automatically generated fallback message due to a service connection issue.*`
      };
    }
    
    throw new Error(`Failed to analyze text with Claude API: ${error.message}`);
  }
};

module.exports = {
  analyzeTariffNews,
  listAvailableModels
};