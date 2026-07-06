const { performSearch } = require('../../services/searchService');

const collectResearch = async (state) => {
  console.log(`[Node: collectResearch] Collecting research for: ${state.companyName}`);
  
  if (state.errors && state.errors.length > 0) return state;
  if (!state.searchQueries || state.searchQueries.length === 0) {
    return { errors: [...(state.errors || []), 'No search queries generated.'] };
  }

  const rawResearch = [];
  
  try {
    // Run searches sequentially or in parallel. Parallel is faster.
    const searchPromises = state.searchQueries.map(query => performSearch(query, 3));
    const results = await Promise.all(searchPromises);
    
    results.forEach((resultSet, index) => {
      resultSet.forEach(item => {
        rawResearch.push({
          query: state.searchQueries[index],
          title: item.title,
          content: item.content,
          url: item.url,
          score: item.score
        });
      });
    });
    
    return { rawResearch };
  } catch (error) {
    console.error("Error in collectResearch:", error);
    return {
      errors: [...(state.errors || []), `collectResearch error: ${error.message}`]
    };
  }
};

module.exports = { collectResearch };
