const { getLLM, parseJSONResponse } = require('../../services/llmService');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const extractEvidence = async (state) => {
  console.log(`[Node: extractEvidence] Extracting evidence for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;
  if (!state.rawResearch || state.rawResearch.length === 0) {
    return { errors: [...(state.errors || []), 'No research collected.'] };
  }

  const llm = getLLM(0.2);
  
  // Condense research slightly to avoid token limits if it's too large
  const researchText = state.rawResearch.map((r, i) => 
    `[Source ${i+1}]: URL: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`
  ).join('\n\n');

  const prompt = `
You are a meticulous financial analyst. Your job is to extract factual evidence from the raw web research provided below about the company: ${state.companyName}.
Only extract facts. Do NOT invent information.

Research:
${researchText}

Output a JSON object with a single key "evidence" which is an array of objects. 
Each object must have exactly these fields:
- claim (string): The factual claim
- category (string): Must be one of ["business", "financial", "growth", "competition", "risk", "news"]
- source (string): The URL of the source
- sourceTitle (string): The Title of the source
- signal (string): Must be one of ["positive", "negative", "neutral"]
- relevanceScore (number): 1 to 10 rating how relevant this is to an investment decision

Example:
{
  "evidence": [
    {
      "claim": "Apple's Services revenue grew 14% year-over-year in Q1.",
      "category": "financial",
      "source": "https://example.com/apple-earnings",
      "sourceTitle": "Apple Q1 Earnings Report",
      "signal": "positive",
      "relevanceScore": 9
    }
  ]
}
`;

  try {
    const response = await llm.invoke([
      new SystemMessage("You are a helpful AI assistant that outputs structured JSON."),
      new HumanMessage(prompt)
    ]);
    
    const parsed = parseJSONResponse(response.content);
    
    if (!parsed.evidence || !Array.isArray(parsed.evidence)) {
      throw new Error("LLM did not return an 'evidence' array.");
    }
    
    return { evidence: parsed.evidence };
  } catch (error) {
    console.error("Error in extractEvidence:", error);
    return {
      errors: [...(state.errors || []), `extractEvidence error: ${error.message}`]
    };
  }
};

module.exports = { extractEvidence };
