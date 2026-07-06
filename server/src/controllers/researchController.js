const startResearch = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'A valid company name is required.'
      });
    }

    // Mock response for Phase 2, will integrate LangGraph in Phase 5
    res.json({
      success: true,
      data: {
        companyName: companyName.trim(),
        message: 'Research started (mocked)',
        decision: 'PENDING'
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
