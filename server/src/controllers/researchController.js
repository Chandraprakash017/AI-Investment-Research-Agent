const startResearch = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'A valid company name is required.'
      });
    }

    const { investmentGraph } = require('../agents/investmentGraph');
    
    // Initial state
    const initialState = {
      companyName: companyName.trim()
    };

    // Run the graph
    const finalState = await investmentGraph.invoke(initialState);
    
    if (finalState.errors && finalState.errors.length > 0 && finalState.finalDecision !== 'INSUFFICIENT EVIDENCE') {
       return res.status(500).json({
         success: false,
         error: finalState.errors.join(', ')
       });
    }

    res.json({
      success: true,
      data: {
        companyName: finalState.companyName,
        decision: finalState.finalDecision,
        confidence: finalState.evidenceConfidence,
        overallScore: finalState.factorScores?.overallScore || 0,
        investmentThesis: finalState.investmentThesis,
        factorScores: finalState.factorScores,
        positiveSignals: finalState.evidence?.filter(e => e.signal === 'positive').map(e => e.claim).slice(0,5) || [],
        risks: finalState.riskAnalysis?.topRisks || [],
        bullCase: finalState.bullCase,
        bearCase: finalState.bearCase,
        decisionTriggers: finalState.decisionTriggers || [],
        evidence: finalState.evidence || [],
        sources: finalState.sources || []
      }
    });
  } catch (error) {
    console.error('Error starting research:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while starting research.'
    });
  }
};

module.exports = {
  startResearch
};
