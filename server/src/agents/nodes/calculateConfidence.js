const calculateConfidence = async (state) => {
  console.log(`[Node: calculateConfidence] Calculating confidence for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;

  let confidenceScore = 0;
  
  // 1. Quantity of useful evidence
  const evidenceCount = state.evidence ? state.evidence.length : 0;
  if (evidenceCount > 10) confidenceScore += 40;
  else if (evidenceCount > 5) confidenceScore += 25;
  else if (evidenceCount > 0) confidenceScore += 10;
  
  // 2. Number of distinct sources
  const sources = new Set(state.evidence ? state.evidence.map(e => new URL(e.source).hostname).filter(Boolean) : []);
  if (sources.size > 3) confidenceScore += 30;
  else if (sources.size > 1) confidenceScore += 15;
  
  // 3. Category coverage
  const categories = new Set(state.evidence ? state.evidence.map(e => e.category) : []);
  if (categories.size >= 4) confidenceScore += 30;
  else if (categories.size >= 2) confidenceScore += 15;
  
  // Cap at 100
  confidenceScore = Math.min(confidenceScore, 100);

  return { evidenceConfidence: confidenceScore };
};

module.exports = { calculateConfidence };
