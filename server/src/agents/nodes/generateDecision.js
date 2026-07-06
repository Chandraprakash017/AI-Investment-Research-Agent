const generateDecision = async (state) => {
  console.log(`[Node: generateDecision] Generating decision for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) {
    return { finalDecision: 'ERROR' };
  }

  const { factorScores, riskAnalysis, evidenceConfidence, evidence } = state;
  
  // Configuration Thresholds
  const CONFIDENCE_THRESHOLD = 60; // Need at least 60% confidence
  const INVESTMENT_SCORE_THRESHOLD = 7.0;
  
  // 1. Check Confidence
  if (evidenceConfidence < CONFIDENCE_THRESHOLD) {
    return {
      finalDecision: 'INSUFFICIENT EVIDENCE',
      investmentThesis: `There is not enough verifiable recent evidence to make a confident investment decision on ${state.companyName}. We require more sources and data coverage.`,
      sources: Array.from(new Set(evidence.map(e => e.source))).map(url => {
        const item = evidence.find(e => e.source === url);
        return { url, title: item.sourceTitle };
      })
    };
  }
  
  // 2. Calculate Weighted Investment Score
  // Business Quality: 25%, Financial Health: 25%, Growth Potential: 20%, Competitive Position: 15%, Risk: 15% (inverted)
  let overallScore = 0;
  overallScore += (factorScores.businessQuality.score * 0.25);
  overallScore += (factorScores.financialHealth.score * 0.25);
  overallScore += (factorScores.growthPotential.score * 0.20);
  overallScore += (factorScores.competitivePosition.score * 0.15);
  
  // Risk score is inverted (10 risk = 0 to score, 0 risk = 10 to score)
  const invertedRisk = 10 - riskAnalysis.riskLevel.score;
  overallScore += (invertedRisk * 0.15);
  
  overallScore = parseFloat(overallScore.toFixed(1));
  
  // 3. Make Decision
  let decision = 'PASS';
  if (overallScore >= INVESTMENT_SCORE_THRESHOLD && riskAnalysis.riskLevel.score < 8) {
    decision = 'INVEST';
  }
  
  // 4. Extract Top Signals and format data for frontend
  const positiveSignals = evidence
    .filter(e => e.signal === 'positive')
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
    .map(e => e.claim);
    
  const uniqueSources = Array.from(new Set(evidence.map(e => e.source))).map(url => {
    const item = evidence.find(e => e.source === url);
    return { url, title: item.sourceTitle || new URL(url).hostname };
  });

  // Since we don't strictly generate bull/bear/thesis in earlier nodes to save LLM calls, 
  // we do a final synthesis or use simple derivations. 
  // For a perfect portfolio project, we can do one final LLM call here to write the thesis, bull, and bear cases based on the decision.
  const { getLLM, parseJSONResponse } = require('../../services/llmService');
  const llm = getLLM(0.3);
  
  const prompt = `
You are the lead portfolio manager. Based on the analysis, write a brief investment thesis, bull case, bear case, and what could change this decision for ${state.companyName}.
Decision: ${decision}
Score: ${overallScore}/10

Business: ${factorScores.businessQuality.reasoning}
Financial: ${factorScores.financialHealth.reasoning}
Growth: ${factorScores.growthPotential.reasoning}
Competition: ${factorScores.competitivePosition.reasoning}
Risk: ${riskAnalysis.riskLevel.reasoning}

Output a JSON object with EXACTLY these keys:
- investmentThesis (string, 2-3 sentences explaining the ${decision})
- bullCase (string, 1-2 sentences on what could go right)
- bearCase (string, 1-2 sentences on what could go wrong)
- decisionTriggers (array of 2 strings, events that would make us change this rating)
`;

  let thesisData = {
    investmentThesis: `Based on an overall score of ${overallScore}/10, the recommendation is to ${decision}.`,
    bullCase: "Strong execution on current strategy.",
    bearCase: "Macroeconomic headwinds or execution failure.",
    decisionTriggers: ["Major earnings miss", "New competitor entering market"]
  };

  try {
    const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
    const response = await llm.invoke([
      new SystemMessage("You are a helpful AI assistant that outputs structured JSON."),
      new HumanMessage(prompt)
    ]);
    const parsed = parseJSONResponse(response.content);
    thesisData = { ...thesisData, ...parsed };
  } catch (error) {
    console.error("Failed to generate thesis via LLM, using fallback.", error);
  }

  return {
    finalDecision: decision,
    factorScores: { ...factorScores, overallScore },
    investmentThesis: thesisData.investmentThesis,
    bullCase: thesisData.bullCase,
    bearCase: thesisData.bearCase,
    decisionTriggers: thesisData.decisionTriggers,
    sources: uniqueSources,
    // Store overall score in factorScores object for easy retrieval or state modification
  };
};

module.exports = { generateDecision };
