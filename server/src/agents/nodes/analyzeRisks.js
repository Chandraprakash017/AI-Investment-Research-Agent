const { getLLM, parseJSONResponse } = require('../../services/llmService');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const analyzeRisks = async (state) => {
  console.log(`[Node: analyzeRisks] Analyzing risks for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;
  if (!state.evidence || state.evidence.length === 0) return state;

  const llm = getLLM(0.2);
  
  // Filter for negative or risk-related evidence to help the LLM focus
  const riskEvidence = state.evidence.filter(e => e.category === 'risk' || e.signal === 'negative');
  const evidenceText = riskEvidence.length > 0 
    ? JSON.stringify(riskEvidence, null, 2)
    : JSON.stringify(state.evidence, null, 2);

  const prompt = `
Analyze the risks for ${state.companyName} based ONLY on the provided evidence.

Evidence:
${evidenceText}

Output a JSON object with a single key "riskAnalysis". 
Inside, include:
- riskLevel: An object with "score" (number from 0 to 10, where 10 means extremely HIGH risk, and 0 means VERY LOW risk) and "reasoning" (short string).
- topRisks: An array of strings describing the most critical risks found in the evidence.

Example:
{
  "riskAnalysis": {
    "riskLevel": { "score": 7, "reasoning": "High debt load and increasing competition." },
    "topRisks": ["Dependency on a single product line", "Ongoing regulatory lawsuit"]
  }
}
`;

  try {
    const response = await llm.invoke([
      new SystemMessage("You are a helpful AI assistant that outputs structured JSON."),
      new HumanMessage(prompt)
    ]);
    
    const parsed = parseJSONResponse(response.content);
    
    if (!parsed.riskAnalysis) {
      throw new Error("LLM did not return 'riskAnalysis'.");
    }
    
    return { riskAnalysis: parsed.riskAnalysis };
  } catch (error) {
    console.error("Error in analyzeRisks:", error);
    return {
      errors: [...(state.errors || []), `analyzeRisks error: ${error.message}`]
    };
  }
};

module.exports = { analyzeRisks };
