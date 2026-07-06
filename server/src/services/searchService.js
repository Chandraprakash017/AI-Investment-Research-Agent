require('dotenv').config({ path: '../../.env' });

/**
 * Performs a web search using the Tavily API.
 * 
 * @param {string} query - The search query.
 * @param {number} maxResults - Max number of results to fetch.
 * @returns {Promise<Array>} - Array of search result objects { title, url, content, score }.
 */
const performSearch = async (query, maxResults = 5) => {
  try {
    if (!process.env.SEARCH_API_KEY) {
      throw new Error('SEARCH_API_KEY environment variable is missing.');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.SEARCH_API_KEY,
        query: query,
        search_depth: 'basic',
        include_images: false,
        include_answers: false,
        max_results: maxResults,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Tavily API error:', errText);
      throw new Error('Search API failed with status ' + response.status);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Search failed for query "${query}":`, error.message);
    return []; // Return empty array to avoid completely crashing the workflow on one bad search
  }
};

module.exports = {
  performSearch
};
