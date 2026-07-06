const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

/**
 * Initializes the LLM.
 * We use Gemini 3.1 Flash Lite via the @langchain/google-genai integration.
 */
const getLLM = (temperature = 0.2) => {
  if (!process.env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY environment variable is missing.');
  }
  return new ChatGoogleGenerativeAI({
    model: 'gemini-3.1-flash-lite',
    apiKey: process.env.LLM_API_KEY,
    temperature: temperature,
  });
};

/**
 * Parses JSON reliably from a model's markdown response (stripping ```json blocks).
 */
const parseJSONResponse = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse LLM JSON response:', text);
    throw new Error('Invalid JSON format from LLM.');
  }
};

module.exports = {
  getLLM,
  parseJSONResponse
};
