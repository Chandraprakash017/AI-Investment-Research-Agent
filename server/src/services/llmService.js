const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
require('dotenv').config({ path: '../../.env' });

/**
 * Initializes the LLM.
 * We use Gemini 1.5 Flash or Pro via the @langchain/google-genai integration.
 */
const getLLM = (temperature = 0.2) => {
  if (!process.env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY environment variable is missing.');
  }
  return new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-flash',
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
