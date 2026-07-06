const validateCompany = async (state) => {
  console.log(`[Node: validateCompany] Validating input for: ${state.companyName}`);
  
  let { companyName } = state;
  
  if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
    return {
      errors: ['Invalid company name provided.']
    };
  }
  
  return {
    companyName: companyName.trim()
  };
};

module.exports = { validateCompany };
