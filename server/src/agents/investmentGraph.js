const { StateGraph, START, END } = require('@langchain/langgraph');
const { StateAnnotation } = require('./state');

// Import Nodes
const { validateCompany } = require('./nodes/validateCompany');
const { planResearch } = require('./nodes/planResearch');
const { collectResearch } = require('./nodes/collectResearch');
const { extractEvidence } = require('./nodes/extractEvidence');
const { analyzeFactors } = require('./nodes/analyzeFactors');
const { analyzeRisks } = require('./nodes/analyzeRisks');
const { calculateConfidence } = require('./nodes/calculateConfidence');
const { generateDecision } = require('./nodes/generateDecision');

// Build the Graph
const workflow = new StateGraph(StateAnnotation)
  .addNode('validateCompany', validateCompany)
  .addNode('planResearch', planResearch)
  .addNode('collectResearch', collectResearch)
  .addNode('extractEvidence', extractEvidence)
  .addNode('analyzeFactors', analyzeFactors)
  .addNode('analyzeRisks', analyzeRisks)
  .addNode('calculateConfidence', calculateConfidence)
  .addNode('generateDecision', generateDecision);

// Edges
workflow.addEdge(START, 'validateCompany');
workflow.addEdge('validateCompany', 'planResearch');
workflow.addEdge('planResearch', 'collectResearch');
workflow.addEdge('collectResearch', 'extractEvidence');
workflow.addEdge('extractEvidence', 'analyzeFactors');
workflow.addEdge('analyzeFactors', 'analyzeRisks');
workflow.addEdge('analyzeRisks', 'calculateConfidence');
workflow.addEdge('calculateConfidence', 'generateDecision');
workflow.addEdge('generateDecision', END);

// Compile Graph
const investmentGraph = workflow.compile();

module.exports = { investmentGraph };
