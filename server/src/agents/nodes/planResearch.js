const { getLLM, parseJSONResponse } = require('../../services/llmService');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const planResearch = async (state) => {
  console.log(`[Node: planResearch] Planning research for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;

  const llm = getLLM(0.2);
  const prompt = `
You are an expert investment researcher. Plan a focused web research strategy for the company: ${state.companyName}.
Generate exactly 4-5 high-quality Google search queries to gather comprehensive information about:
1. Business model and revenue sources
2. Recent financial performance and growth
3. Industry competitors and market position
4. Major risks, controversies, or negative news

Output ONLY a JSON array of strings, where each string is a search query.
Example: ["Apple business model revenue breakdown", "Apple recent earnings report growth", "Apple top competitors market share", "Apple major risks lawsuits"]
`;

  try {
    const response = await llm.invoke([
      new SystemMessage("You are a helpful AI assistant that outputs JSON."),
      new HumanMessage(prompt)
    ]);
    
    const queries = parseJSONResponse(response.content);
    
    if (!Array.isArray(queries)) {
      throw new Error("LLM did not return an array of queries.");
    }
    
    return { searchQueries: queries };
  } catch (error) {
    console.error("Error in planResearch:", error);
    return {
      errors: [...(state.errors || []), `planResearch error: ${error.message}`]
    };
  }
};

module.exports = { planResearch };
