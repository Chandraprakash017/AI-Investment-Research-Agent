const { getLLM, parseJSONResponse } = require('../../services/llmService');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const analyzeFactors = async (state) => {
  console.log(`[Node: analyzeFactors] Analyzing factors for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;
  if (!state.evidence || state.evidence.length === 0) {
    // If no evidence, skip to confidence calculation where it will trigger INSUFFICIENT EVIDENCE
    return state;
  }

  const llm = getLLM(0.2);
  
  const evidenceText = JSON.stringify(state.evidence, null, 2);

  const prompt = `
Analyze the following evidence for ${state.companyName} and score these four investment factors:
1. Business Quality
2. Financial Health
3. Growth Potential
4. Competitive Position

Evidence:
${evidenceText}

Output a JSON object with a single key "factorScores". 
Inside, include an object for each factor with exactly these keys:
- score (number from 0 to 10)
- reasoning (short string explaining the score based ONLY on the evidence)

Example:
{
  "factorScores": {
    "businessQuality": { "score": 8, "reasoning": "Strong diversified revenue model." },
    "financialHealth": { "score": 9, "reasoning": "Solid margins and cash flow." },
    "growthPotential": { "score": 7, "reasoning": "Moderate growth in established markets." },
    "competitivePosition": { "score": 8, "reasoning": "Market leader with wide moat." }
  }
}
`;

  try {
    const response = await llm.invoke([
      new SystemMessage("You are a helpful AI assistant that outputs structured JSON."),
      new HumanMessage(prompt)
    ]);
    
    const parsed = parseJSONResponse(response.content);
    
    if (!parsed.factorScores) {
      throw new Error("LLM did not return 'factorScores'.");
    }
    
    return { factorScores: parsed.factorScores };
  } catch (error) {
    console.error("Error in analyzeFactors:", error);
    return {
      errors: [...(state.errors || []), `analyzeFactors error: ${error.message}`]
    };
  }
};

module.exports = { analyzeFactors };
