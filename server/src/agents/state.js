const { Annotation } = require('@langchain/langgraph');

const StateAnnotation = Annotation.Root({
  companyName: Annotation(),
  searchQueries: Annotation(),
  rawResearch: Annotation(),
  evidence: Annotation(),
  factorScores: Annotation(),
  riskAnalysis: Annotation(),
  evidenceConfidence: Annotation(),
  finalDecision: Annotation(),
  investmentThesis: Annotation(),
  bullCase: Annotation(),
  bearCase: Annotation(),
  decisionTriggers: Annotation(),
  sources: Annotation(),
  errors: Annotation(),
});

module.exports = {
  StateAnnotation
};
